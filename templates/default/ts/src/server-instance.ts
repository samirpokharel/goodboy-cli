//@ts-nocheck
import cors, { type CorsOptions } from "cors";
import {
  IncomingMessage,
  type ServerResponse,
  type Server as HttpServer,
} from "http";
import { createServer, type ServerOptions } from "https";
import dotenv from "dotenv";
import express, { Router } from "express";
import { ErrorMiddleware } from "./middleware/error.middleware";
import { AppError } from "./helper/errors";
import { HTTPStatusCode } from "./config/constant";

import ConnectPg from "connect-pg-simple";
const pgSession = ConnectPg();

interface ServerOption {
  port: number;
  routes: Router;
  apiPrefix: string;
  corsOption: CorsOptions;
  serverCertificateOptions?: ServerOptions;
}

export class Server {
  public readonly app = express();

  private readonly port: number;
  private readonly routes: Router;
  private readonly apiPrefix: string;
  private readonly corsOption: CorsOptions;
  private serverListner?: HttpServer<
    typeof IncomingMessage,
    typeof ServerResponse
  >;

  constructor(serverOption: ServerOption) {
    this.port = serverOption.port;
    this.routes = serverOption.routes;
    this.apiPrefix = serverOption.apiPrefix;
    this.corsOption = serverOption.corsOption;
  }

  async start(): Promise<void> {
    dotenv.config();

    // Middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors(this.corsOption));

    this.app.get("/healthcheck", (req, res, next) => {
      return res.status(HTTPStatusCode.Ok).send({
        status: "Working",
        message: "Welcome to Express App.. ",
      });
    });
    // Routes
    this.app.use(this.apiPrefix, this.routes);
    this.routes.all("*", (req, res, next) => {
      next(AppError.notFound(`Cant find ${req.originalUrl} on this server!`));
    });

    // Error Handler
    this.routes.use(ErrorMiddleware.handleError);

    this.serverListner = this.app.listen(this.port, () =>
      console.log(`Server Running on PORT: ${this.port}`)
    );
  }
  close(): void {
    this.serverListner?.close();
  }
}
