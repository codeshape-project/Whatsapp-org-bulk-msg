
import { supabase } from "../db.js";

export async function requireAuth(req, res, next) {
  try {
    if (!supabase) {
      return res.status(503).json({
        error: "Database is not configured.",
      });
    }

    // 1. Extract and validate the Supabase access token
    const token = (req.headers.authorization || "")
      .replace(/^Bearer\s+/i, "")
      .trim();

    if (!token) {
      return res.status(401).json({
        error: "Sign in to continue.",
      });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: "Your session is invalid or expired. Please sign in again.",
      });
    }

    req.user = data.user;

    // 2. Get organization identifier from request header
    const orgId = String(
      req.headers["x-organization-id"] || ""
    ).trim();

    if (!orgId) {
      return res.status(400).json({
        error: "Select an organization first.",
      });
    }

    // 3. Determine whether identifier is a UUID
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        orgId
      );

    let orgRow = null;
    let orgError = null;

    // 4. Lookup organization by UUID, slug, or organization code
    if (isUuid) {
      const result = await supabase
        .from("organizations")
        .select("id, slug, organization_code")
        .eq("id", orgId)
        .maybeSingle();

      orgRow = result.data;
      orgError = result.error;
    } else {
      // First attempt: lookup by slug
      const slugResult = await supabase
        .from("organizations")
        .select("id, slug, organization_code")
        .eq("slug", orgId)
        .maybeSingle();

      orgRow = slugResult.data;
      orgError = slugResult.error;

      // Second attempt: lookup by organization_code
      if (!orgError && !orgRow) {
        const codeResult = await supabase
          .from("organizations")
          .select("id, slug, organization_code")
          .ilike("organization_code", orgId)
          .maybeSingle();

        orgRow = codeResult.data;
        orgError = codeResult.error;
      }
    }

    if (orgError) {
      throw orgError;
    }

    if (!orgRow) {
      return res.status(404).json({
        error: "Organization not found.",
      });
    }

    // 5. Verify user belongs to this organization
    const {
      data: membership,
      error: memberError,
    } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("organization_id", orgRow.id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (memberError) {
      throw memberError;
    }

    if (!membership) {
      return res.status(403).json({
        error: "You do not have access to this organization.",
      });
    }

    // 6. Attach organization context to request
    req.organizationId = orgRow.id;
    req.organizationSlug = orgRow.slug;
    req.membership = membership;

    return next();
  } catch (error) {
    return next(error);
  }
}

// Organization owner/admin permission middleware
export function requireOwner(req, res, next) {
  if (!["owner", "admin"].includes(req.membership?.role)) {
    return res.status(403).json({
      error: "Organization admin permission is required.",
    });
  }

  return next();
}
