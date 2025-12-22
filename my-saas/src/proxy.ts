import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public pages (anyone can access)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);


export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect()
})

export const config = {
  // Run middleware on all routes except Next.js internals and static files
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};