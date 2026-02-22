import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Vamos verificar o cookie de sessão do firebase ou algo simples.
    // Em uma implementação mais robusta usaríamos 'next-firebase-auth-edge'.
    // Para fins de teste/mvp vamos verificar um cookie 'auth-token' que será salvo no login.

    const token = request.cookies.get('auth-token')?.value;

    if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
