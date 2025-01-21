import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/api/webhooks/clerk", "/api/webhooks/stripe"],
  ignoredRoutes: ["/api/webhooks/clerk", "/api/webhooks/stripe"]
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
  runtime: "nodejs"
};