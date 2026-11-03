import { Router } from "express";
import { supabase } from "../db.js";
const router = Router();



async function requireSuper(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    // Correctly remove "Bearer " from the access token
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    if (!supabase) {
      return res.status(503).json({
        error: "Database is not configured.",
      });
    }

    // Verify Supabase access token
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authData?.user) {
      console.error(
        "Super Admin token verification failed:",
        authError?.message
      );

      return res.status(401).json({
        error: "Invalid session.",
      });
    }

    // Verify Super Admin permission
    const {
      data,
      error,
    } = await supabase
      .from("super_admins")
      .select("user_id")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(403).json({
        error: "Super Admin permission required.",
      });
    }

    req.superUser = authData.user;

    return next();
  } catch (error) {
    return next(error);
  }
}


router.use(requireSuper);

router.get("/organizations", async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from("organizations")
      .select("id,name,organization_code,type,location,status,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (e) { next(e); }
});

router.post("/organizations", async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    const organizationCode = String(req.body?.organizationCode || "").trim();
    const type = String(req.body?.type || "Business");
    const location = String(req.body?.location || "").trim();
    if (!name || !organizationCode) return res.status(400).json({ error: "Organization name and manually-entered organization code are required." });
    if (!["Hospital","School","Hotel","Business"].includes(type)) return res.status(400).json({ error: "Invalid organization type." });
    const { data, error } = await supabase.from("organizations")
      .insert({ name, organization_code: organizationCode, slug: organizationCode.toLowerCase(),
        type, location, status: "active" }).select("id,name,organization_code,type,location,status").single();
    if (error) {
      if (error.code === "23505") return res.status(409).json({ error: "Organization code already exists." });
      throw error;
    }
    res.status(201).json({ data });
  } catch (e) { next(e); }
});

router.patch("/organizations/:id", async (req, res, next) => {
  try {
    const updates = {};
    if (typeof req.body?.name === "string" && req.body.name.trim()) updates.name = req.body.name.trim();
    if (typeof req.body?.location === "string") updates.location = req.body.location.trim();
    if (["Hospital","School","Hotel","Business"].includes(req.body?.type)) updates.type = req.body.type;
    if (["active","inactive"].includes(req.body?.status)) updates.status = req.body.status;
    if (typeof req.body?.organizationCode === "string" && req.body.organizationCode.trim()) {
      updates.organization_code = req.body.organizationCode.trim();
      updates.slug = req.body.organizationCode.trim().toLowerCase();
    }
    if (!Object.keys(updates).length) return res.status(400).json({ error: "No valid changes provided." });
    const { data, error } = await supabase.from("organizations").update(updates).eq("id", req.params.id)
      .select("id,name,organization_code,type,location,status").single();
    if (error) { if (error.code === "23505") return res.status(409).json({error:"Organization code already exists."}); throw error; }
    res.json({ data });
  } catch (e) { next(e); }
});


/*
 * Add these routes before:
 * export default router;
 *
 * They use the existing requireSuper middleware.
 */

// View all organization members, including admins, owners, staff, and viewers.
router.get("/members", async (_req, res, next) => {
  try {
    const [
      { data: members, error: memberError },
      { data: organizations, error: orgError },
    ] = await Promise.all([
      supabase
        .from("organization_members")
        .select("organization_id,user_id,role"),
      supabase
        .from("organizations")
        .select("id,name,organization_code,status"),
    ]);

    if (memberError) throw memberError;
    if (orgError) throw orgError;

    // Retrieve Supabase Auth users in pages.
    const users = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) throw error;

      const batch = data?.users || [];
      users.push(...batch);

      if (batch.length < perPage) break;
      page++;
    }

    const userMap = new Map(users.map((u) => [u.id, u]));
    const orgMap = new Map((organizations || []).map((o) => [o.id, o]));

    const result = (members || []).map((m) => {
      const user = userMap.get(m.user_id);
      const org = orgMap.get(m.organization_id);

      return {
        user_id: m.user_id,
        email: user?.email || "Email unavailable",
        full_name:
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          "",
        role: m.role,
        organization_id: m.organization_id,
        organization_name: org?.name || "Unknown organization",
        organization_code: org?.organization_code || "",
        organization_status: org?.status || "unknown",
        created_at: user?.created_at || null,
      };
    });

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// View all rows from approved organization data tables.
const ALLOWED_DATA_TABLES = new Set([
  "branches",
  "departments",
  "contacts",
  "templates",
  "campaigns",
  "messages",
]);

router.get("/data/:table", async (req, res, next) => {
  try {
    const table = String(req.params.table || "").toLowerCase();

    if (!ALLOWED_DATA_TABLES.has(table)) {
      return res.status(400).json({
        error: "This table is not available for Super Admin viewing.",
      });
    }

    let query = supabase.from(table).select("*").limit(500);

    const organizationId = String(
      req.query.organizationId || ""
    ).trim();

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id,name,organization_code");

    if (orgError) throw orgError;

    const orgMap = new Map(
      (organizations || []).map((org) => [org.id, org])
    );

    const result = (data || []).map((row) => {
      const org = orgMap.get(row.organization_id);

      return {
        ...row,
        organization_name: org?.name || "Unknown organization",
        organization_code: org?.organization_code || "",
      };
    });

    res.json({
      data: result,
      count: result.length,
      limit: 500,
    });
  } catch (error) {
    next(error);
  }
});


router.post("/organizations/:id/admins", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const role = String(req.body?.role || "admin");
    if (!email || password.length < 10) return res.status(400).json({ error: "Email and password (minimum 10 characters) are required." });
    if (!["owner","admin","staff","viewer"].includes(role)) return res.status(400).json({ error: "Invalid organization role." });
    const { data: org, error: orgError } = await supabase.from("organizations").select("id,status").eq("id",req.params.id).single();
    if (orgError) throw orgError;
    if (org.status !== "active") return res.status(409).json({ error: "Activate organization before creating its admin." });
    const { data: created, error: createError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (createError) throw createError;
    const { error: membershipError } = await supabase.from("organization_members")
      .insert({ organization_id: org.id, user_id: created.user.id, role });
    if (membershipError) {
      await supabase.auth.admin.deleteUser(created.user.id);
      if (membershipError.code === "23505") return res.status(409).json({ error: "This user is already a member of the organization." });
      throw membershipError;
    }
    res.status(201).json({ data: { userId: created.user.id, email, role, organizationId: org.id } });
  } catch (e) { next(e); }
});
export default router;
