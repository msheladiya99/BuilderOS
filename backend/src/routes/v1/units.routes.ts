import { Router } from "express";
import {
  createUnitSchema,
  updateUnitSchema,
  unitListQuerySchema,
} from "../../schemas/unit.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { requireAuth, requireTenant, getAuthUser } from "../../middleware/auth.js";
import * as unitService from "../../services/unit.service.js";
import { writeAudit } from "../../services/audit.service.js";
import { paramId } from "../../utils/params.js";

export const unitRoutes = Router();

unitRoutes.use(requireAuth, requireTenant);

unitRoutes.get("/", validateQuery(unitListQuerySchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const q = unitListQuerySchema.parse(req.query);
    const result = await unitService.listUnits(user.schemaName!, q);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

unitRoutes.get("/:id", async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const item = await unitService.getUnit(user.schemaName!, paramId(req));
    res.json(item);
  } catch (e) {
    next(e);
  }
});

unitRoutes.post("/", validateBody(createUnitSchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const item = await unitService.createUnit(user.schemaName!, req.body);
    await writeAudit({
      action: "create",
      tableName: "units",
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

unitRoutes.patch("/:id", validateBody(updateUnitSchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const id = paramId(req);
    const old = await unitService.getUnit(user.schemaName!, id);
    const item = await unitService.updateUnit(user.schemaName!, id, req.body);
    await writeAudit({
      action: "update",
      tableName: "units",
      recordId: id,
      oldVal: old,
      newVal: item,
      req,
      schemaName: user.schemaName,
    });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

unitRoutes.delete("/:id", async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const id = paramId(req);
    const old = await unitService.getUnit(user.schemaName!, id);
    const result = await unitService.deleteUnit(user.schemaName!, id);
    await writeAudit({
      action: "delete",
      tableName: "units",
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
