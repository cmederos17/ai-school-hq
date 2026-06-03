import { NextResponse, type NextRequest } from 'next/server'

// Auth protection disabled during development — re-enable before launch
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
