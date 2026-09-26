import prisma from "../config/prisma.js";

// Helper to generate reference: <Warehouse>/IN/<PaddedID> (e.g. WH/IN/001)
async function generateReceiptReference(warehouseId) {
  let whCode = "WH";
  if (warehouseId) {
    const wh = await prisma.warehouse.findUnique({ where: { id: Number(warehouseId) } });
    if (wh && wh.shortcode) whCode = wh.shortcode;
  }
  const count = await prisma.receipt.count();
  const nextId = String(count + 1).padStart(3, "0");
  return `${whCode}/IN/${nextId}`;
}

// GET /receipts
export const getAllReceipts = async (req, res) => {
  try {
    const { search, status, supplierId, warehouseId } = req.query;

    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (supplierId) {
      where.supplierId = Number(supplierId);
    }
    if (warehouseId) {
      where.warehouseId = Number(warehouseId);
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { reference: { contains: q, mode: "insensitive" } },
        { receiveFrom: { contains: q, mode: "insensitive" } },
        { sellerBillNumber: { contains: q, mode: "insensitive" } },
        { responsible: { contains: q, mode: "insensitive" } },
        { supplier: { name: { contains: q, mode: "insensitive" } } },
        { supplier: { contactPerson: { contains: q, mode: "insensitive" } } }
      ];
    }

    const receipts = await prisma.receipt.findMany({
      where,
      include: {
        supplier: true,
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
      count: receipts.length,
      data: receipts
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch receipts", error: error.message });
  }
};

// GET /receipts/:id
export const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await prisma.receipt.findUnique({
      where: { id: Number(id) },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!receipt) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    res.status(500).json({ success: false, message: "Failed to fetch receipt", error: error.message });
  }
};

// POST /receipts
export const createReceipt = async (req, res) => {
  try {
    const {
      reference,
      status = "draft",
      scheduledDate,
      receiveFrom,
      responsible = "Rohit Maurya",
      sellerBillNumber,
      sourceDocument,
      internalNotes,
      subtotal = 0,
      taxRate = 18,
      taxAmount = 0,
      totalAmount = 0,
      supplierId,
      warehouseId,
      moNumber,
      items = []
    } = req.body;

    const finalReference = reference || (await generateReceiptReference(warehouseId));

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
        receivedQty: Number(item.receivedQty) || (status === "done" ? qty : 0),
        unitCost: cost,
        totalPrice: total,
        unit: item.unit || "Units"
      };
    });

    const finalSubtotal = subtotal > 0 ? Number(subtotal) : calculatedSubtotal;
    const finalTax = taxAmount > 0 ? Number(taxAmount) : (finalSubtotal * Number(taxRate)) / 100;
    const finalTotal = totalAmount > 0 ? Number(totalAmount) : finalSubtotal + finalTax;

    const receipt = await prisma.receipt.create({
      data: {
        reference: finalReference,
        status,
        scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
        receiveFrom,
        responsible,
        sellerBillNumber,
        sourceDocument,
        internalNotes,
        subtotal: finalSubtotal,
        taxRate: Number(taxRate),
        taxAmount: finalTax,
        totalAmount: finalTotal,
        supplierId: supplierId ? Number(supplierId) : null,
        warehouseId: warehouseId ? Number(warehouseId) : null,
        moNumber,
        items: {
          create: itemsData
        }
      },
      include: {
        supplier: true,
        warehouse: true,
        items: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Receipt created successfully",
      data: receipt
    });
  } catch (error) {
    console.error("Error creating receipt:", error);
    res.status(500).json({ success: false, message: "Failed to create receipt", error: error.message });
  }
};

// PATCH /receipts/:id
export const updateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      scheduledDate,
      receiveFrom,
      responsible,
      sellerBillNumber,
      sourceDocument,
      internalNotes,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      supplierId,
      warehouseId,
      moNumber,
      items
    } = req.body;

    const existing = await prisma.receipt.findUnique({
      where: { id: Number(id) },
      include: { items: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate;
    if (receiveFrom !== undefined) updateData.receiveFrom = receiveFrom;
    if (responsible !== undefined) updateData.responsible = responsible;
    if (sellerBillNumber !== undefined) updateData.sellerBillNumber = sellerBillNumber;
    if (sourceDocument !== undefined) updateData.sourceDocument = sourceDocument;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (subtotal !== undefined) updateData.subtotal = Number(subtotal);
    if (taxRate !== undefined) updateData.taxRate = Number(taxRate);
    if (taxAmount !== undefined) updateData.taxAmount = Number(taxAmount);
    if (totalAmount !== undefined) updateData.totalAmount = Number(totalAmount);
    if (supplierId !== undefined) updateData.supplierId = supplierId ? Number(supplierId) : null;
    if (warehouseId !== undefined) updateData.warehouseId = warehouseId ? Number(warehouseId) : null;
    if (moNumber !== undefined) updateData.moNumber = moNumber;

    if (Array.isArray(items)) {
      await prisma.receiptItem.deleteMany({ where: { receiptId: Number(id) } });
      updateData.items = {
        create: items.map((item) => ({
          productId: item.productId ? Number(item.productId) : null,
          name: item.name || "Unnamed Item",
          sku: item.sku || null,
          quantity: Number(item.quantity) || 1,
          receivedQty: Number(item.receivedQty) || 0,
          unitCost: Number(item.unitCost) || 0,
          totalPrice: Number(item.totalPrice) || (Number(item.quantity) || 1) * (Number(item.unitCost) || 0),
          unit: item.unit || "Units"
        }))
      };
    }

    const updated = await prisma.receipt.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        supplier: true,
        warehouse: true,
        items: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Receipt updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating receipt:", error);
    res.status(500).json({ success: false, message: "Failed to update receipt", error: error.message });
  }
};

// DELETE /receipts/:id
export const deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.receipt.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    await prisma.receipt.delete({ where: { id: Number(id) } });

    res.status(200).json({
      success: true,
      message: `Receipt "${existing.reference}" deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    res.status(500).json({ success: false, message: "Failed to delete receipt", error: error.message });
  }
};

// POST /receipts/:id/validate (Validate and increase stock)
export const validateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await prisma.receipt.findUnique({
      where: { id: Number(id) },
      include: {
        items: true,
        warehouse: true,
        supplier: true
      }
    });

    if (!receipt) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    if (receipt.status === "done") {
      return res.status(400).json({ success: false, message: "Receipt is already validated and completed" });
    }

    const movementsToCreate = [];

    for (const item of receipt.items) {
      const qty = Number(item.quantity) || 0;

      if (item.productId) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const newOnHand = product.onHand + qty;
          const newFree = product.freeToUse + qty;

          await prisma.product.update({
            where: { id: product.id },
            data: {
              onHand: newOnHand,
              freeToUse: newFree
            }
          });

          movementsToCreate.push({
            reference: receipt.reference,
            type: "IN",
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            fromLocation: receipt.supplier?.name || receipt.receiveFrom || "Vendor / Supplier",
            toLocation: receipt.warehouse?.name || "Central Stock Room",
            quantity: qty,
            unit: item.unit || "Units",
            balanceAfter: newOnHand,
            reason: `Receipt Validation (${receipt.reference})`,
            responsible: receipt.responsible || "Rohit Maurya"
          });
        }
      } else if (item.sku) {
        const product = await prisma.product.findUnique({ where: { sku: item.sku } });
        if (product) {
          const newOnHand = product.onHand + qty;
          const newFree = product.freeToUse + qty;

          await prisma.product.update({
            where: { id: product.id },
            data: {
              onHand: newOnHand,
              freeToUse: newFree
            }
          });

          movementsToCreate.push({
            reference: receipt.reference,
            type: "IN",
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            fromLocation: receipt.supplier?.name || receipt.receiveFrom || "Vendor / Supplier",
            toLocation: receipt.warehouse?.name || "Central Stock Room",
            quantity: qty,
            unit: item.unit || "Units",
            balanceAfter: newOnHand,
            reason: `Receipt Validation (${receipt.reference})`,
            responsible: receipt.responsible || "Rohit Maurya"
          });
        }
      }

      await prisma.receiptItem.update({
        where: { id: item.id },
        data: { receivedQty: qty }
      });
    }

    if (movementsToCreate.length > 0) {
      await prisma.stockMovement.createMany({
        data: movementsToCreate
      });
    }

    const updatedReceipt = await prisma.receipt.update({
      where: { id: Number(id) },
      data: { status: "done" },
      include: {
        supplier: true,
        warehouse: true,
        items: true
      }
    });

    res.status(200).json({
      success: true,
      message: `Receipt ${receipt.reference} validated successfully. Stock increased and ledger updated.`,
      data: updatedReceipt
    });
  } catch (error) {
    console.error("Error validating receipt:", error);
    res.status(500).json({ success: false, message: "Failed to validate receipt", error: error.message });
  }
};
