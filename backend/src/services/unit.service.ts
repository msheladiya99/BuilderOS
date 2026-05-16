import { query } from "../db/pool.js";
import { quoteIdent } from "../db/tenant.js";
import { NotFoundError } from "../utils/errors.js";
import { buildPaginationMeta, sqlPagination } from "../utils/pagination.js";
import type { createUnitSchema, unitListQuerySchema } from "../schemas/unit.js";
import type { z } from "zod";

type CreateUnit = z.infer<typeof createUnitSchema>;
type ListQuery = z.infer<typeof unitListQuerySchema>;

export async function listUnits(schemaName: string, q: ListQuery) {
  const { limit, offset } = sqlPagination(q.page, q.limit);
  const conditions = ["u.deleted_at IS NULL"];
  const params: unknown[] = [];
  let i = 1;

  if (q.projectId) {
    conditions.push(`u.project_id = $${i++}`);
    params.push(q.projectId);
  }
  if (q.status) {
    conditions.push(`u.status = $${i++}`);
    params.push(q.status);
  }
  if (q.search) {
    conditions.push(`(u.unit_no ILIKE $${i} OR u.tower ILIKE $${i})`);
    params.push(`%${q.search}%`);
    i++;
  }

  const where = conditions.join(" AND ");
  const schema = quoteIdent(schemaName);

  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${schema}.units u WHERE ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0]?.count ?? "0", 10);

  const { rows } = await query(
    `SELECT u.*, p.name AS project_name FROM ${schema}.units u
     JOIN ${schema}.projects p ON p.id = u.project_id
     WHERE ${where}
     ORDER BY u.unit_no ASC LIMIT $${i++} OFFSET $${i}`,
    [...params, limit, offset]
  );

  return { data: rows, meta: buildPaginationMeta(total, q.page, q.limit) };
}

export async function getUnit(schemaName: string, id: string) {
  const schema = quoteIdent(schemaName);
  const { rows } = await query(`SELECT * FROM ${schema}.units WHERE id = $1 AND deleted_at IS NULL`, [id]);
  if (!rows[0]) throw new NotFoundError("Unit not found");
  return rows[0];
}

export async function createUnit(schemaName: string, body: CreateUnit) {
  const schema = quoteIdent(schemaName);
  const { rows } = await query(
    `INSERT INTO ${schema}.units (project_id, unit_no, type, floor, tower, area_sqft, status, base_price)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      body.projectId,
      body.unitNo,
      body.type ?? null,
      body.floor ?? null,
      body.tower ?? null,
      body.areaSqft ?? null,
      body.status,
      body.basePrice ?? 0,
    ]
  );
  return rows[0];
}

export async function updateUnit(schemaName: string, id: string, body: Partial<CreateUnit>) {
  await getUnit(schemaName, id);
  const schema = quoteIdent(schemaName);
  const { rows } = await query(
    `UPDATE ${schema}.units SET
       unit_no = COALESCE($2, unit_no),
       type = COALESCE($3, type),
       floor = COALESCE($4, floor),
       tower = COALESCE($5, tower),
       area_sqft = COALESCE($6, area_sqft),
       status = COALESCE($7, status),
       base_price = COALESCE($8, base_price),
       updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    [
      id,
      body.unitNo ?? null,
      body.type ?? null,
      body.floor ?? null,
      body.tower ?? null,
      body.areaSqft ?? null,
      body.status ?? null,
      body.basePrice ?? null,
    ]
  );
  return rows[0];
}

export async function deleteUnit(schemaName: string, id: string) {
  await getUnit(schemaName, id);
  const schema = quoteIdent(schemaName);
  await query(`UPDATE ${schema}.units SET deleted_at = NOW() WHERE id = $1`, [id]);
  return { success: true };
}
