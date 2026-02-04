import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  server: {
    host: true,
    port: 4200,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()",
      "Strict-Transport-Security":
        "max-age=31536000; includeSubDomains; preload",
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https: http:",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  },
  plugins: [react()],
});
