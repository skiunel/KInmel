import mongoose from 'mongoose';
import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
import { ApiError } from '../utils/api-error';
import { slugify, getPagination } from '../utils/helpers';
import * as categoryService from './category.service';
import type { CreateProductInput, UpdateProductInput, ProductQuery } from '../validators/product.validators';

// ─── Response Shape ───

interface PaginatedProducts {
  products: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Sort Map ───

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  rating: { averageRating: -1, reviewCount: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
};

// ─── List Products (Public) ───

export const getAll = async (query: ProductQuery): Promise<PaginatedProducts> => {
  const { page, limit, search, category, minPrice, maxPrice, sort, featured, inStock } = query;
  const { skip } = getPagination(page, limit);

  // Build filter
  const filter: Record<string, unknown> = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    // Accept slug or ObjectId
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    } else {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.category = cat._id;
      } else {
        // No matching category → return empty
        return {
          products: [],
          pagination: { page, limit, total: 0, pages: 0, hasNext: false, hasPrev: false },
        };
      }
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) (filter.price as Record<string, number>).$gte = minPrice;
    if (maxPrice !== undefined) (filter.price as Record<string, number>).$lte = maxPrice;
  }

  if (featured === 'true') filter.isFeatured = true;
  if (inStock === 'true') filter.stock = { $gt: 0 };

  const sortOption = SORT_MAP[sort] || SORT_MAP.newest;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    products: products as unknown as IProduct[],
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
};

// ─── Get Featured Products ───

export const getFeatured = async (limit = 8): Promise<IProduct[]> => {
  return Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean() as unknown as Promise<IProduct[]>;
};

// ─── Get Single Product (Public) ───

export const getBySlug = async (slug: string): Promise<IProduct> => {
  const product = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug');

  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  return product;
};

// ─── Get Product by ID (Admin) ───

export const getById = async (id: string): Promise<IProduct> => {
  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  return product;
};

// ─── Create Product (Admin) ───

export const create = async (input: CreateProductInput): Promise<IProduct> => {
  // Validate category exists
  const categoryExists = await Category.findById(input.category);
  if (!categoryExists) {
    throw ApiError.badRequest('Category not found');
  }

  // Generate slug, handle collision
  let slug = slugify(input.name);
  const existingSlug = await Product.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  // Check SKU uniqueness
  const existingSku = await Product.findOne({ sku: input.sku.toUpperCase() });
  if (existingSku) {
    throw ApiError.conflict('A product with this SKU already exists');
  }

  // Validate compare price
  if (input.compareAtPrice && input.compareAtPrice <= input.price) {
    throw ApiError.badRequest('Compare-at price must be higher than the selling price');
  }

  const product = await Product.create({ ...input, slug });

  // Sync category product count
  await categoryService.syncProductCount(input.category);

  return product.populate('category', 'name slug');
};

// ─── Update Product (Admin) ───

export const update = async (id: string, input: UpdateProductInput): Promise<IProduct> => {
  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const oldCategoryId = product.category.toString();

  // If name changes, regenerate slug
  if (input.name && input.name !== product.name) {
    let slug = slugify(input.name);
    const existingSlug = await Product.findOne({ slug, _id: { $ne: id } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    product.slug = slug;
  }

  // If SKU changes, check uniqueness
  if (input.sku && input.sku.toUpperCase() !== product.sku) {
    const existingSku = await Product.findOne({ sku: input.sku.toUpperCase(), _id: { $ne: id } });
    if (existingSku) {
      throw ApiError.conflict('A product with this SKU already exists');
    }
  }

  // If category changes, validate new category
  if (input.category && input.category !== oldCategoryId) {
    const categoryExists = await Category.findById(input.category);
    if (!categoryExists) {
      throw ApiError.badRequest('Category not found');
    }
  }

  // Validate compare price
  const finalPrice = input.price ?? product.price;
  const finalCompare = input.compareAtPrice !== undefined ? input.compareAtPrice : product.compareAtPrice;
  if (finalCompare && finalCompare <= finalPrice) {
    throw ApiError.badRequest('Compare-at price must be higher than the selling price');
  }

  Object.assign(product, input);
  await product.save();

  // Sync product counts for old and new categories
  const newCategoryId = product.category.toString();
  await categoryService.syncProductCount(oldCategoryId);
  if (newCategoryId !== oldCategoryId) {
    await categoryService.syncProductCount(newCategoryId);
  }

  return product.populate('category', 'name slug');
};

// ─── Delete Product (Admin) ───

export const remove = async (id: string): Promise<void> => {
  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const categoryId = product.category.toString();
  await product.deleteOne();

  // Sync category product count
  await categoryService.syncProductCount(categoryId);
};

// ─── Admin: List All Products (including inactive) ───

export const adminGetAll = async (query: ProductQuery): Promise<PaginatedProducts> => {
  const { page, limit, search, category, sort } = query;
  const { skip } = getPagination(page, limit);

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }
  }

  const sortOption = SORT_MAP[sort] || SORT_MAP.newest;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    products: products as unknown as IProduct[],
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
};

// ─── Stock Validation ───

export const validateStock = async (
  items: Array<{ productId: string; quantity: number }>
): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      errors.push(`Product ${item.productId} not found`);
      continue;
    }
    if (!product.isActive) {
      errors.push(`"${product.name}" is no longer available`);
      continue;
    }
    if (product.stock < item.quantity) {
      errors.push(
        `"${product.name}" only has ${product.stock} in stock (requested ${item.quantity})`
      );
    }
  }

  return { valid: errors.length === 0, errors };
};
