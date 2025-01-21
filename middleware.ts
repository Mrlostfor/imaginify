import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/api/webhooks/clerk", "/api/webhooks/stripe"],
  
  afterAuth(auth, req) {
    // Get the current path from the URL
    const url = new URL(req.url);
    const path = url.pathname;

    // Handle authentication paths
    const isAuthPath = path.startsWith("/sign-in") || path.startsWith("/sign-up");
    
    // If the user is signed in and trying to access auth pages, redirect to home
    if (auth.userId && isAuthPath) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    // If the user is not signed in and trying to access a protected route
    if (!auth.userId && !isAuthPath && !path.startsWith("/api")) {
      const redirectUrl = new URL("/sign-in", req.url);
      redirectUrl.searchParams.set("redirect_url", path);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
  runtime: "nodejs"
};