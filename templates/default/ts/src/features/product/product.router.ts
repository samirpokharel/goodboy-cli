import { Router } from "express";
import ProductController from "./product.controller";

export default class ProductRouter {
  static get routes(): Router {
    const router = Router();
    const productController = new ProductController();

    // Routes for Products
    router
      .route("/")
      .get(productController.getAllProducts)
      .post(productController.createProduct);

    router
      .route("/:id")
      .put(productController.updateProduct)
      .delete(productController.deleteProduct);

    return router;
  }
}
