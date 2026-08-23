import { Request, Response, NextFunction } from "express";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";

export interface AuthedUser {
  id: string;
  email: string | null;
  role: "user" | "admin";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

/**
 * Verifies the caller's Supabase JWT (sent as `Authorization: Bearer <jwt>`)
 * and attaches req.user. The user id ALWAYS comes from the verified token,
 * never from the request body — per SPEC.md security requirements.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    req.user = {
      id: data.user.id,
      email: data.user.email ?? null,
      role: (profile?.role as "user" | "admin") || "user",
    };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
