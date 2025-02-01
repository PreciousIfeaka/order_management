import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from "https";
import * as cron from "node-cron";

@Injectable()
export class CronService implements OnApplicationBootstrap {
  constructor(private configService: ConfigService) {};
  private readonly logger = new Logger(CronService.name);

  onApplicationBootstrap() {
    this.scheduleKeepAlive();
  };

  private keepAlive(url: string) {
    https
      .get(url, (res) => {
        this.logger.log(`Status: ${res.statusCode}`);
      })
      .on("error", (error) => {
        this.logger.error(`Error: ${error.message}`);
      });
  };
  
  private scheduleKeepAlive() {
    const url = this.configService.get<string>("server.be_prod_url");

    cron.schedule("*/10 * * * *", () => {
      this.keepAlive(url);
      this.logger.log("Pinging the server every 10 minute");
    });
  } 
}
