import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/UserModel";
import { AuthRequest } from "../middlewares/auth";

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(422).json({ success: false, message: "Email and password are required" });
        return;
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ success: false, message: "Invalid credentials" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: "Invalid credentials" });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: { id: user.id, name: user.name, email: user.email },
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(422).json({ success: false, message: "All fields are required" });
        return;
      }

      const existing = await userModel.findByEmail(email);
      if (existing) {
        res.status(409).json({ success: false, message: "Email already registered" });
        return;
      }

      const hashed = await bcrypt.hash(password, 10);
      const id = await userModel.create({ name, email, password: hashed } as any);

      res.status(201).json({
        success: true,
        message: "Register successful",
        data: { id },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    res.json({ success: true, data: req.user });
  }
}

export const authController = new AuthController();