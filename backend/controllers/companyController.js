import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { sendInviteEmail } from "../utils/email.js";

const INVITE_ROLES = ["INVENTORY_MANAGER", "WAREHOUSE_STAFF"];

function generateTempPassword() {
  return crypto.randomBytes(4).toString("hex") + "A1!";
}

function signAppToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      companyId: user.companyId ?? null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
}

export const createCompany = async (req, res) => {
  try {
    const { name, address, phone, gstNumber } = req.body;

    if (!name || !address || !phone || !gstNumber) {
      return res.status(400).json({
        message: "Company name, address, phone and GST details are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.companyId) {
      return res.status(409).json({
        message: "You already belong to a company",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          gstNumber: gstNumber.trim(),
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          companyId: company.id,
          role: "OWNER",
        },
      });

      return { company, updatedUser };
    });

    const token = signAppToken(result.updatedUser);

    res.status(201).json({
      message: "Company created successfully",
      token,
      company: result.company,
      user: {
        id: result.updatedUser.id,
        name: result.updatedUser.name,
        email: result.updatedUser.email,
        role: result.updatedUser.role,
        companyId: result.updatedUser.companyId,
        mustResetPassword: result.updatedUser.mustResetPassword,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyCompany = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user?.companyId) {
      return res.status(404).json({ message: "No company found" });
    }

    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
    });

    if (!company) {
      return res.status(404).json({ message: "No company found" });
    }

    let members = undefined;
    if (user.role === "OWNER") {
      members = await prisma.user.findMany({
        where: { companyId: company.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          mustResetPassword: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });
    }

    res.json({
      company,
      members,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { email, name, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        message: "Email and role are required",
      });
    }

    if (!INVITE_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Role must be INVENTORY_MANAGER or WAREHOUSE_STAFF",
      });
    }

    const owner = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { company: true },
    });

    if (!owner?.companyId || owner.role !== "OWNER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const displayName = (name || normalizedEmail.split("@")[0]).trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let member;

    if (existing) {
      if (existing.companyId) {
        return res.status(409).json({
          message: "User already belongs to a company",
        });
      }

      member = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: name ? displayName : existing.name,
          companyId: owner.companyId,
          role,
          password: hashedPassword,
          mustResetPassword: true,
        },
      });
    } else {
      member = await prisma.user.create({
        data: {
          name: displayName,
          email: normalizedEmail,
          password: hashedPassword,
          role,
          companyId: owner.companyId,
          mustResetPassword: true,
        },
      });
    }

    await sendInviteEmail(normalizedEmail, {
      name: member.name,
      tempPassword,
      role,
    });

    res.status(201).json({
      message: "Member invited successfully",
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        mustResetPassword: member.mustResetPassword,
      },
      // Include temp password in response for local/dev convenience when SMTP is off
      ...(process.env.SMTP_HOST ? {} : { tempPassword }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMember = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { role } = req.body;

    if (!INVITE_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Role must be INVENTORY_MANAGER or WAREHOUSE_STAFF",
      });
    }

    const owner = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!owner?.companyId || owner.role !== "OWNER") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (userId === owner.id) {
      return res.status(400).json({
        message: "Cannot change your own owner role",
      });
    }

    const member = await prisma.user.findFirst({
      where: { id: userId, companyId: owner.companyId },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.role === "OWNER") {
      return res.status(400).json({ message: "Cannot change owner role" });
    }

    const updated = await prisma.user.update({
      where: { id: member.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustResetPassword: true,
      },
    });

    res.json({ message: "Member updated", member: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const owner = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!owner?.companyId || owner.role !== "OWNER") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (userId === owner.id) {
      return res.status(400).json({
        message: "Cannot remove yourself as owner",
      });
    }

    const member = await prisma.user.findFirst({
      where: { id: userId, companyId: owner.companyId },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.role === "OWNER") {
      return res.status(400).json({ message: "Cannot remove the owner" });
    }

    await prisma.user.update({
      where: { id: member.id },
      data: {
        companyId: null,
        role: "WAREHOUSE_STAFF",
      },
    });

    res.json({ message: "Member removed from company" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
