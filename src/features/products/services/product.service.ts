import { prisma } from "@/lib/prisma";
import { generateSku as generateSkuLib } from "@/lib/sku";
import { deleteAsset } from "@/lib/cloudinary";
import { createProductSchema, updateProductSchema, formatZodError } from "@/lib/validations";

const VALID_SORT_FIELDS = ["price", "stock", "sold", "createdAt"];

interface ProductFilters {
  page?: string | number;
  limit?: string | number;
  search?: string;
  categoryId?: string | number;
  status?: string;
  featured?: string | boolean;
  sort?: string;
  order?: string;
}

export async function getAllProducts(params: ProductFilters = {}) {
  const page = Math.max(1, parseInt(String(params.page)) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(params.limit)) || 10));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (params.categoryId) {
    where.categoryId = parseInt(String(params.categoryId));
  }

  if (params.status === "active") {
    where.active = true;
  } else if (params.status === "inactive") {
    where.active = false;
  }

  if (params.featured === true || params.featured === "true") {
    where.featured = true;
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { sku: { contains: params.search, mode: "insensitive" } },
      { brand: { contains: params.search, mode: "insensitive" } },
    ] as const;
  }

  const sortField = params.sort && VALID_SORT_FIELDS.includes(params.sort) ? params.sort : "createdAt";
  const sortDir = params.order === "asc" ? "asc" : "desc";

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [sortField]: sortDir },
      skip,
      take: limit,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductById(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      imagesRel: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}

export async function createProduct(data: Record<string, unknown>) {
  const parsed = createProductSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Missing required fields: ${formatZodError(parsed.error)}`);
  }

  const { slug, categoryId, thumbnail, ...rest } = parsed.data as Record<string, unknown>;

  const [existingSlug, category] = await Promise.all([
    prisma.product.findUnique({ where: { slug: slug as string }, select: { id: true } }),
    prisma.category.findUnique({ where: { id: categoryId as number } }),
  ]);

  if (existingSlug) throw new Error("Slug already exists");
  if (!category) throw new Error("Category not found");

  const sku = parsed.data.sku || await generateSkuLib({
    title: parsed.data.title as string,
    brand: parsed.data.brand as string,
    categoryName: category.name,
  });

  return prisma.product.create({
    data: ({
      ...rest,
      slug: slug as string,
      thumbnail: thumbnail as string,
      categoryId: categoryId as number,
      sku: sku as string,
    }) as never,
    include: { category: true },
  });
}

export async function updateProduct(id: number, data: Record<string, unknown>) {
  const existing = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!existing) throw new Error("Product not found");

  const parsed = updateProductSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Validation error: ${formatZodError(parsed.error)}`);
  }

  const { slug, ...rest } = parsed.data as Record<string, unknown>;

  if (slug && slug !== existing.slug) {
    const slugExists = await prisma.product.findUnique({ where: { slug: slug as string }, select: { id: true } });
    if (slugExists) throw new Error("Slug already exists");
  }

  return prisma.product.update({
    where: { id },
    data: { ...rest, ...(slug ? { slug: slug as string } : {}) },
    include: { category: true },
  });
}

export async function deleteProduct(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { imagesRel: true },
  });

  if (!product) throw new Error("Product not found");

  for (const img of product.imagesRel) {
    try {
      await deleteAsset(img.publicId);
    } catch {
      console.error(`Failed to delete Cloudinary asset: ${img.publicId}`);
    }
  }

  await prisma.product.delete({ where: { id } });
}

export async function toggleProductStatus(id: number, active: boolean) {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new Error("Product not found");

  return prisma.product.update({
    where: { id },
    data: { active },
    include: { category: true },
  });
}

export async function toggleProductFeatured(id: number, featured: boolean) {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new Error("Product not found");

  return prisma.product.update({
    where: { id },
    data: { featured },
    include: { category: true },
  });
}

export async function updateProductStock(id: number, stock: number) {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new Error("Product not found");

  return prisma.product.update({
    where: { id },
    data: { stock },
    include: { category: true },
  });
}

export async function generateSku(categoryId: number, brand: string, title: string): Promise<string> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new Error("Category not found");

  return generateSkuLib({ title, brand, categoryName: category.name });
}
