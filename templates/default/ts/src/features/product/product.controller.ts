import * as yup from "yup";
import { type Request, type Response, type NextFunction } from "express";

import ProductService from "./product.service";
import asyncHandler from "../../middleware/async.middleware";
import { AppError } from "../../helper/errors";
import { happyResponse } from "../../helper/happy-response";

const productSchema = yup
  .object({
    name: yup.string().required("Product name is required"),
    description: yup.string().optional(),
    price: yup.number().required("Product price is required").positive(),
    stock: yup.number().required("Stock quantity is required").min(0),
  })
  .noUnknown(true)
  .required();

export default class ProductController {
  readonly productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getAllProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const products = await this.productService.getAllProducts();
      res.status(200).send(happyResponse(products));
    }
  );

  getSingleProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const product = await this.productService.getSingleProduct(req.params.id);
      if (!product) throw AppError.notFound("Product not found");
      res.status(200).send(happyResponse(product));
    }
  );

  createProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await productSchema.validate(req.body, {
        strict: true,
        stripUnknown: false,
      });
      const product = await this.productService.createProduct(req.body);
      res.status(201).send(happyResponse(product));
    }
  );

  updateProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await productSchema.validate(req.body, {
        strict: true,
        stripUnknown: false,
      });
      const productId = req.params.id;
      if (!productId) throw AppError.badRequest("Product ID is Required");
      const updatedProduct = await this.productService.updateProduct(
        req.body,
        productId
      );
      if (!updatedProduct) throw AppError.notFound("Product not found");
      res.status(200).send(happyResponse(updatedProduct));
    }
  );

  deleteProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const productId = req.params.id;
      if (!productId) throw AppError.badRequest("Product ID is Required");
      const deletedProduct = await this.productService.deleteProduct(productId);
      if (!deletedProduct) throw AppError.notFound("Product not found");
      res.status(200).send(happyResponse(deletedProduct));
    }
  );
}
