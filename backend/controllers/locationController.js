import prisma from "../config/prisma.js";

/**
 * @route   GET /locations
 * @desc    List all locations with warehouse details
 * @query   search, warehouseId, type
 */
export const listLocations = async (req, res) => {
  try {
    const { search, warehouseId, type } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortcode: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } }
      ];
    }

    if (warehouseId) {
      where.warehouseId = parseInt(warehouseId);
    }

    if (type) {
      where.type = type;
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            shortcode: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error("Error listing locations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve locations",
      error: error.message
    });
  }
};

/**
 * @route   GET /locations/:id
 * @desc    Get single location with products
 */
export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id: parseInt(id) },
      include: {
        warehouse: true,
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            onHand: true,
            freeToUse: true,
            perUnitCost: true
          }
        }
      }
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: `Location with ID ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch location",
      error: error.message
    });
  }
};

/**
 * @route   POST /locations
 * @desc    Create a new location
 */
export const createLocation = async (req, res) => {
  try {
    const { name, shortcode, address, type = "Internal Storage", warehouseId } = req.body;

    if (!name || !shortcode) {
      return res.status(400).json({
        success: false,
        message: "Location name and shortcode are required"
      });
    }

    const existing = await prisma.location.findUnique({
      where: { shortcode: shortcode.trim().toUpperCase() }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Location with shortcode "${shortcode.trim().toUpperCase()}" already exists`
      });
    }

    // Validate warehouseId if provided
    if (warehouseId) {
      const warehouseExists = await prisma.warehouse.findUnique({
        where: { id: parseInt(warehouseId) }
      });
      if (!warehouseExists) {
        return res.status(404).json({
          success: false,
          message: `Warehouse with ID ${warehouseId} does not exist`
        });
      }
    }

    const location = await prisma.location.create({
      data: {
        name: name.trim(),
        shortcode: shortcode.trim().toUpperCase(),
        address: address ? address.trim() : null,
        type: type ? type.trim() : "Internal Storage",
        warehouseId: warehouseId ? parseInt(warehouseId) : null
      },
      include: {
        warehouse: true
      }
    });

    return res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: location
    });
  } catch (error) {
    console.error("Error creating location:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create location",
      error: error.message
    });
  }
};

/**
 * @route   PATCH /locations/:id
 * @desc    Update location details
 */
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortcode, address, type, warehouseId } = req.body;

    const existing = await prisma.location.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Location with ID ${id} not found`
      });
    }

    if (shortcode && shortcode.trim().toUpperCase() !== existing.shortcode) {
      const duplicate = await prisma.location.findUnique({
        where: { shortcode: shortcode.trim().toUpperCase() }
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Location shortcode "${shortcode.trim().toUpperCase()}" is already in use`
        });
      }
    }

    if (warehouseId) {
      const warehouseExists = await prisma.warehouse.findUnique({
        where: { id: parseInt(warehouseId) }
      });
      if (!warehouseExists) {
        return res.status(404).json({
          success: false,
          message: `Warehouse with ID ${warehouseId} does not exist`
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (shortcode !== undefined) updateData.shortcode = shortcode.trim().toUpperCase();
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (type !== undefined) updateData.type = type.trim();
    if (warehouseId !== undefined) updateData.warehouseId = warehouseId ? parseInt(warehouseId) : null;

    const updatedLocation = await prisma.location.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        warehouse: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: updatedLocation
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error.message
    });
  }
};

/**
 * @route   DELETE /locations/:id
 * @desc    Delete location
 */
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.location.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Location with ID ${id} not found`
      });
    }

    await prisma.location.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      message: `Location "${existing.name}" (ID: ${id}) deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete location",
      error: error.message
    });
  }
};
