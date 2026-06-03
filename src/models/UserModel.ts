import { RowDataPacket } from "mysql2";
import { BaseModel } from "./BaseModel";
import pool from "../config/db";

export interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

export class UserModel extends BaseModel<User> {
  protected tableName = "users";

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<User[]>(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows[0] ?? null;
  }
}

export const userModel = new UserModel();