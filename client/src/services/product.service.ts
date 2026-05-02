import { api } from '@/lib/api';
import type { ApiResponse, PaginationMeta, Product, Category } from '@/types';

// ─── Query Params ───

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: string;
  inStock?: string;
}

interface ProductListResponse {
  data: Product[];
  pagination: PaginationMeta;
}

// ─── Products ───

export const productService = {
  async getAll(params: ProductQueryParams = {}): Promise<ProductListResponse> {
    const { data } = await api.get<ApiResponse<Product[]> & { pagination: PaginationMeta }>(
      '/products',
      { params }
    );
    return { data: data.data!, pagination: data.pagination! };
  },

  async getFeatured(limit = 8): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>('/products/featured', {
      params: { limit },
    });
    return data.data!;
  },

  async getBySlug(slug: string): Promise<Product> {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${slug}`);
    return data.data!;
  },
};

// ─── Categories ───

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<ApiResponse<Category[]>>('/categories');
    return data.data!;
  },

  async getBySlug(slug: string): Promise<Category> {
    const { data } = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
    return data.data!;
  },
};
