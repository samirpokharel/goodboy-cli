import { PrismaClient, type Product } from "@prisma/client";
import { AppError } from "../../helper/errors";

export default class ProductService {
  private prismaClient: PrismaClient;
  constructor() {
    this.prismaClient = new PrismaClient();
  }

  getAllProducts = async (): Promise<Product[]> => {
    return await this.prismaClient.product.findMany();
  };

  getSingleProduct = async (id: string): Promise<Product | null> => {
    return await this.prismaClient.product.findUnique({ where: { id: id } });
  };

  createProduct = async (product: Omit<Product, "id">): Promise<Product> => {
    return await this.prismaClient.product.create({ data: product });
  };

  updateProduct = async (
    product: Omit<Product, "id">,
    productId: string
  ): Promise<Product> => {
    return await this.prismaClient.product.update({
      where: { id: productId },
      data: { ...product },
    });
  };

  deleteProduct = async (productId: string): Promise<Product> => {
    if (!productId) throw AppError.badRequest("Product ID not provided");
    return await this.prismaClient.product.delete({
      where: { id: productId },
    });
  };
}
