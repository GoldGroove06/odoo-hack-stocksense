import prisma from "../config/prisma.js";

// GET /customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: "asc" }
    });
    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch customers", error: error.message });
  }
};

// POST /customers
export const createCustomer = async (req, res) => {
  try {
    const { name, address, gstNumber, phone, email, contactPerson } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Customer name is required" });
    }

    const customer = await prisma.customer.create({
      data: { name, address, gstNumber, phone, email, contactPerson }
    });

    res.status(201).json({ success: true, message: "Customer created successfully", data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create customer", error: error.message });
  }
};

// DELETE /customers/:id
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id: Number(id) } });
    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete customer", error: error.message });
  }
};
