import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";

export type AuthRequest = Request & { user: JwtPayload };

export function getAuthUser(req: Request): JwtPayload {
  return (req as AuthRequest).user;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return next(new UnauthorizedError());
  (req as AuthRequest).user = payload;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!roles.includes(user.role)) return next(new ForbiddenError("Insufficient permissions"));
    next();
  };
}

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = (req as AuthRequest).user;
  if (user.role !== "superadmin") return next(new ForbiddenError("Super Admin only"));
  next();
}

export function requireTenant(req: Request, _res: Response, next: NextFunction) {
  const user = (req as AuthRequest).user;
  if (!user.schemaName) return next(new ForbiddenError("Tenant context required"));
  next();
}
