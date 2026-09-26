import prisma from "../config/prisma.js";

// Helper to generate reference: TRF/YYYY/<PaddedID> (e.g. TRF/2026/001)
async function generateTransferReference() {
  const year = new Date().getFullYear();
  const count = await prisma.transfer.count();
  const nextId = String(count + 1).padStart(3, "0");
  return `TRF/${year}/${nextId}`;
}

// GET /transfers
export const getAllTransfers = async (req, res) => {
  try {
    const { search, status, fromLocationId, toLocationId } = req.query;

    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (fromLocationId) {
      where.fromLocationId = Number(fromLocationId);
    }
    if (toLocationId) {
      where.toLocationId = Number(toLocationId);
    }
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
      include: {
        fromLocation: true,
        toLocation: true,
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
      count: transfers.length,
      data: transfers
    });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transfers", error: error.message });
  }
};

// GET /transfers/:id
export const getTransferById = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await prisma.transfer.findUnique({
      where: { id: Number(id) },
      include: {
        fromLocation: true,
        toLocation: true,
        items: {
          include: {
            product: true
          }
        }
      }
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

// POST /transfers
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
      items = []
    } = req.body;

    const finalReference = reference || (await generateTransferReference());

    const itemsData = items.map((item) => ({
      productId: item.productId ? Number(item.productId) : null,
      name: item.name || "Transferred Item",
      sku: item.sku || null,
      quantity: Number(item.quantity) || 1,
      transferredQty: Number(item.transferredQty) || (status === "done" ? Number(item.quantity) || 1 : 0),
      unit: item.unit || "Units"
    }));

    const transfer = await prisma.transfer.create({
      data: {
        reference: finalReference,
        status,
        scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
        fromLocationId: fromLocationId ? Number(fromLocationId) : null,
        toLocationId: toLocationId ? Number(toLocationId) : null,
        responsible,
        moNumber,
        notes,
        items: {
          create: itemsData
        }
      },
      include: {
        fromLocation: true,
        toLocation: true,
        items: true
      }
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

// PATCH /transfers/:id
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
      items
    } = req.body;

    const existing = await prisma.transfer.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate;
    if (fromLocationId !== undefined) updateData.fromLocationId = fromLocationId ? Number(fromLocationId) : null;
    if (toLocationId !== undefined) updateData.toLocationId = toLocationId ? Number(toLocationId) : null;
    if (responsible !== undefined) updateData.responsible = responsible;
    if (moNumber !== undefined) updateData.moNumber = moNumber;
    if (notes !== undefined) updateData.notes = notes;

    if (Array.isArray(items)) {
      await prisma.transferItem.deleteMany({ where: { transferId: Number(id) } });
      updateData.items = {
        create: items.map((item) => ({
          productId: item.productId ? Number(item.productId) : null,
          name: item.name || "Transferred Item",
          sku: item.sku || null,
          quantity: Number(item.quantity) || 1,
          transferredQty: Number(item.transferredQty) || 0,
          unit: item.unit || "Units"
        }))
      };
    }

    const updated = await prisma.transfer.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        fromLocation: true,
        toLocation: true,
        items: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Transfer updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating transfer:", error);
    res.status(500).json({ success: false, message: "Failed to update transfer", error: error.message });
  }
};

// DELETE /transfers/:id
export const deleteTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.transfer.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }

    await prisma.transfer.delete({ where: { id: Number(id) } });

    res.status(200).json({
      success: true,
      message: `Transfer "${existing.reference}" deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting transfer:", error);
    res.status(500).json({ success: false, message: "Failed to delete transfer", error: error.message });
  }
};

// POST /transfers/:id/validate (Validate internal transfer)
export const validateTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await prisma.transfer.findUnique({
      where: { id: Number(id) },
      include: {
        fromLocation: true,
        toLocation: true,
        items: true
      }
    });

    if (!transfer) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }

    if (transfer.status === "done") {
      return res.status(400).json({ success: false, message: "Transfer is already validated" });
    }

    const movementsToCreate = [];

    for (const item of transfer.items) {
      const qty = Number(item.quantity) || 0;

      let p = null;
      if (item.productId) {
        p = await prisma.product.findUnique({ where: { id: item.productId } });
      } else if (item.sku) {
        p = await prisma.product.findUnique({ where: { sku: item.sku } });
      }

      // If updating product's primary location if toLocation specified
      if (p && transfer.toLocationId) {
        await prisma.product.update({
          where: { id: p.id },
          data: { locationId: transfer.toLocationId }
        });
      }

      movementsToCreate.push({
        reference: transfer.reference,
        type: "INTERNAL",
        productId: p ? p.id : item.productId,
        productName: p ? p.name : item.name,
        sku: p ? p.sku : item.sku,
        fromLocation: transfer.fromLocation?.name || "Source Location",
        toLocation: transfer.toLocation?.name || "Destination Location",
        quantity: qty,
        unit: item.unit || "Units",
        balanceAfter: p ? p.onHand : null,
        reason: `Internal Transfer (${transfer.reference})${transfer.moNumber ? ` - MO: ${transfer.moNumber}` : ""}`,
        responsible: transfer.responsible || "Rohit Maurya"
      });

      await prisma.transferItem.update({
        where: { id: item.id },
        data: { transferredQty: qty }
      });
    }

    if (movementsToCreate.length > 0) {
      await prisma.stockMovement.createMany({
        data: movementsToCreate
      });
    }

    const updatedTransfer = await prisma.transfer.update({
      where: { id: Number(id) },
      data: { status: "done" },
      include: {
        fromLocation: true,
        toLocation: true,
        items: true
      }
    });

    res.status(200).json({
      success: true,
      message: `Transfer ${transfer.reference} validated successfully.`,
      data: updatedTransfer
    });
  } catch (error) {
    console.error("Error validating transfer:", error);
    res.status(500).json({ success: false, message: "Failed to validate transfer", error: error.message });
  }
};
