import prisma from "../config/prisma.js";

/**
 * @route   GET /categories
 * @desc    List all categories with products count
 */
export const listCategories = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    const categories = await prisma.category.findMany({
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
      data: categories
    });
  } catch (error) {
    console.error("Error listing categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
      error: error.message
    });
  }
};

/**
 * @route   GET /categories/:id
 * @desc    Get single category with associated products
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            perUnitCost: true,
            onHand: true,
            freeToUse: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message
    });
  }
};

/**
 * @route   POST /categories
 * @desc    Create a new category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const existing = await prisma.category.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Category "${name.trim()}" already exists`
      });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null
      }
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message
    });
  }
};

/**
 * @route   PATCH /categories/:id
 * @desc    Update category details
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`
      });
    }

    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.category.findUnique({
        where: { name: name.trim() }
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Category "${name.trim()}" already exists`
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message
    });
  }
};

/**
 * @route   DELETE /categories/:id
 * @desc    Delete a category
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: { select: { products: true } }
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      message: `Category "${existing.name}" (ID: ${id}) deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message
    });
  }
};
