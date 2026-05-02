import { Category, ICategory } from '../models/Category';
import { Product } from '../models/Product';
import { ApiError } from '../utils/api-error';
import { slugify } from '../utils/helpers';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validators';

// ─── List Categories ───

export const getAll = async (options: { activeOnly?: boolean } = {}): Promise<ICategory[]> => {
  const filter: Record<string, unknown> = {};
  if (options.activeOnly) {
    filter.isActive = true;
  }

  return Category.find(filter).sort({ displayOrder: 1, name: 1 });
};

// ─── Get Single Category ───

export const getBySlug = async (slug: string): Promise<ICategory> => {
  const category = await Category.findOne({ slug });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  return category;
};

export const getById = async (id: string): Promise<ICategory> => {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  return category;
};

// ─── Create Category (Admin) ───

export const create = async (input: CreateCategoryInput): Promise<ICategory> => {
  const slug = slugify(input.name);

  // Check for duplicate name or slug
  const existing = await Category.findOne({
    $or: [{ slug }, { name: { $regex: `^${input.name}$`, $options: 'i' } }],
  });
  if (existing) {
    throw ApiError.conflict('A category with this name already exists');
  }

  return Category.create({ ...input, slug });
};

// ─── Update Category (Admin) ───

export const update = async (id: string, input: UpdateCategoryInput): Promise<ICategory> => {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  // If name changes, regenerate slug and check for duplicates
  if (input.name && input.name !== category.name) {
    const slug = slugify(input.name);
    const existing = await Category.findOne({
      _id: { $ne: id },
      $or: [{ slug }, { name: { $regex: `^${input.name}$`, $options: 'i' } }],
    });
    if (existing) {
      throw ApiError.conflict('A category with this name already exists');
    }
    category.slug = slug;
  }

  Object.assign(category, input);
  await category.save();
  return category;
};

// ─── Delete Category (Admin) ───

export const remove = async (id: string): Promise<void> => {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  // Prevent deleting categories that still have products
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete category with ${productCount} product(s). Reassign or remove them first.`
    );
  }

  await category.deleteOne();
};

// ─── Sync Product Count ───

export const syncProductCount = async (categoryId: string): Promise<void> => {
  const count = await Product.countDocuments({ category: categoryId, isActive: true });
  await Category.findByIdAndUpdate(categoryId, { productCount: count });
};
