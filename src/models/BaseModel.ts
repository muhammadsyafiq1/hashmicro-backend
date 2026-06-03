import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";


export abstract class BaseModel<T extends RowDataPacket> {
  protected abstract tableName: string;


  async findAll(limit = 100, offset = 0): Promise<T[]> {
    // LIMIT + OFFSET untuk pagination
    const [rows] = await pool.query<T[]>(
      `SELECT * FROM \`${this.tableName}\` ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  async findById(id: number): Promise<T | null> {
    const [rows] = await pool.query<T[]>(
      `SELECT * FROM \`${this.tableName}\` WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async countAll(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM \`${this.tableName}\``
    );
    return rows[0].total as number;
  }


  async create(data: Partial<T>): Promise<number> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    const columns = keys.map((k) => `\`${k}\``).join(", ");

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO \`${this.tableName}\` (${columns}) VALUES (${placeholders})`,
      values
    );
    return result.insertId;
  }


  async update(id: number, data: Partial<T>): Promise<boolean> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k) => `\`${k}\` = ?`).join(", ");

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE \`${this.tableName}\` SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    return result.affectedRows > 0;
  }

  //DELETE

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM \`${this.tableName}\` WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  //DB transaction helper
  async withTransaction<R>(
    operations: (conn: typeof pool) => Promise<R>
  ): Promise<R> {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      const result = await operations(conn as unknown as typeof pool);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}