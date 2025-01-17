import { registerAs } from "@nestjs/config";

export default registerAs("server", () => ({
  be_dev_url: process.env.BE_DEV_URL,
  be_prod_url: process.env.BE_PROD_URL,
  port: parseInt(process.env.PORT, 10) || 3000
}));