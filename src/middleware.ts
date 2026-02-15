import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Extract path
  const path = request.nextUrl.pathname;

  // Define public and protected route logic
  const isPublicRoute = path === '/login';

  // Extract session
  const cookie = request.cookies.get('session');
  const session = cookie ? await decrypt(cookie.value) : null;

  // Redirect to login if unauthenticated on a protected route
  if (!isPublicRoute && (!session || !session.id)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to Dashboard if already authenticated and trying to hit login
  if (isPublicRoute && session?.id) {
    if (session.role === 'VOLUNTEER') {
      return NextResponse.redirect(new URL('/my-location-trips', request.url)); 
    }
    return NextResponse.redirect(new URL('/dashboard', request.url)); 
  }

  // Handle Role-Based Access Control
  if (session && session.id) {
    const role: string = session.role;
    
    // SUPER_ADMIN has full access to everything.
    
    // COMMAND_CENTER cannot access /settings
    if (role === 'COMMAND_CENTER' && path.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // REGION_ADMIN cannot access /settings
    if (role === 'REGION_ADMIN' && path.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // TRIP_ADMIN cannot access /settings, /users
    if (role === 'TRIP_ADMIN') {
      if (path.startsWith('/settings') || path.startsWith('/users')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Volunteer is heavily restricted. They only get /my-location-trips and maybe profile edits if we allow it
    if (role === 'VOLUNTEER') {
      // Basic block - Vol can only see their dedicated page or the login action internally
      const allowedPaths = ['/my-location-trips', '/api/'];
      if (!allowedPaths.some(p => path.startsWith(p)) && path !== '/' && path !== '/logout') {
        return NextResponse.redirect(new URL('/my-location-trips', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
