import { Router } from "express";
import {
  createOwnerSchema,
  updateOwnerSchema,
  updateKycStatusSchema,
  ownerDocumentSchema,
  ownerListQuerySchema,
} from "../../schemas/owner.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { requireAuth, requireTenant, getAuthUser } from "../../middleware/auth.js";
import * as ownerService from "../../services/owner.service.js";
import { writeAudit } from "../../services/audit.service.js";
import { paramId } from "../../utils/params.js";

export const ownerRoutes = Router();

ownerRoutes.use(requireAuth, requireTenant);

ownerRoutes.get("/", validateQuery(ownerListQuerySchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const q = ownerListQuerySchema.parse(req.query);
    const result = await ownerService.listOwners(user.schemaName!, q);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

ownerRoutes.get("/:id", async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const id = paramId(req);
    const item = await ownerService.getOwner(user.schemaName!, id);
    const documents = await ownerService.listOwnerDocuments(user.schemaName!, id);
    res.json({ ...item, documents });
  } catch (e) {
    next(e);
  }
});

ownerRoutes.post("/", validateBody(createOwnerSchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const item = await ownerService.createOwner(user.schemaName!, req.body);
    await writeAudit({
      action: "create",
      tableName: "owners",
      recordId: item.id as string,
      newVal: item,
      req,
      schemaName: user.schemaName,
    });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

ownerRoutes.patch("/:id", validateBody(updateOwnerSchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const id = paramId(req);
    const { old, updated } = await ownerService.updateOwner(user.schemaName!, id, req.body);
    await writeAudit({
      action: "update",
      tableName: "owners",
      recordId: id,
      oldVal: old,
      newVal: updated,
      req,
      schemaName: user.schemaName,
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

ownerRoutes.patch("/:id/kyc", validateBody(updateKycStatusSchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const id = paramId(req);
    const item = await ownerService.updateKycStatus(user.schemaName!, id, req.body, user.sub);
    await writeAudit({
      action: "update",
      tableName: "owners",
      recordId: id,
      newVal: { kycStatus: req.body.kycStatus },
      req,
      schemaName: user.schemaName,
    });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

ownerRoutes.post("/:id/documents", validateBody(ownerDocumentSchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const doc = await ownerService.addOwnerDocument(user.schemaName!, paramId(req), req.body);
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

ownerRoutes.delete("/:id", async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const id = paramId(req);
    const old = await ownerService.getOwner(user.schemaName!, id);
    const result = await ownerService.deleteOwner(user.schemaName!, id);
    await writeAudit({
      action: "delete",
      tableName: "owners",
      recordId: id,
      oldVal: old,
      req,
      schemaName: user.schemaName,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});
