import prisma from "../config/prisma.js";

// Helper to generate reference: <Warehouse>/OUT/<PaddedID> (e.g. WH/OUT/001)
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

// GET /deliveries
export const getAllDeliveries = async (req, res) => {
  try {
    const { search, status, customerId, warehouseId } = req.query;

    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (customerId) {
      where.customerId = Number(customerId);
    }
    if (warehouseId) {
      where.warehouseId = Number(warehouseId);
    }
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
      include: {
        customer: true,
        warehouse: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { id: "desc" }
    });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ success: false, message: "Failed to fetch deliveries", error: error.message });
  }
};

// GET /deliveries/:id
export const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        warehouse: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery order not found" });
    }

    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    res.status(500).json({ success: false, message: "Failed to fetch delivery", error: error.message });
  }
};

// POST /deliveries
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
      moNumber,
      items = []
    } = req.body;

    const finalReference = reference || (await generateDeliveryReference(warehouseId));

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
        deliveredQty: Number(item.deliveredQty) || (status === "done" ? qty : 0),
        unitCost: cost,
        totalPrice: total,
        unit: item.unit || "Units"
      };
    });

    const finalSubtotal = subtotal > 0 ? Number(subtotal) : calculatedSubtotal;
    const finalTax = taxAmount > 0 ? Number(taxAmount) : (finalSubtotal * Number(taxRate)) / 100;
    const finalTotal = totalAmount > 0 ? Number(totalAmount) : finalSubtotal + finalTax;

    const delivery = await prisma.delivery.create({
      data: {
        reference: finalReference,
        status,
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
        moNumber,
        items: {
          create: itemsData
        }
      },
      include: {
        customer: true,
        warehouse: true,
        items: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Delivery order created successfully",
      data: delivery
    });
  } catch (error) {
    console.error("Error creating delivery:", error);
    res.status(500).json({ success: false, message: "Failed to create delivery", error: error.message });
  }
};

// PATCH /deliveries/:id
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
      moNumber,
      items
    } = req.body;

    const existing = await prisma.delivery.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Delivery order not found" });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
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
    if (moNumber !== undefined) updateData.moNumber = moNumber;

    if (Array.isArray(items)) {
      await prisma.deliveryItem.deleteMany({ where: { deliveryId: Number(id) } });
      updateData.items = {
        create: items.map((item) => ({
          productId: item.productId ? Number(item.productId) : null,
          name: item.name || "Unnamed Item",
          sku: item.sku || null,
          quantity: Number(item.quantity) || 1,
          deliveredQty: Number(item.deliveredQty) || 0,
          unitCost: Number(item.unitCost) || 0,
          totalPrice: Number(item.totalPrice) || (Number(item.quantity) || 1) * (Number(item.unitCost) || 0),
          unit: item.unit || "Units"
        }))
      };
    }

    const updated = await prisma.delivery.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        customer: true,
        warehouse: true,
        items: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Delivery order updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating delivery:", error);
    res.status(500).json({ success: false, message: "Failed to update delivery", error: error.message });
  }
};

// DELETE /deliveries/:id
export const deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.delivery.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Delivery order not found" });
    }

    await prisma.delivery.delete({ where: { id: Number(id) } });

    res.status(200).json({
      success: true,
      message: `Delivery "${existing.reference}" deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ success: false, message: "Failed to delete delivery", error: error.message });
  }
};

// POST /deliveries/:id/pick (Record picking - moves status to in_progress)
export const pickDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({ where: { id: Number(id) } });
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery order not found" });
    }

    const updated = await prisma.delivery.update({
      where: { id: Number(id) },
      data: { status: "in_progress" },
      include: { items: true, customer: true }
    });

    res.status(200).json({
      success: true,
      message: `Delivery ${delivery.reference} marked as In Progress (Picking Complete)`,
      data: updated
    });
  } catch (error) {
    console.error("Error recording pick:", error);
    res.status(500).json({ success: false, message: "Failed to record pick", error: error.message });
  }
};

// POST /deliveries/:id/pack (Record packing - moves status to ready)
export const packDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({ where: { id: Number(id) } });
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery order not found" });
    }

    const updated = await prisma.delivery.update({
      where: { id: Number(id) },
      data: { status: "ready" },
      include: { items: true, customer: true }
    });

    res.status(200).json({
      success: true,
      message: `Delivery ${delivery.reference} marked as Ready (Packing Complete)`,
      data: updated
    });
  } catch (error) {
    console.error("Error recording pack:", error);
    res.status(500).json({ success: false, message: "Failed to record pack", error: error.message });
  }
};

// POST /deliveries/:id/validate (Validate and decrease stock)
export const validateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({
      where: { id: Number(id) },
      include: {
        items: true,
        warehouse: true,
        customer: true
      }
    });

    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery order not found" });
    }

    if (delivery.status === "done") {
      return res.status(400).json({ success: false, message: "Delivery is already completed and dispatched" });
    }

    const movementsToCreate = [];

    for (const item of delivery.items) {
      const qty = Number(item.quantity) || 0;

      if (item.productId) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const newOnHand = Math.max(0, product.onHand - qty);
          const newFree = Math.max(0, product.freeToUse - qty);

          await prisma.product.update({
            where: { id: product.id },
            data: {
              onHand: newOnHand,
              freeToUse: newFree
            }
          });

          movementsToCreate.push({
            reference: delivery.reference,
            type: "OUT",
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            fromLocation: delivery.warehouse?.name || "Central Stock Room",
            toLocation: delivery.customer?.name || delivery.destination || "Customer Destination",
            quantity: qty,
            unit: item.unit || "Units",
            balanceAfter: newOnHand,
            reason: `Delivery Dispatch (${delivery.reference})`,
            responsible: delivery.responsible || "Rohit Maurya"
          });
        }
      } else if (item.sku) {
        const product = await prisma.product.findUnique({ where: { sku: item.sku } });
        if (product) {
          const newOnHand = Math.max(0, product.onHand - qty);
          const newFree = Math.max(0, product.freeToUse - qty);

          await prisma.product.update({
            where: { id: product.id },
            data: {
              onHand: newOnHand,
              freeToUse: newFree
            }
          });

          movementsToCreate.push({
            reference: delivery.reference,
            type: "OUT",
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            fromLocation: delivery.warehouse?.name || "Central Stock Room",
            toLocation: delivery.customer?.name || delivery.destination || "Customer Destination",
            quantity: qty,
            unit: item.unit || "Units",
            balanceAfter: newOnHand,
            reason: `Delivery Dispatch (${delivery.reference})`,
            responsible: delivery.responsible || "Rohit Maurya"
          });
        }
      }

      await prisma.deliveryItem.update({
        where: { id: item.id },
        data: { deliveredQty: qty }
      });
    }

    if (movementsToCreate.length > 0) {
      await prisma.stockMovement.createMany({
        data: movementsToCreate
      });
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id: Number(id) },
      data: { status: "done" },
      include: {
        customer: true,
        warehouse: true,
        items: true
      }
    });

    res.status(200).json({
      success: true,
      message: `Delivery ${delivery.reference} validated and dispatched successfully. Stock decreased.`,
      data: updatedDelivery
    });
  } catch (error) {
    console.error("Error validating delivery:", error);
    res.status(500).json({ success: false, message: "Failed to validate delivery", error: error.message });
  }
};
