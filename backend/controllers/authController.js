import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { sendOtpEmail } from "../utils/email.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TOKEN_TTL = "15m";

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

function userPayload(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId ?? null,
    mustResetPassword: user.mustResetPassword,
  };
}

async function createAndSendOtp(user) {
  const code = String(crypto.randomInt(100000, 999999));
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.passwordResetOtp.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  await sendOtpEmail(user.email, code);
}

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "WAREHOUSE_STAFF",
        mustResetPassword: false,
      },
    });

    const token = signAppToken(user);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: userPayload(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.mustResetPassword) {
      await createAndSendOtp(user);
      return res.json({
        message: "Password reset required. An OTP has been sent to your email.",
        requiresPasswordReset: true,
        email: user.email,
      });
    }

    const token = signAppToken(user);

    res.json({
      message: "Login successful",
      token,
      user: userPayload(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to avoid email enumeration
    if (user) {
      await createAndSendOtp(user);
    }

    res.json({
      message: "If an account exists for that email, an OTP has been sent.",
      email: email.toLowerCase().trim(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const recentOtps = await prisma.passwordResetOtp.findMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    let matched = null;
    for (const record of recentOtps) {
      const ok = await bcrypt.compare(String(otp), record.codeHash);
      if (ok) {
        matched = record;
        break;
      }
    }

    if (!matched) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await prisma.passwordResetOtp.update({
      where: { id: matched.id },
      data: { usedAt: new Date() },
    });

    const resetToken = jwt.sign(
      { userId: user.id, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: RESET_TOKEN_TTL },
    );

    res.json({
      message: "OTP verified",
      resetToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired reset token" });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(401).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        password: hashedPassword,
        mustResetPassword: false,
      },
    });

    const token = signAppToken(user);

    res.json({
      message: "Password reset successful",
      token,
      user: userPayload(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: userPayload(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
