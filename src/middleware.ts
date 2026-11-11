import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/admissions(.*)',
  '/api/send-email(.*)',
  '/api/payments(.*)',
  '/favicon-preview(.*)',
  '/dashboard(.*)',
  '/parent(.*)'
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isTeacherRoute = createRouteMatcher(['/teacher(.*)']);
const isParentRoute = createRouteMatcher(['/parent(.*)']);
const isStudentRoute = createRouteMatcher(['/student(.*)']);

const middlewareHandler = hasClerkKey
  ? clerkMiddleware(async (auth, request) => {
      // 1. Allow public routes without authentication
      if (isPublicRoute(request)) {
        return;
      }

      // 2. Protect all non-public routes
      const authObj = await auth();
      if (!authObj.userId) {
        return authObj.redirectToSignIn({ returnBackUrl: request.url });
      }

      // 3. Resolve role from Clerk session claims
      const claims = authObj.sessionClaims as any;
      const userRole: string = claims?.metadata?.role || claims?.role || 'admin';

      // 4. Role-based Route Protection
      if (isAdminRoute(request) && userRole !== 'admin') {
        const dest = userRole === 'teacher' ? '/teacher' : userRole === 'parent' ? '/parent' : '/student';
        return NextResponse.redirect(new URL(dest, request.url));
      }

      if (isTeacherRoute(request) && userRole !== 'teacher' && userRole !== 'admin') {
        const dest = userRole === 'parent' ? '/parent' : '/student';
        return NextResponse.redirect(new URL(dest, request.url));
      }

      if (isParentRoute(request) && userRole !== 'parent' && userRole !== 'admin') {
        const dest = userRole === 'teacher' ? '/teacher' : '/student';
        return NextResponse.redirect(new URL(dest, request.url));
      }

      if (isStudentRoute(request) && userRole !== 'student' && userRole !== 'admin') {
        const dest = userRole === 'teacher' ? '/teacher' : '/parent';
        return NextResponse.redirect(new URL(dest, request.url));
      }
    })
  : (_request: NextRequest) => NextResponse.next();

export default middlewareHandler;

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
