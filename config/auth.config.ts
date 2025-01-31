import { registerAs } from "@nestjs/config";

export default registerAs("auth", () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY,
  adminSecret: process.env.ADMIN_SECRET,
  google_client_id: process.env.OAUTH_CLIENT_ID,
  google_oauth_secret: process.env.OAUTH_CLIENT_SECRET,
  google_callback_url: process.env.GOOGLE_OAUTH_URL
}));