import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhooks/clerk",
    "/api/webhooks/stripe"
  ],
  ignoredRoutes: ["/api/webhooks/clerk", "/api/webhooks/stripe"],
  afterAuth(auth, req) {
    // Handle authentication and redirects
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // If user is signed in and tries to access auth pages, redirect them to home
    if (auth.userId && (req.url.includes('/sign-in') || req.url.includes('/sign-up'))) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
  runtime: "nodejs"
};