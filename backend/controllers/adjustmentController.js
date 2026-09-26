import prisma from "../config/prisma.js";
import { applyAdjustment, withStockTransaction } from "../services/stockService.js";

// Helper to generate reference: ADJ/YYYY/<PaddedID> (e.g. ADJ/2026/001)
async function generateAdjustmentReference() {
  const year = new Date().getFullYear();
  const count = await prisma.adjustment.count();
  const nextId = String(count + 1).padStart(3, "0");
  return `ADJ/${year}/${nextId}`;
}

// GET /adjustments
export const getAllAdjustments = async (req, res) => {
  try {
    const { search, status, locationId } = req.query;

    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (locationId) {
      where.locationId = Number(locationId);
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { reference: { contains: q, mode: "insensitive" } },
        { reason: { contains: q, mode: "insensitive" } },
        { responsible: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { location: { name: { contains: q, mode: "insensitive" } } }
      ];
    }

    const adjustments = await prisma.adjustment.findMany({
      where,
      include: {
        location: true,
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
      count: adjustments.length,
      data: adjustments
    });
  } catch (error) {
    console.error("Error fetching adjustments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch adjustments", error: error.message });
  }
};

// GET /adjustments/:id
export const getAdjustmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const adjustment = await prisma.adjustment.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!adjustment) {
      return res.status(404).json({ success: false, message: "Adjustment record not found" });
    }

    res.status(200).json({ success: true, data: adjustment });
  } catch (error) {
    console.error("Error fetching adjustment:", error);
    res.status(500).json({ success: false, message: "Failed to fetch adjustment", error: error.message });
  }
};

// POST /adjustments
export const createAdjustment = async (req, res) => {
  try {
    const {
      reference,
      status = "draft",
      countedDate,
      locationId,
      reason = "Physical Stock Audit / Recount",
      responsible = "Rohit Maurya",
      notes,
      items = []
    } = req.body;

    const finalReference = reference || (await generateAdjustmentReference());

    let netVarianceQty = 0;
    let netVarianceValue = 0;

    const itemsData = items.map((item) => {
      const theo = Number(item.theoreticalQty) || 0;
      const cnt = Number(item.countedQty) || 0;
      const diff = cnt - theo;
      const cost = Number(item.perUnitCost) || 0;
      const val = diff * cost;

      netVarianceQty += diff;
      netVarianceValue += val;

      return {
        productId: item.productId ? Number(item.productId) : null,
        name: item.name || item.productName || "Inventory Item",
        sku: item.sku || null,
        theoreticalQty: theo,
        countedQty: cnt,
        variance: diff,
        perUnitCost: cost,
        varianceValue: val,
        unit: item.unit || "Units"
      };
    });

    const adjustment = await prisma.adjustment.create({
      data: {
        reference: finalReference,
        status,
        countedDate: countedDate || new Date().toISOString().split("T")[0],
        locationId: locationId ? Number(locationId) : null,
        reason,
        responsible,
        notes,
        totalItems: itemsData.length,
        netVarianceQty,
        netVarianceValue,
        items: {
          create: itemsData
        }
      },
      include: {
        location: true,
        items: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Physical Inventory Adjustment created successfully",
      data: adjustment
    });
  } catch (error) {
    console.error("Error creating adjustment:", error);
    res.status(500).json({ success: false, message: "Failed to create adjustment", error: error.message });
  }
};

// PATCH /adjustments/:id
export const updateAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      countedDate,
      locationId,
      reason,
      responsible,
      notes,
      items
    } = req.body;

    const existing = await prisma.adjustment.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Adjustment record not found" });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (countedDate !== undefined) updateData.countedDate = countedDate;
    if (locationId !== undefined) updateData.locationId = locationId ? Number(locationId) : null;
    if (reason !== undefined) updateData.reason = reason;
    if (responsible !== undefined) updateData.responsible = responsible;
    if (notes !== undefined) updateData.notes = notes;

    if (Array.isArray(items)) {
      let netVarianceQty = 0;
      let netVarianceValue = 0;

      await prisma.adjustmentItem.deleteMany({ where: { adjustmentId: Number(id) } });
      updateData.items = {
        create: items.map((item) => {
          const theo = Number(item.theoreticalQty) || 0;
          const cnt = Number(item.countedQty) || 0;
          const diff = cnt - theo;
          const cost = Number(item.perUnitCost) || 0;
          const val = diff * cost;
          netVarianceQty += diff;
          netVarianceValue += val;

          return {
            productId: item.productId ? Number(item.productId) : null,
            name: item.name || item.productName || "Inventory Item",
            sku: item.sku || null,
            theoreticalQty: theo,
            countedQty: cnt,
            variance: diff,
            perUnitCost: cost,
            varianceValue: val,
            unit: item.unit || "Units"
          };
        })
      };
      updateData.totalItems = items.length;
      updateData.netVarianceQty = netVarianceQty;
      updateData.netVarianceValue = netVarianceValue;
    }

    const updated = await prisma.adjustment.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        location: true,
        items: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Adjustment updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating adjustment:", error);
    res.status(500).json({ success: false, message: "Failed to update adjustment", error: error.message });
  }
};

// DELETE /adjustments/:id
export const deleteAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.adjustment.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Adjustment record not found" });
    }

    await prisma.adjustment.delete({ where: { id: Number(id) } });

    res.status(200).json({
      success: true,
      message: `Adjustment "${existing.reference}" deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting adjustment:", error);
    res.status(500).json({ success: false, message: "Failed to delete adjustment", error: error.message });
  }
};

// POST /adjustments/:id/validate (Validate physical-count adjustment)
export const validateAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ? Number(req.user.userId) : null;

    const updatedAdjustment = await withStockTransaction(async (tx) => {
      const adjustment = await tx.adjustment.findUnique({
        where: { id: Number(id) },
        include: { location: true, items: true }
      });
      if (!adjustment) {
        const err = new Error("Adjustment record not found");
        err.status = 404;
        throw err;
      }
      if (adjustment.status === "done") {
        const err = new Error("Adjustment is already validated and applied");
        err.status = 400;
        throw err;
      }
      if (!adjustment.locationId) {
        const err = new Error("Adjustment needs a locationId");
        err.status = 400;
        throw err;
      }

      for (const item of adjustment.items) {
        let productId = item.productId;
        if (!productId && item.sku) {
          const p = await tx.product.findUnique({ where: { sku: item.sku } });
          productId = p?.id || null;
        }
        if (!productId) continue;

        await applyAdjustment(tx, {
          productId,
          locationId: adjustment.locationId,
          countedQty: Number(item.countedQty),
          unit: item.unit,
          productName: item.name,
          sku: item.sku,
          reason: `${adjustment.reason || "Physical Count"} (${adjustment.reference})`,
          responsible: adjustment.responsible,
          userId,
          documentType: "ADJUSTMENT",
          documentId: adjustment.id,
          reference: adjustment.reference
        });
      }

      return tx.adjustment.update({
        where: { id: Number(id) },
        data: { status: "done" },
        include: { location: true, items: true }
      });
    });

    res.status(200).json({
      success: true,
      message: `Adjustment ${updatedAdjustment.reference} validated. Location stock updated.`,
      data: updatedAdjustment
    });
  } catch (error) {
    console.error("Error validating adjustment:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to validate adjustment"
    });
  }
};
