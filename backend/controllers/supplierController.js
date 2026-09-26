import prisma from "../config/prisma.js";

// GET /suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" }
    });
    res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch suppliers", error: error.message });
  }
};

// POST /suppliers
export const createSupplier = async (req, res) => {
  try {
    const { name, address, gstNumber, phone, email, contactPerson } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Supplier name is required" });
    }

    const supplier = await prisma.supplier.create({
      data: { name, address, gstNumber, phone, email, contactPerson }
    });

    res.status(201).json({ success: true, message: "Supplier created successfully", data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create supplier", error: error.message });
  }
};

// DELETE /suppliers/:id
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.supplier.delete({ where: { id: Number(id) } });
    res.status(200).json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete supplier", error: error.message });
  }
};
