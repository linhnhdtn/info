import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/schedule/:path*",
    "/notes/:path*",
    "/api/profile/:path*",
    "/api/work/:path*",
    "/api/events/:path*",
    "/api/notes/:path*",
    "/api/upload/:path*",
  ],
}
