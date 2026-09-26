import prisma from "../config/prisma.js";

// GET /movements
export const getAllMovements = async (req, res) => {
  try {
    const { type, search, productId } = req.query;

    const where = {};
    if (type && type !== "ALL") {
      where.type = type;
    }
    if (productId) {
      where.productId = Number(productId);
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { reference: { contains: q, mode: "insensitive" } },
        { productName: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { fromLocation: { contains: q, mode: "insensitive" } },
        { toLocation: { contains: q, mode: "insensitive" } },
        { reason: { contains: q, mode: "insensitive" } },
        { responsible: { contains: q, mode: "insensitive" } }
      ];
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { id: "desc" },
      take: 100
    });

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements
    });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stock movements", error: error.message });
  }
};

// POST /movements
export const createMovement = async (req, res) => {
  try {
    const {
      reference,
      type = "INTERNAL",
      productId,
      productName,
      sku,
      fromLocation,
      toLocation,
      quantity,
      unit = "Units",
      balanceAfter,
      reason,
      responsible = "Rohit Maurya"
    } = req.body;

    const movement = await prisma.stockMovement.create({
      data: {
        reference: reference || `MOV/${Date.now()}`,
        type,
        productId: productId ? Number(productId) : null,
        productName: productName || "Generic Item",
        sku,
        fromLocation,
        toLocation,
        quantity: Number(quantity) || 0,
        unit,
        balanceAfter: balanceAfter !== undefined ? Number(balanceAfter) : null,
        reason,
        responsible
      }
    });

    res.status(201).json({
      success: true,
      message: "Stock movement logged successfully",
      data: movement
    });
  } catch (error) {
    console.error("Error logging stock movement:", error);
    res.status(500).json({ success: false, message: "Failed to log stock movement", error: error.message });
  }
};
