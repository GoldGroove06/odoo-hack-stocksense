import prisma from "../config/prisma.js";

/**
 * @route   GET /uoms
 * @desc    List all units of measure
 */
export const listUoms = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { symbol: { contains: search, mode: "insensitive" } }
      ];
    }

    const uoms = await prisma.unitOfMeasure.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: uoms
    });
  } catch (error) {
    console.error("Error listing units of measure:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve units of measure",
      error: error.message
    });
  }
};

/**
 * @route   GET /uoms/:id
 * @desc    Get single unit of measure
 */
export const getUomById = async (req, res) => {
  try {
    const { id } = req.params;

    const uom = await prisma.unitOfMeasure.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      }
    });

    if (!uom) {
      return res.status(404).json({
        success: false,
        message: `Unit of measure with ID ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: uom
    });
  } catch (error) {
    console.error("Error fetching unit of measure:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unit of measure",
      error: error.message
    });
  }
};

/**
 * @route   POST /uoms
 * @desc    Create a new unit of measure
 */
export const createUom = async (req, res) => {
  try {
    const { name, symbol } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Unit of measure name is required"
      });
    }

    const existing = await prisma.unitOfMeasure.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Unit of measure "${name.trim()}" already exists`
      });
    }

    const uom = await prisma.unitOfMeasure.create({
      data: {
        name: name.trim(),
        symbol: symbol ? symbol.trim() : null
      }
    });

    return res.status(201).json({
      success: true,
      message: "Unit of measure created successfully",
      data: uom
    });
  } catch (error) {
    console.error("Error creating unit of measure:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create unit of measure",
      error: error.message
    });
  }
};

/**
 * @route   PATCH /uoms/:id
 * @desc    Update unit of measure
 */
export const updateUom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symbol } = req.body;

    const existing = await prisma.unitOfMeasure.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Unit of measure with ID ${id} not found`
      });
    }

    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.unitOfMeasure.findUnique({
        where: { name: name.trim() }
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Unit of measure "${name.trim()}" already exists`
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (symbol !== undefined) updateData.symbol = symbol ? symbol.trim() : null;

    const updatedUom = await prisma.unitOfMeasure.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: "Unit of measure updated successfully",
      data: updatedUom
    });
  } catch (error) {
    console.error("Error updating unit of measure:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update unit of measure",
      error: error.message
    });
  }
};

/**
 * @route   DELETE /uoms/:id
 * @desc    Delete unit of measure
 */
export const deleteUom = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.unitOfMeasure.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Unit of measure with ID ${id} not found`
      });
    }

    await prisma.unitOfMeasure.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      message: `Unit of measure "${existing.name}" (ID: ${id}) deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting unit of measure:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete unit of measure",
      error: error.message
    });
  }
};
