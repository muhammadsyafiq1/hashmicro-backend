import { RowDataPacket } from "mysql2";
import { BaseModel } from "./BaseModel";
import pool from "../config/db";
import { cache } from "../config/redis";

export interface Product extends RowDataPacket {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_name?: string;
  created_at: Date;
  updated_at: Date;
}

const CACHE_TTL = 60; // 1 menit

export class ProductModel extends BaseModel<Product> {
  protected tableName = "products";

  //Ambil semua produk dengan JOIN ke categories.
  //Menggunakan covering index pada category_id.
  //Nested loop demo: hitung total value per category.
  async getAllWithCategory(
    limit = 20,
    offset = 0,
    search = "",
  ): Promise<{
    products: Product[];
    total: number;
    summary: Record<string, number>;
  }> {
    const cacheKey = `products:list:${limit}:${offset}:${search}`;

    return cache.getOrSet(
      cacheKey,
      async () => {
        const searchParam = `%${search}%`;
        const hasSearch = search.trim() !== "";

        // Query JOIN dengan index hint
        const [products] = await pool.query<Product[]>(
          `SELECT p.*, c.name AS category_name
           FROM products p
           INNER JOIN categories c ON p.category_id = c.id
           ${hasSearch ? "WHERE p.name LIKE ? OR p.description LIKE ?" : ""}
           ORDER BY p.id DESC
           LIMIT ? OFFSET ?`,
          hasSearch
            ? [searchParam, searchParam, limit, offset]
            : [limit, offset],
        );

        const [[{ total }]] = await pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total FROM products p
           ${hasSearch ? "WHERE p.name LIKE ? OR p.description LIKE ?" : ""}`,
          hasSearch ? [searchParam, searchParam] : [],
        );

        const summary: Record<string, number> = {};
        for (const product of products) {
          // Nested if: hanya hitung jika stock > 0
          if (product.category_name) {
            if (product.stock > 0) {
              const catKey = product.category_name;
              if (!summary[catKey]) {
                summary[catKey] = 0;
              }
              // Math: total inventory value = price × stock
              summary[catKey] += product.price * product.stock;
            }
          }
        }

        return { products, total: Number(total), summary };
      },
      CACHE_TTL,
    );
  }

  async createProduct(
    data: Omit<Product, "id" | "created_at" | "updated_at" | "category_name">,
  ): Promise<number> {
    const id = await this.create(data as Partial<Product>);
    await cache.delPattern("products:*");
    return id;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<boolean> {
    const ok = await this.update(id, data);
    if (ok) await cache.delPattern("products:*");
    return ok;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const ok = await this.delete(id);
    if (ok) await cache.delPattern("products:*");
    return ok;
  }

  async getByIdWithCategory(id: number): Promise<Product | null> {
    return cache.getOrSet<Product | null>(
      `products:detail:${id}`,
      async () => {
        const [rows] = await pool.query<Product[]>(
          `SELECT p.*, c.name AS category_name
           FROM products p
           INNER JOIN categories c ON p.category_id = c.id
           WHERE p.id = ? LIMIT 1`,
          [id],
        );
        return rows[0] ?? null;
      },
      CACHE_TTL,
    );
  }
}

export const productModel = new ProductModel();
