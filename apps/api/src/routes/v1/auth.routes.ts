import { Router } from "express";
import { loginSchema, verifyOtpSchema } from "../../schemas/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { requireAuth, getAuthUser } from "../../middleware/auth.js";
import * as authService from "../../services/auth.service.js";
import { writeAudit } from "../../services/audit.service.js";

export const authRoutes = Router();

authRoutes.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password, subdomain } = req.body;
    const result = await authService.login(email, password, subdomain);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

authRoutes.post("/verify-otp", validateBody(verifyOtpSchema), async (req, res, next) => {
  try {
    const { email, otp, subdomain } = req.body;
    const result = await authService.verifyOtp(email, otp, subdomain);
    await writeAudit({
      action: "login",
      tableName: "users",
      recordId: (result.user as { id: string }).id,
      newVal: { email },
      req,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

authRoutes.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await authService.getMe(getAuthUser(req).sub);
    res.json(user);
  } catch (e) {
    next(e);
  }
});
