import prisma from "../config/prisma.js";

/**
 * @route   GET /products
 * @desc    List / search / filter products
 * @query   search, categoryId, uomId, locationId, lowStock, page, limit, sortBy, sortOrder
 */
export const listProducts = async (req, res) => {
  try {
    const {
      search,
      categoryId,
      uomId,
      locationId,
      lowStock,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (uomId) {
      where.uomId = parseInt(uomId);
    }

    if (locationId) {
      where.locationId = parseInt(locationId);
    }

    if (lowStock === "true") {
      where.onHand = {
        lte: prisma.product.fields.minStockAlert
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder.toLowerCase() === "asc" ? "asc" : "desc"
        },
        include: {
          category: { select: { id: true, name: true } },
          uom: { select: { id: true, name: true, symbol: true } },
          location: {
            select: {
              id: true,
              name: true,
              shortcode: true,
              warehouse: { select: { id: true, name: true, shortcode: true } }
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error("Error listing products:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
      error: error.message
    });
  }
};

/**
 * @route   GET /products/:id
 * @desc    Get single product details with relations
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        uom: true,
        location: {
          include: {
            warehouse: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message
    });
  }
};

/**
 * @route   POST /products
 * @desc    Create a new product
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      perUnitCost = 0.0,
      onHand = 0.0,
      freeToUse,
      minStockAlert = 10.0,
      categoryId,
      uomId,
      locationId
    } = req.body;

    if (!name || !sku) {
      return res.status(400).json({
        success: false,
        message: "Product name and SKU are required fields"
      });
    }

    // Check SKU uniqueness
    const existingSku = await prisma.product.findUnique({
      where: { sku: sku.trim() }
    });

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: `Product with SKU "${sku}" already exists`
      });
    }

    const calculatedFreeToUse = freeToUse !== undefined ? parseFloat(freeToUse) : parseFloat(onHand);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim(),
        description: description ? description.trim() : null,
        perUnitCost: parseFloat(perUnitCost) || 0.0,
        onHand: parseFloat(onHand) || 0.0,
        freeToUse: calculatedFreeToUse,
        minStockAlert: parseFloat(minStockAlert) || 10.0,
        categoryId: categoryId ? parseInt(categoryId) : null,
        uomId: uomId ? parseInt(uomId) : null,
        locationId: locationId ? parseInt(locationId) : null
      },
      include: {
        category: true,
        uom: true,
        location: true
      }
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message
    });
  }
};

/**
 * @route   PATCH /products/:id
 * @desc    Update an existing product
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      description,
      perUnitCost,
      onHand,
      freeToUse,
      minStockAlert,
      categoryId,
      uomId,
      locationId
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      });
    }

    // If SKU is changed, ensure uniqueness
    if (sku && sku.trim() !== existingProduct.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku: sku.trim() }
      });
      if (duplicateSku) {
        return res.status(409).json({
          success: false,
          message: `SKU "${sku}" is already assigned to another product`
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (sku !== undefined) updateData.sku = sku.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (perUnitCost !== undefined) updateData.perUnitCost = parseFloat(perUnitCost);
    if (onHand !== undefined) updateData.onHand = parseFloat(onHand);
    if (freeToUse !== undefined) updateData.freeToUse = parseFloat(freeToUse);
    if (minStockAlert !== undefined) updateData.minStockAlert = parseFloat(minStockAlert);
    if (categoryId !== undefined) updateData.categoryId = categoryId ? parseInt(categoryId) : null;
    if (uomId !== undefined) updateData.uomId = uomId ? parseInt(uomId) : null;
    if (locationId !== undefined) updateData.locationId = locationId ? parseInt(locationId) : null;

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        uom: true,
        location: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message
    });
  }
};

/**
 * @route   DELETE /products/:id
 * @desc    Delete a product
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      message: `Product "${existingProduct.name}" (ID: ${id}) deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message
    });
  }
};
