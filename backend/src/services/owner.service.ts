import { query } from "../db/pool.js";
import { quoteIdent } from "../db/tenant.js";
import { NotFoundError } from "../utils/errors.js";
import { buildPaginationMeta, sqlPagination } from "../utils/pagination.js";
import type {
  createOwnerSchema,
  ownerListQuerySchema,
  ownerDocumentSchema,
  updateKycStatusSchema,
} from "../schemas/owner.js";
import type { z } from "zod";

type CreateOwner = z.infer<typeof createOwnerSchema>;
type ListQuery = z.infer<typeof ownerListQuerySchema>;
type KycUpdate = z.infer<typeof updateKycStatusSchema>;
type OwnerDoc = z.infer<typeof ownerDocumentSchema>;

export async function listOwners(schemaName: string, q: ListQuery) {
  const { limit, offset } = sqlPagination(q.page, q.limit);
  const conditions = ["o.deleted_at IS NULL"];
  const params: unknown[] = [];
  let i = 1;

  if (q.kycStatus) {
    conditions.push(`o.kyc_status = $${i++}`);
    params.push(q.kycStatus);
  }
  if (q.unitId) {
    conditions.push(`o.unit_id = $${i++}`);
    params.push(q.unitId);
  }
  if (q.search) {
    conditions.push(`(o.name ILIKE $${i} OR o.mobile ILIKE $${i} OR o.email ILIKE $${i})`);
    params.push(`%${q.search}%`);
    i++;
  }

  const where = conditions.join(" AND ");
  const schema = quoteIdent(schemaName);

  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${schema}.owners o WHERE ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0]?.count ?? "0", 10);

  const { rows } = await query(
    `SELECT o.*, u.unit_no, p.name AS project_name
     FROM ${schema}.owners o
     LEFT JOIN ${schema}.units u ON u.id = o.unit_id
     LEFT JOIN ${schema}.projects p ON p.id = u.project_id
     WHERE ${where}
     ORDER BY o.created_at DESC LIMIT $${i++} OFFSET $${i}`,
    [...params, limit, offset]
  );

  return { data: rows, meta: buildPaginationMeta(total, q.page, q.limit) };
}

export async function getOwner(schemaName: string, id: string) {
  const schema = quoteIdent(schemaName);
  const { rows } = await query(
    `SELECT o.*, u.unit_no FROM ${schema}.owners o
     LEFT JOIN ${schema}.units u ON u.id = o.unit_id
     WHERE o.id = $1 AND o.deleted_at IS NULL`,
    [id]
  );
  if (!rows[0]) throw new NotFoundError("Owner not found");
  return rows[0];
}

export async function createOwner(schemaName: string, body: CreateOwner) {
  const schema = quoteIdent(schemaName);
  const { rows } = await query(
    `INSERT INTO ${schema}.owners
       (unit_id, name, mobile, email, aadhaar_no, pan_no, address, city, state, pincode, kyc_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') RETURNING *`,
    [
      body.unitId ?? null,
      body.name,
      body.mobile,
      body.email || null,
      body.aadhaarNo || null,
      body.panNo || null,
      body.address ?? null,
      body.city ?? null,
      body.state ?? null,
      body.pincode ?? null,
    ]
  );
  return rows[0];
}

export async function updateOwner(schemaName: string, id: string, body: Partial<CreateOwner>) {
  const old = await getOwner(schemaName, id);
  const schema = quoteIdent(schemaName);
  const { rows } = await query(
    `UPDATE ${schema}.owners SET
       unit_id = COALESCE($2, unit_id),
       name = COALESCE($3, name),
       mobile = COALESCE($4, mobile),
       email = COALESCE($5, email),
       aadhaar_no = COALESCE($6, aadhaar_no),
       pan_no = COALESCE($7, pan_no),
       address = COALESCE($8, address),
       city = COALESCE($9, city),
       state = COALESCE($10, state),
       pincode = COALESCE($11, pincode),
       kyc_status = CASE WHEN $12 IS NOT NULL THEN 'submitted' ELSE kyc_status END,
       updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    [
      id,
      body.unitId ?? null,
      body.name ?? null,
      body.mobile ?? null,
      body.email ?? null,
      body.aadhaarNo ?? null,
      body.panNo ?? null,
      body.address ?? null,
      body.city ?? null,
      body.state ?? null,
      body.pincode ?? null,
      body.aadhaarNo || body.panNo ? "submitted" : null,
    ]
  );
  return { old, updated: rows[0] };
}

export async function updateKycStatus(
  schemaName: string,
  id: string,
  body: KycUpdate,
  verifiedBy: string
) {
  await getOwner(schemaName, id);
  const schema = quoteIdent(schemaName);
  const { rows } = await query(
    `UPDATE ${schema}.owners SET
       kyc_status = $2,
       kyc_notes = $3,
       verified_at = CASE WHEN $2 = 'verified' THEN NOW() ELSE verified_at END,
       verified_by = CASE WHEN $2 = 'verified' THEN $4::uuid ELSE verified_by END,
       updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    [id, body.kycStatus, body.kycNotes ?? null, verifiedBy]
  );
  return rows[0];
}

export async function addOwnerDocument(schemaName: string, ownerId: string, body: OwnerDoc) {
  await getOwner(schemaName, ownerId);
  const schema = quoteIdent(schemaName);
  const { rows } = await query(
    `INSERT INTO ${schema}.owner_documents (owner_id, doc_type, file_url, file_name)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [ownerId, body.docType, body.fileUrl, body.fileName ?? null]
  );
  await query(
    `UPDATE ${schema}.owners SET kyc_status = 'submitted', updated_at = NOW()
     WHERE id = $1 AND kyc_status = 'pending'`,
    [ownerId]
  );
  return rows[0];
}

export async function listOwnerDocuments(schemaName: string, ownerId: string) {
  const schema = quoteIdent(schemaName);
  const { rows } = await query(
    `SELECT * FROM ${schema}.owner_documents
     WHERE owner_id = $1 AND deleted_at IS NULL ORDER BY uploaded_at DESC`,
    [ownerId]
  );
  return rows;
}

export async function deleteOwner(schemaName: string, id: string) {
  await getOwner(schemaName, id);
  const schema = quoteIdent(schemaName);
  await query(`UPDATE ${schema}.owners SET deleted_at = NOW() WHERE id = $1`, [id]);
  return { success: true };
}
