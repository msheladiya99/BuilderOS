import { Router } from "express";
import {
  createProjectSchema,
  updateProjectSchema,
  projectListQuerySchema,
} from "../../schemas/project.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { requireAuth, requireTenant, getAuthUser } from "../../middleware/auth.js";
import * as projectService from "../../services/project.service.js";
import { writeAudit } from "../../services/audit.service.js";
import { paramId } from "../../utils/params.js";

export const projectRoutes = Router();

projectRoutes.use(requireAuth, requireTenant);

projectRoutes.get("/", validateQuery(projectListQuerySchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const q = projectListQuerySchema.parse(req.query);
    const result = await projectService.listProjects(user.schemaName!, q);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

projectRoutes.get("/:id", async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const item = await projectService.getProject(user.schemaName!, paramId(req));
    res.json(item);
  } catch (e) {
    next(e);
  }
});

projectRoutes.post("/", validateBody(createProjectSchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const item = await projectService.createProject(user.schemaName!, req.body);
    await writeAudit({
      action: "create",
      tableName: "projects",
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

projectRoutes.patch("/:id", validateBody(updateProjectSchema), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const id = paramId(req);
    const old = await projectService.getProject(user.schemaName!, id);
    const item = await projectService.updateProject(user.schemaName!, id, req.body);
    await writeAudit({
      action: "update",
      tableName: "projects",
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

projectRoutes.delete("/:id", async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const id = paramId(req);
    const old = await projectService.getProject(user.schemaName!, id);
    const result = await projectService.deleteProject(user.schemaName!, id);
    await writeAudit({
      action: "delete",
      tableName: "projects",
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
