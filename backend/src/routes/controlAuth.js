import { Router } from "express";
import { supabase } from "../db.js";
const router = Router();

async function getUser(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token || !supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    console.error("Supabase token verification failed:", error?.message);
    return null;
  }

  return data.user;
}

// Verify role after Supabase has authenticated email/password.
// Organization users must provide an organization code; super admins must not.
router.post("/verify-login", async (req, res, next) => {
  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Invalid or expired session." });
    const code = String(req.body?.organizationCode || "").trim();
    const { data: superAdmin, error: superError } = await supabase
      .from("super_admins").select("user_id").eq("user_id", user.id).maybeSingle();
    if (superError) throw superError;
    if (superAdmin) return res.json({ data: { role: "super_admin", userId: user.id, email: user.email } });
    if (!code) return res.status(400).json({ error: "Organization code is required for organization users." });
    const { data: org, error: orgError } = await supabase.from("organizations")
      .select("id,name,organization_code,status,type,location")
      .ilike("organization_code", code).maybeSingle();
    if (orgError) throw orgError;
    if (!org) return res.status(401).json({ error: "Invalid organization code." });
    if (org.status !== "active") return res.status(403).json({ error: "This organization is inactive." });
    const { data: membership, error: membershipError } = await supabase.from("organization_members")
      .select("role").eq("organization_id", org.id).eq("user_id", user.id).maybeSingle();
    if (membershipError) throw membershipError;
    if (!membership) return res.status(403).json({ error: "This account is not a member of the organization." });
    return res.json({ data: { role: membership.role, userId: user.id, email: user.email,
      organizationId: org.id, organizationName: org.name, organizationCode: org.organization_code } });
  } catch (error) { next(error); }
});

export default router;
