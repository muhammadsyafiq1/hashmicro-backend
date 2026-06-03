import { RowDataPacket } from "mysql2";
import { BaseModel } from "./BaseModel";
import pool from "../config/db";
import { cache } from "../config/redis";

export interface Category extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

const CACHE_TTL = 120; // 2 menit

export class CategoryModel extends BaseModel<Category> {
  protected tableName = "categories";

  async getAllCached(): Promise<Category[]> {
    return cache.getOrSet<Category[]>(
      "categories:all",
      () => this.findAll(200),
      CACHE_TTL
    );
  }

  async getByIdCached(id: number): Promise<Category | null> {
    return cache.getOrSet<Category | null>(
      `categories:${id}`,
      () => this.findById(id),
      CACHE_TTL
    );
  }

  async createCategory(name: string): Promise<number> {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    const id = await this.create({ name, slug } as Partial<Category>);
    await cache.delPattern("categories:*");
    return id;
  }

  async updateCategory(id: number, name: string): Promise<boolean> {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    const ok = await this.update(id, { name, slug } as Partial<Category>);
    if (ok) await cache.delPattern("categories:*");
    return ok;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const ok = await this.delete(id);
    if (ok) await cache.delPattern("categories:*");
    return ok;
  }
}

export const categoryModel = new CategoryModel();