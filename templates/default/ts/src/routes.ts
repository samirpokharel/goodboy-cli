import express, { Router } from "express";
import ProductRouter from "./features/product/product.router";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use("/products", ProductRouter.routes);
    return router;
  }
}