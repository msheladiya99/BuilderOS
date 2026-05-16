import { query } from "../db/pool.js";
import { quoteIdent } from "../utils/sql.js";
import { NotFoundError } from "../utils/errors.js";
import { buildPaginationMeta, sqlPagination } from "../utils/pagination.js";
import type { createProjectSchema, projectListQuerySchema } from "../schemas/project.js";
import type { z } from "zod";

type CreateProject = z.infer<typeof createProjectSchema>;
type ListQuery = z.infer<typeof projectListQuerySchema>;

export async function listProjects(schemaName: string, q: ListQuery) {
  const { limit, offset } = sqlPagination(q.page, q.limit);
  const conditions = ["deleted_at IS NULL"];
  const params: unknown[] = [];
  let i = 1;

  if (q.status) {
    conditions.push(`status = $${i++}`);
    params.push(q.status);
  }
  if (q.search) {
    conditions.push(`(name ILIKE $${i} OR location ILIKE $${i})`);
    params.push(`%${q.search}%`);
    i++;
  }

  const where = conditions.join(" AND ");
  const schema = quoteIdent(schemaName);

  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${schema}.projects WHERE ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0]?.count ?? "0", 10);

  const { rows } = await query(
    `SELECT * FROM ${schema}.projects WHERE ${where}
     ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`,
    [...params, limit, offset]
  );

  return { data: rows, meta: buildPaginationMeta(total, q.page, q.limit) };
}

export async function getProject(schemaName: string, id: string) {
  const schema = quoteIdent(schemaName);
  const { rows } = await query(`SELECT * FROM ${schema}.projects WHERE id = $1 AND deleted_at IS NULL`, [id]);
  if (!rows[0]) throw new NotFoundError("Project not found");
  return rows[0];
}

export async function createProject(schemaName: string, body: CreateProject) {
  const schema = quoteIdent(schemaName);
  const { rows } = await query(
    `INSERT INTO ${schema}.projects (name, type, rera_no, location, status, budget, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      body.name,
      body.type,
      body.reraNo ?? null,
      body.location ?? null,
      body.status,
      body.budget ?? 0,
      body.imageUrl || null,
    ]
  );
  return rows[0];
}

export async function updateProject(schemaName: string, id: string, body: Partial<CreateProject>) {
  await getProject(schemaName, id);
  const schema = quoteIdent(schemaName);
  const { rows } = await query(
    `UPDATE ${schema}.projects SET
       name = COALESCE($2, name),
       type = COALESCE($3, type),
       rera_no = COALESCE($4, rera_no),
       location = COALESCE($5, location),
       status = COALESCE($6, status),
       budget = COALESCE($7, budget),
       image_url = COALESCE($8, image_url),
       updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    [
      id,
      body.name ?? null,
      body.type ?? null,
      body.reraNo ?? null,
      body.location ?? null,
      body.status ?? null,
      body.budget ?? null,
      body.imageUrl ?? null,
    ]
  );
  return rows[0];
}

export async function deleteProject(schemaName: string, id: string) {
  await getProject(schemaName, id);
  const schema = quoteIdent(schemaName);
  await query(`UPDATE ${schema}.projects SET deleted_at = NOW() WHERE id = $1`, [id]);
  return { success: true };
}
