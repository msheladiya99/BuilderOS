import { Router } from "express";
import * as authService from "../../services/auth.service.js";

export const tenantRoutes = Router();

tenantRoutes.get("/:subdomain", async (req, res, next) => {
  try {
    const result = await authService.resolveTenantPortal(req.params.subdomain);
    res.json({
      project: {
        id: result.company.id,
        name: result.company.name,
        subdomain: result.company.subdomain,
        logo: result.company.logoUrl,
        gstNo: result.company.gstNo,
      },
      roles: result.roles,
    });
  } catch (e) {
    next(e);
  }
});
