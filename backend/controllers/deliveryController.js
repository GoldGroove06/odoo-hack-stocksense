import prisma from "../config/prisma.js";
import {
  assertAvailable,
  applyOutReserved,
  getQuantQuantity,
  releaseReservation,
  reserveStock,
  withStockTransaction
} from "../services/stockService.js";

async function generateDeliveryReference(warehouseId) {
  let whCode = "WH";
  if (warehouseId) {
    const wh = await prisma.warehouse.findUnique({ where: { id: Number(warehouseId) } });
    if (wh && wh.shortcode) whCode = wh.shortcode;
  }
  const count = await prisma.delivery.count();
  const nextId = String(count + 1).padStart(3, "0");
  return `${whCode}/OUT/${nextId}`;
}

const deliveryInclude = {
  customer: true,
  warehouse: true,
  sourceLocation: true,
  items: {
    include: {
      product: {
        include: {
          stockQuants: true
        }
      }
    }
  },
  transfers: true
};

async function resolveSourceLocationId(txOrPrisma, delivery) {
  let locationId = delivery.sourceLocationId;
  if (!locationId && delivery.warehouseId) {
    const loc = await txOrPrisma.location.findFirst({
      where: { warehouseId: delivery.warehouseId }
    });
    locationId = loc?.id || null;
  }
  return locationId;
}

/** Fail early if any line exceeds free qty at source location */
async function assertItemsAvailable(tx, items, locationId) {
  if (!locationId) {
    const err = new Error("Delivery needs a sourceLocationId before checking stock");
    err.status = 400;
    throw err;
  }
  // Aggregate demand per product (multiple lines of same SKU)
  const demand = new Map();
  for (const item of items) {
    const productId = item.productId ? Number(item.productId) : null;
    const qty = Number(item.quantity) || 0;
    if (!productId || qty <= 0) continue;
    demand.set(productId, (demand.get(productId) || 0) + qty);
  }
  for (const [productId, qty] of demand) {
    await assertAvailable(tx, productId, locationId, qty);
  }
}

function enrichDeliveryAvailability(delivery) {
  if (!delivery) return delivery;
  const locationId = delivery.sourceLocationId;
  const items = (delivery.items || []).map((item) => {
    const quants = item.product?.stockQuants || [];
    const atSource = locationId
      ? quants.find((q) => q.locationId === locationId)
      : null;
    const quantity = atSource?.quantity ?? 0;
    const reservedQty = atSource?.reservedQty ?? 0;
    const freeQty = Math.max(0, quantity - reservedQty);
    return {
      ...item,
      availableQty: freeQty,
      onHandAtSource: quantity,
      reservedAtSource: reservedQty
    };
  });
  return { ...delivery, items };
}

export const getAllDeliveries = async (req, res) => {
  try {
    const { search, status, customerId, warehouseId } = req.query;
    const where = {};
    if (status && status !== "ALL") where.status = status;
    if (customerId) where.customerId = Number(customerId);
    if (warehouseId) where.warehouseId = Number(warehouseId);
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { reference: { contains: q, mode: "insensitive" } },
        { destination: { contains: q, mode: "insensitive" } },
        { carrier: { contains: q, mode: "insensitive" } },
        { trackingNumber: { contains: q, mode: "insensitive" } },
        { vehicleNumber: { contains: q, mode: "insensitive" } },
        { responsible: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { contactPerson: { contains: q, mode: "insensitive" } } }
      ];
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: deliveryInclude,
      orderBy: { id: "desc" }
    });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries.map(enrichDeliveryAvailability)
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ success: false, message: "Failed to fetch deliveries", error: error.message });
  }
};

export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: Number(req.params.id) },
      include: deliveryInclude
    });
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery order not found" });
    }
    res.status(200).json({ success: true, data: enrichDeliveryAvailability(delivery) });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    res.status(500).json({ success: false, message: "Failed to fetch delivery", error: error.message });
  }
};

export const createDelivery = async (req, res) => {
  try {
    const {
      reference,
      status = "draft",
      scheduledDate,
      destination,
      responsible = "Rohit Maurya",
      carrier = "Internal Logistics",
      trackingNumber,
      vehicleNumber,
      sourceDocument,
      customerNotes,
      subtotal = 0,
      taxRate = 18,
      taxAmount = 0,
      totalAmount = 0,
      customerId,
      warehouseId,
      sourceLocationId,
      moNumber,
      items = []
    } = req.body;

    if (status === "done") {
      return res.status(400).json({
        success: false,
        message: "Use validate endpoint to complete a delivery"
      });
    }

    let calculatedSubtotal = 0;
    const itemsData = items.map((item) => {
      const qty = Number(item.quantity) || 1;
      const cost = Number(item.unitCost) || 0;
      const total = Number(item.totalPrice) || qty * cost;
      calculatedSubtotal += total;
      return {
        productId: item.productId ? Number(item.productId) : null,
        name: item.name || "Unnamed Item",
        sku: item.sku || null,
        quantity: qty,
        deliveredQty: 0,
        unitCost: cost,
        totalPrice: total,
        unit: item.unit || "Units"
      };
    });

    const locId = sourceLocationId ? Number(sourceLocationId) : null;
    if (locId && itemsData.some((i) => i.productId)) {
      await withStockTransaction(async (tx) => {
        await assertItemsAvailable(tx, itemsData, locId);
      });
    }

    const finalSubtotal = subtotal > 0 ? Number(subtotal) : calculatedSubtotal;
    const finalTax = taxAmount > 0 ? Number(taxAmount) : (finalSubtotal * Number(taxRate)) / 100;
    const finalTotal = totalAmount > 0 ? Number(totalAmount) : finalSubtotal + finalTax;

    const delivery = await prisma.delivery.create({
      data: {
        reference: reference || (await generateDeliveryReference(warehouseId)),
        status: status === "in_progress" || status === "ready" ? "draft" : status,
        scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
        destination,
        responsible,
        carrier,
        trackingNumber,
        vehicleNumber,
        sourceDocument,
        customerNotes,
        subtotal: finalSubtotal,
        taxRate: Number(taxRate),
        taxAmount: finalTax,
        totalAmount: finalTotal,
        customerId: customerId ? Number(customerId) : null,
        warehouseId: warehouseId ? Number(warehouseId) : null,
        sourceLocationId: locId,
        moNumber,
        items: { create: itemsData }
      },
      include: deliveryInclude
    });

    res.status(201).json({
      success: true,
      message: "Delivery order created successfully",
      data: enrichDeliveryAvailability(delivery)
    });
  } catch (error) {
    console.error("Error creating delivery:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to create delivery"
    });
  }
};

export const updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      scheduledDate,
      destination,
      responsible,
      carrier,
      trackingNumber,
      vehicleNumber,
      sourceDocument,
      customerNotes,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      customerId,
      warehouseId,
      sourceLocationId,
      moNumber,
      items
    } = req.body;

    const existing = await prisma.delivery.findUnique({
      where: { id: Number(id) },
      include: { items: true }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Delivery order not found" });
    }
    if (existing.status === "done") {
      return res.status(400).json({ success: false, message: "Completed deliveries cannot be edited" });
    }
    if (status === "done") {
      return res.status(400).json({
        success: false,
        message: "Use POST /deliveries/:id/validate to complete a delivery"
      });
    }
    // Cancel: release reservations if already picked/packed
    if (status === "cancelled") {
      const cancelled = await withStockTransaction(async (tx) => {
        const delivery = await tx.delivery.findUnique({
          where: { id: Number(id) },
          include: { items: true }
        });
        const locationId = await resolveSourceLocationId(tx, delivery);
        if (
          locationId &&
          (delivery.status === "in_progress" || delivery.status === "ready")
        ) {
          for (const item of delivery.items) {
            if (!item.productId) continue;
            await releaseReservation(tx, {
              productId: item.productId,
              locationId,
              qty: Number(item.quantity) || 0
            });
          }
        }
        return tx.delivery.update({
          where: { id: Number(id) },
          data: { status: "cancelled" },
          include: deliveryInclude
        });
      });
      return res.status(200).json({
        success: true,
        message: "Delivery cancelled; reserved stock released",
        data: enrichDeliveryAvailability(cancelled)
      });
    }

    // Do not allow editing lines once reserved (pick started)
    if (
      (existing.status === "in_progress" || existing.status === "ready") &&
      (Array.isArray(items) || sourceLocationId !== undefined)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot change items or source location after pick; cancel and recreate"
      });
    }

    const updateData = {};
    if (status !== undefined && status !== "cancelled") updateData.status = status;
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate;
    if (destination !== undefined) updateData.destination = destination;
    if (responsible !== undefined) updateData.responsible = responsible;
    if (carrier !== undefined) updateData.carrier = carrier;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (vehicleNumber !== undefined) updateData.vehicleNumber = vehicleNumber;
    if (sourceDocument !== undefined) updateData.sourceDocument = sourceDocument;
    if (customerNotes !== undefined) updateData.customerNotes = customerNotes;
    if (subtotal !== undefined) updateData.subtotal = Number(subtotal);
    if (taxRate !== undefined) updateData.taxRate = Number(taxRate);
    if (taxAmount !== undefined) updateData.taxAmount = Number(taxAmount);
    if (totalAmount !== undefined) updateData.totalAmount = Number(totalAmount);
    if (customerId !== undefined) updateData.customerId = customerId ? Number(customerId) : null;
    if (warehouseId !== undefined) updateData.warehouseId = warehouseId ? Number(warehouseId) : null;
    if (sourceLocationId !== undefined) {
      updateData.sourceLocationId = sourceLocationId ? Number(sourceLocationId) : null;
    }
    if (moNumber !== undefined) updateData.moNumber = moNumber;

    let nextItems = existing.items;
    if (Array.isArray(items)) {
      nextItems = items.map((item) => ({
        productId: item.productId ? Number(item.productId) : null,
        name: item.name || "Unnamed Item",
        sku: item.sku || null,
        quantity: Number(item.quantity) || 1,
        deliveredQty: Number(item.deliveredQty) || 0,
        unitCost: Number(item.unitCost) || 0,
        totalPrice:
          Number(item.totalPrice) ||
          (Number(item.quantity) || 1) * (Number(item.unitCost) || 0),
        unit: item.unit || "Units"
      }));
      await prisma.deliveryItem.deleteMany({ where: { deliveryId: Number(id) } });
      updateData.items = { create: nextItems };
    }

    const locId =
      sourceLocationId !== undefined
        ? sourceLocationId
          ? Number(sourceLocationId)
          : null
        : existing.sourceLocationId;

    if (locId && nextItems.some((i) => i.productId)) {
      await withStockTransaction(async (tx) => {
        await assertItemsAvailable(tx, nextItems, locId);
      });
    }

    const updated = await prisma.delivery.update({
      where: { id: Number(id) },
      data: updateData,
      include: deliveryInclude
    });

    res.status(200).json({
      success: true,
      message: "Delivery order updated successfully",
      data: enrichDeliveryAvailability(updated)
    });
  } catch (error) {
    console.error("Error updating delivery:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update delivery"
    });
  }
};

export const deleteDelivery = async (req, res) => {
  try {
    const existing = await prisma.delivery.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: true }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Delivery order not found" });
    }
    if (existing.status === "done") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a completed delivery"
      });
    }

    await withStockTransaction(async (tx) => {
      const locationId = await resolveSourceLocationId(tx, existing);
      if (
        locationId &&
        (existing.status === "in_progress" || existing.status === "ready")
      ) {
        for (const item of existing.items) {
          if (!item.productId) continue;
          await releaseReservation(tx, {
            productId: item.productId,
            locationId,
            qty: Number(item.quantity) || 0
          });
        }
      }
      await tx.delivery.delete({ where: { id: Number(req.params.id) } });
    });

    res.status(200).json({
      success: true,
      message: `Delivery "${existing.reference}" deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ success: false, message: "Failed to delete delivery", error: error.message });
  }
};

/** Pick: reserve free stock so it cannot be sold twice */
export const pickDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await withStockTransaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: Number(id) },
        include: { items: { include: { product: true } } }
      });
      if (!delivery) {
        const err = new Error("Delivery order not found");
        err.status = 404;
        throw err;
      }
      if (delivery.status === "done") {
        const err = new Error("Delivery already completed");
        err.status = 400;
        throw err;
      }
      if (delivery.status === "cancelled") {
        const err = new Error("Delivery is cancelled");
        err.status = 400;
        throw err;
      }
      if (delivery.status === "in_progress" || delivery.status === "ready") {
        const err = new Error("Delivery already picked / reserved");
        err.status = 400;
        throw err;
      }

      const locationId = await resolveSourceLocationId(tx, delivery);
      if (!locationId) {
        const err = new Error("Delivery needs sourceLocationId before pick");
        err.status = 400;
        throw err;
      }

      await assertItemsAvailable(tx, delivery.items, locationId);

      for (const item of delivery.items) {
        const qty = Number(item.quantity) || 0;
        if (!item.productId || qty <= 0) continue;
        await reserveStock(tx, {
          productId: item.productId,
          locationId,
          qty,
          productName: item.product?.name || item.name
        });
      }

      return tx.delivery.update({
        where: { id: Number(id) },
        data: { status: "in_progress", sourceLocationId: locationId },
        include: deliveryInclude
      });
    });

    res.status(200).json({
      success: true,
      message: `Delivery ${updated.reference} picked — stock reserved`,
      data: enrichDeliveryAvailability(updated)
    });
  } catch (error) {
    console.error("Error recording pick:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to record pick"
    });
  }
};

/** Pack: re-check reserved stock still physically present; mark ready */
export const packDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await withStockTransaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: Number(id) },
        include: { items: { include: { product: true } }, sourceLocation: true }
      });
      if (!delivery) {
        const err = new Error("Delivery order not found");
        err.status = 404;
        throw err;
      }
      if (delivery.status === "done") {
        const err = new Error("Delivery already completed");
        err.status = 400;
        throw err;
      }
      if (delivery.status === "cancelled") {
        const err = new Error("Delivery is cancelled");
        err.status = 400;
        throw err;
      }

      const locationId = await resolveSourceLocationId(tx, delivery);
      if (!locationId) {
        const err = new Error("Delivery needs sourceLocationId");
        err.status = 400;
        throw err;
      }

      // If not yet picked, pick+reserve first
      if (delivery.status === "draft") {
        await assertItemsAvailable(tx, delivery.items, locationId);
        for (const item of delivery.items) {
          const qty = Number(item.quantity) || 0;
          if (!item.productId || qty <= 0) continue;
          await reserveStock(tx, {
            productId: item.productId,
            locationId,
            qty,
            productName: item.product?.name || item.name
          });
        }
      }

      // Physical on-hand must still cover reserved qty
      for (const item of delivery.items) {
        const qty = Number(item.quantity) || 0;
        if (!item.productId || qty <= 0) continue;
        const quant = await tx.stockQuant.findUnique({
          where: {
            productId_locationId: { productId: item.productId, locationId }
          }
        });
        const onHand = quant?.quantity || 0;
        if (onHand < qty) {
          const err = new Error(
            `Insufficient stock for ${item.product?.name || item.name}: need ${qty}, on hand ${onHand}`
          );
          err.status = 400;
          throw err;
        }
      }

      return tx.delivery.update({
        where: { id: Number(id) },
        data: {
          status: "ready",
          sourceLocationId: locationId
        },
        include: deliveryInclude
      });
    });

    res.status(200).json({
      success: true,
      message: `Delivery ${updated.reference} marked Ready`,
      data: enrichDeliveryAvailability(updated)
    });
  } catch (error) {
    console.error("Error recording pack:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to record pack"
    });
  }
};

/** Validate: ship only what is on hand (no BOM invent). Releases reservation + decreases qty. */
export const validateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ? Number(req.user.userId) : null;

    const updatedDelivery = await withStockTransaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: Number(id) },
        include: {
          items: { include: { product: true } },
          warehouse: true,
          customer: true,
          sourceLocation: true
        }
      });
      if (!delivery) {
        const err = new Error("Delivery order not found");
        err.status = 404;
        throw err;
      }
      if (delivery.status === "done") {
        const err = new Error("Delivery is already completed and dispatched");
        err.status = 400;
        throw err;
      }
      if (delivery.status === "cancelled") {
        const err = new Error("Delivery is cancelled");
        err.status = 400;
        throw err;
      }

      const locationId = await resolveSourceLocationId(tx, delivery);
      if (!locationId) {
        const err = new Error("Delivery needs sourceLocationId");
        err.status = 400;
        throw err;
      }

      const wasReserved =
        delivery.status === "in_progress" || delivery.status === "ready";

      // Draft validate: check free stock without prior reservation
      if (!wasReserved) {
        await assertItemsAvailable(tx, delivery.items, locationId);
      }

      for (const item of delivery.items) {
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;

        let productId = item.productId;
        let product = item.product;
        if (!productId && item.sku) {
          product = await tx.product.findUnique({ where: { sku: item.sku } });
          productId = product?.id || null;
        }
        if (!productId) {
          const err = new Error(`Delivery line "${item.name}" has no product — cannot ship`);
          err.status = 400;
          throw err;
        }

        await applyOutReserved(tx, {
          productId,
          locationId,
          qty,
          unit: item.unit || "Units",
          productName: item.name,
          sku: item.sku,
          reason: `Delivery Dispatch (${delivery.reference})`,
          responsible: delivery.responsible,
          userId,
          documentType: "DELIVERY",
          documentId: delivery.id,
          reference: delivery.reference,
          wasReserved
        });

        await tx.deliveryItem.update({
          where: { id: item.id },
          data: { deliveredQty: qty, productId }
        });
      }

      return tx.delivery.update({
        where: { id: Number(id) },
        data: { status: "done", sourceLocationId: locationId },
        include: deliveryInclude
      });
    });

    res.status(200).json({
      success: true,
      message: `Delivery ${updatedDelivery.reference} validated and dispatched. Stock decreased.`,
      data: enrichDeliveryAvailability(updatedDelivery)
    });
  } catch (error) {
    console.error("Error validating delivery:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to validate delivery"
    });
  }
};
