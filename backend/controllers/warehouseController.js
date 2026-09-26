import prisma from "../config/prisma.js";

/**
 * @route   GET /warehouses
 * @desc    List all warehouses with location counts
 */
export const listWarehouses = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortcode: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { manager: { contains: search, mode: "insensitive" } }
      ];
    }

    const warehouses = await prisma.warehouse.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        locations: {
          select: {
            id: true,
            name: true,
            shortcode: true,
            type: true
          }
        },
        _count: {
          select: { locations: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: warehouses
    });
  } catch (error) {
    console.error("Error listing warehouses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve warehouses",
      error: error.message
    });
  }
};

/**
 * @route   GET /warehouses/:id
 * @desc    Get single warehouse with full locations
 */
export const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: parseInt(id) },
      include: {
        locations: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        }
      }
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: `Warehouse with ID ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse",
      error: error.message
    });
  }
};

/**
 * @route   POST /warehouses
 * @desc    Create a new warehouse
 */
export const createWarehouse = async (req, res) => {
  try {
    const { name, shortcode, address, manager, phone } = req.body;

    if (!name || !shortcode) {
      return res.status(400).json({
        success: false,
        message: "Warehouse name and shortcode are required"
      });
    }

    const existingShortcode = await prisma.warehouse.findUnique({
      where: { shortcode: shortcode.trim().toUpperCase() }
    });

    if (existingShortcode) {
      return res.status(409).json({
        success: false,
        message: `Warehouse with shortcode "${shortcode.trim().toUpperCase()}" already exists`
      });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name: name.trim(),
        shortcode: shortcode.trim().toUpperCase(),
        address: address ? address.trim() : null,
        manager: manager ? manager.trim() : null,
        phone: phone ? phone.trim() : null
      }
    });

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse
    });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create warehouse",
      error: error.message
    });
  }
};

/**
 * @route   PATCH /warehouses/:id
 * @desc    Update warehouse details
 */
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortcode, address, manager, phone } = req.body;

    const existing = await prisma.warehouse.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Warehouse with ID ${id} not found`
      });
    }

    if (shortcode && shortcode.trim().toUpperCase() !== existing.shortcode) {
      const duplicate = await prisma.warehouse.findUnique({
        where: { shortcode: shortcode.trim().toUpperCase() }
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Warehouse shortcode "${shortcode.trim().toUpperCase()}" is already in use`
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (shortcode !== undefined) updateData.shortcode = shortcode.trim().toUpperCase();
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (manager !== undefined) updateData.manager = manager ? manager.trim() : null;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;

    const updatedWarehouse = await prisma.warehouse.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: updatedWarehouse
    });
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update warehouse",
      error: error.message
    });
  }
};

/**
 * @route   DELETE /warehouses/:id
 * @desc    Delete warehouse
 */
export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.warehouse.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Warehouse with ID ${id} not found`
      });
    }

    await prisma.warehouse.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      message: `Warehouse "${existing.name}" (ID: ${id}) deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete warehouse",
      error: error.message
    });
  }
};
