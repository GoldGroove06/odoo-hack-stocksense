import prisma from "../config/prisma.js";
import { applyMove, consumeBom, getQuantQuantity, withStockTransaction } from "../services/stockService.js";

async function generateTransferReference() {
  const year = new Date().getFullYear();
  const count = await prisma.transfer.count();
  const nextId = String(count + 1).padStart(3, "0");
  return `TRF/${year}/${nextId}`;
}

const transferInclude = {
  fromLocation: true,
  toLocation: true,
  receipt: true,
  delivery: true,
  staffUser: { select: { id: true, name: true, email: true, role: true } },
  items: { include: { product: true } }
};

export const getAllTransfers = async (req, res) => {
  try {
    const { search, status, fromLocationId, toLocationId, receiptId, deliveryId } = req.query;
    const where = {};
    if (status && status !== "ALL") where.status = status;
    if (fromLocationId) where.fromLocationId = Number(fromLocationId);
    if (toLocationId) where.toLocationId = Number(toLocationId);
    if (receiptId) where.receiptId = Number(receiptId);
    if (deliveryId) where.deliveryId = Number(deliveryId);
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { reference: { contains: q, mode: "insensitive" } },
        { moNumber: { contains: q, mode: "insensitive" } },
        { responsible: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { fromLocation: { name: { contains: q, mode: "insensitive" } } },
        { toLocation: { name: { contains: q, mode: "insensitive" } } }
      ];
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: transferInclude,
      orderBy: { id: "desc" }
    });

    res.status(200).json({ success: true, count: transfers.length, data: transfers });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transfers", error: error.message });
  }
};

export const getTransferById = async (req, res) => {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: Number(req.params.id) },
      include: transferInclude
    });
    if (!transfer) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }
    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    console.error("Error fetching transfer:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transfer", error: error.message });
  }
};

export const createTransfer = async (req, res) => {
  try {
    const {
      reference,
      status = "draft",
      scheduledDate,
      fromLocationId,
      toLocationId,
      responsible = "Rohit Maurya",
      moNumber,
      notes,
      isManufactured = false,
      receiptId,
      deliveryId,
      items = []
    } = req.body;

    if (status === "done" || status === "picked") {
      return res.status(400).json({
        success: false,
        message: "Create as draft; use pick/drop endpoints to progress"
      });
    }

    const itemsData = items.map((item) => ({
      productId: item.productId ? Number(item.productId) : null,
      name: item.name || "Transferred Item",
      sku: item.sku || null,
      quantity: Number(item.quantity) || 1,
      pickedQty: 0,
      transferredQty: 0,
      unit: item.unit || "Units"
    }));

    // Auto-detect manufacturing if any product is MANUFACTURING
    let manufactured = Boolean(isManufactured);
    for (const item of itemsData) {
      if (!item.productId) continue;
      const p = await prisma.product.findUnique({ where: { id: item.productId } });
      if (p?.productKind === "MANUFACTURING") {
        manufactured = true;
        break;
      }
    }

    const transfer = await prisma.transfer.create({
      data: {
        reference: reference || (await generateTransferReference()),
        status: "draft",
        scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
        fromLocationId: fromLocationId ? Number(fromLocationId) : null,
        toLocationId: toLocationId ? Number(toLocationId) : null,
        responsible,
        moNumber,
        notes,
        isManufactured: manufactured,
        receiptId: receiptId ? Number(receiptId) : null,
        deliveryId: deliveryId ? Number(deliveryId) : null,
        items: { create: itemsData }
      },
      include: transferInclude
    });

    res.status(201).json({
      success: true,
      message: "Internal Transfer created successfully",
      data: transfer
    });
  } catch (error) {
    console.error("Error creating transfer:", error);
    res.status(500).json({ success: false, message: "Failed to create transfer", error: error.message });
  }
};

export const updateTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      scheduledDate,
      fromLocationId,
      toLocationId,
      responsible,
      moNumber,
      notes,
      isManufactured,
      receiptId,
      deliveryId,
      items
    } = req.body;

    const existing = await prisma.transfer.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }
    if (existing.status === "done") {
      return res.status(400).json({ success: false, message: "Completed transfers cannot be edited" });
    }
    if (status === "done" || status === "picked") {
      return res.status(400).json({
        success: false,
        message: "Use POST /transfers/:id/pick or /drop to change execution status"
      });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate;
    if (fromLocationId !== undefined) updateData.fromLocationId = fromLocationId ? Number(fromLocationId) : null;
    if (toLocationId !== undefined) updateData.toLocationId = toLocationId ? Number(toLocationId) : null;
    if (responsible !== undefined) updateData.responsible = responsible;
    if (moNumber !== undefined) updateData.moNumber = moNumber;
    if (notes !== undefined) updateData.notes = notes;
    if (isManufactured !== undefined) updateData.isManufactured = Boolean(isManufactured);
    if (receiptId !== undefined) updateData.receiptId = receiptId ? Number(receiptId) : null;
    if (deliveryId !== undefined) updateData.deliveryId = deliveryId ? Number(deliveryId) : null;

    if (Array.isArray(items)) {
      await prisma.transferItem.deleteMany({ where: { transferId: Number(id) } });
      updateData.items = {
        create: items.map((item) => ({
          productId: item.productId ? Number(item.productId) : null,
          name: item.name || "Transferred Item",
          sku: item.sku || null,
          quantity: Number(item.quantity) || 1,
          pickedQty: Number(item.pickedQty) || 0,
          transferredQty: Number(item.transferredQty) || 0,
          unit: item.unit || "Units"
        }))
      };
    }

    const updated = await prisma.transfer.update({
      where: { id: Number(id) },
      data: updateData,
      include: transferInclude
    });

    res.status(200).json({ success: true, message: "Transfer updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating transfer:", error);
    res.status(500).json({ success: false, message: "Failed to update transfer", error: error.message });
  }
};

export const deleteTransfer = async (req, res) => {
  try {
    const existing = await prisma.transfer.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }
    if (existing.status === "done") {
      return res.status(400).json({ success: false, message: "Cannot delete a completed transfer" });
    }
    await prisma.transfer.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({
      success: true,
      message: `Transfer "${existing.reference}" deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting transfer:", error);
    res.status(500).json({ success: false, message: "Failed to delete transfer", error: error.message });
  }
};

/** Staff: mark transfer as picked up */
export const pickTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ? Number(req.user.userId) : null;

    const transfer = await prisma.transfer.findUnique({
      where: { id: Number(id) },
      include: { items: true }
    });
    if (!transfer) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }
    if (transfer.status === "done") {
      return res.status(400).json({ success: false, message: "Transfer already completed" });
    }
    if (transfer.status === "picked") {
      return res.status(400).json({ success: false, message: "Transfer already picked" });
    }
    if (!transfer.fromLocationId || !transfer.toLocationId) {
      return res.status(400).json({ success: false, message: "fromLocationId and toLocationId are required" });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        await tx.transferItem.update({
          where: { id: item.id },
          data: { pickedQty: Number(item.quantity) || 0 }
        });
      }
      await tx.transfer.update({
        where: { id: Number(id) },
        data: {
          status: "picked",
          pickedAt: new Date(),
          staffUserId: userId
        }
      });
    });

    const updated = await prisma.transfer.findUnique({
      where: { id: Number(id) },
      include: transferInclude
    });

    res.status(200).json({
      success: true,
      message: `Transfer ${transfer.reference} picked up`,
      data: updated
    });
  } catch (error) {
    console.error("Error picking transfer:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to pick transfer" });
  }
};

/** Staff: drop / complete move — applies stock move (+ BOM consume for manufacturing items) */
export const dropTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ? Number(req.user.userId) : null;

    const updated = await withStockTransaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({
        where: { id: Number(id) },
        include: {
          items: { include: { product: true } },
          fromLocation: true,
          toLocation: true
        }
      });
      if (!transfer) {
        const err = new Error("Transfer not found");
        err.status = 404;
        throw err;
      }
      if (transfer.status === "done") {
        const err = new Error("Transfer already completed");
        err.status = 400;
        throw err;
      }
      if (transfer.status !== "picked" && transfer.status !== "draft") {
        const err = new Error(`Cannot drop transfer in status ${transfer.status}`);
        err.status = 400;
        throw err;
      }
      if (!transfer.fromLocationId || !transfer.toLocationId) {
        const err = new Error("fromLocationId and toLocationId are required");
        err.status = 400;
        throw err;
      }

      for (const item of transfer.items) {
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;

        let product = item.product;
        if (!product && item.productId) {
          product = await tx.product.findUnique({ where: { id: item.productId } });
        }
        if (!product && item.sku) {
          product = await tx.product.findUnique({ where: { sku: item.sku } });
        }
        if (!product) continue;

        const isMfg = product.productKind === "MANUFACTURING" || transfer.isManufactured;

        if (isMfg && product.productKind === "MANUFACTURING") {
          const available = await getQuantQuantity(tx, product.id, transfer.fromLocationId);
          if (available < qty) {
            await consumeBom(tx, {
              finishedProductId: product.id,
              locationId: transfer.fromLocationId,
              qty: qty - available,
              unit: item.unit,
              reason: `Manufacturing for transfer ${transfer.reference}`,
              responsible: transfer.responsible,
              userId,
              documentType: "TRANSFER",
              documentId: transfer.id,
              reference: transfer.reference
            });
          }
        }

        await applyMove(tx, {
          productId: product.id,
          fromLocationId: transfer.fromLocationId,
          toLocationId: transfer.toLocationId,
          qty,
          unit: item.unit,
          productName: product.name,
          sku: product.sku,
          reason: `Transfer drop (${transfer.reference})`,
          responsible: transfer.responsible,
          userId,
          documentType: "TRANSFER",
          documentId: transfer.id,
          reference: transfer.reference
        });

        await tx.transferItem.update({
          where: { id: item.id },
          data: {
            productId: product.id,
            pickedQty: Math.max(Number(item.pickedQty) || 0, qty),
            transferredQty: qty
          }
        });
      }

      // If linked to receipt still in progress, leave receipt status alone (manager validates)
      // If linked to delivery in draft/in_progress, nudge toward in_progress
      if (transfer.deliveryId) {
        const delivery = await tx.delivery.findUnique({ where: { id: transfer.deliveryId } });
        if (delivery && delivery.status === "draft") {
          await tx.delivery.update({
            where: { id: delivery.id },
            data: { status: "in_progress" }
          });
        }
      }
      if (transfer.receiptId) {
        const receipt = await tx.receipt.findUnique({ where: { id: transfer.receiptId } });
        if (receipt && receipt.status === "draft") {
          await tx.receipt.update({
            where: { id: receipt.id },
            data: { status: "in_progress" }
          });
        }
      }

      return tx.transfer.update({
        where: { id: Number(id) },
        data: {
          status: "done",
          droppedAt: new Date(),
          staffUserId: userId || transfer.staffUserId,
          pickedAt: transfer.pickedAt || new Date()
        },
        include: transferInclude
      });
    });

    res.status(200).json({
      success: true,
      message: `Transfer ${updated.reference} dropped — stock moved`,
      data: updated
    });
  } catch (error) {
    console.error("Error dropping transfer:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to drop transfer"
    });
  }
};

/** Manager shortcut: complete move (same as drop; accepts draft or picked) */
export const validateTransfer = async (req, res) => {
  return dropTransfer(req, res);
};
