import { Request, Response } from "express";
import { productModel } from "../models/ProductModel";

export class ProductController {
  async index(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const offset = Number(req.query.offset) || 0;
      const search = String(req.query.search || "");

      const result = await productModel.getAllWithCategory(limit, offset, search);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const product = await productModel.getByIdWithCategory(Number(req.params.id));
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, data: product });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async store(req: Request, res: Response): Promise<void> {
    try {
      const { category_id, name, description, price, stock } = req.body;

      // Nested if validation
      if (!name || !category_id) {
        res.status(422).json({ success: false, message: "name and category_id are required" });
        return;
      }
      if (isNaN(Number(price)) || Number(price) < 0) {
        res.status(422).json({ success: false, message: "price must be a non-negative number" });
        return;
      }
      if (isNaN(Number(stock)) || Number(stock) < 0) {
        res.status(422).json({ success: false, message: "stock must be a non-negative integer" });
        return;
      }

      const id = await productModel.createProduct({ category_id, name, description, price, stock });
      res.status(201).json({ success: true, data: { id }, message: "Product created" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { category_id, name, description, price, stock } = req.body;
      const ok = await productModel.updateProduct(Number(req.params.id), {
        category_id, name, description, price, stock,
      });
      if (!ok) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, message: "Product updated" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async destroy(req: Request, res: Response): Promise<void> {
    try {
      const ok = await productModel.deleteProduct(Number(req.params.id));
      if (!ok) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, message: "Product deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const productController = new ProductController();