import { Request, Response } from "express";
import { categoryModel } from "../models/CategoryModel";

export class CategoryController {
  async index(_req: Request, res: Response): Promise<void> {
    try {
      const data = await categoryModel.getAllCached();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async store(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(422).json({ success: false, message: "name is required" });
        return;
      }
      const id = await categoryModel.createCategory(name);
      res.status(201).json({ success: true, data: { id }, message: "Category created" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      const ok = await categoryModel.updateCategory(Number(req.params.id), name);
      if (!ok) {
        res.status(404).json({ success: false, message: "Category not found" });
        return;
      }
      res.json({ success: true, message: "Category updated" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async destroy(req: Request, res: Response): Promise<void> {
    try {
      const ok = await categoryModel.deleteCategory(Number(req.params.id));
      if (!ok) {
        res.status(404).json({ success: false, message: "Category not found" });
        return;
      }
      res.json({ success: true, message: "Category deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const categoryController = new CategoryController();