import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/env";
import { copySessionResponse, refreshSupabaseSession } from "@/lib/supabase/proxy";

const publicRoutes = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
]);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const { response, userId } = await refreshSupabaseSession(request);
  const isPublic = publicRoutes.has(path);

  if (path === "/") {
    const destination = userId ? "/dashboard" : "/login";
    return copySessionResponse(response, NextResponse.redirect(new URL(destination, request.url)));
  }

  if (!isPublic && !userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    if (!getSupabasePublicConfig()) loginUrl.searchParams.set("reason", "configuration");
    return copySessionResponse(response, NextResponse.redirect(loginUrl));
  }

  if (isPublic && userId && path !== "/auth/callback" && path !== "/reset-password") {
    return copySessionResponse(
      response,
      NextResponse.redirect(new URL("/dashboard", request.url)),
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
