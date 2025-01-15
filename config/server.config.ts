import { registerAs } from "@nestjs/config";

export default registerAs("server", () => ({
  be_url: process.env.BE_BASE_URL,
  port: parseInt(process.env.PORT, 10) || 3000
}));