'use client';

import { useCallback } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

export interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  categories: Category[];
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
}

export const EMPTY_FILTERS: FilterState = {
  category: '',
  minPrice: '',
  maxPrice: '',
  inStock: false,
};

export function ProductFilters({
  filters,
  categories,
  onFilterChange,
  onReset,
  className,
}: ProductFiltersProps) {
  const update = useCallback(
    (partial: Partial<FilterState>) => {
      onFilterChange({ ...filters, ...partial });
    },
    [filters, onFilterChange]
  );

  const activeCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
  ].filter(Boolean).length;

  return (
    <aside className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Filters</h3>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => update({ category: '' })}
            className={cn(
              'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
              !filters.category
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => update({ category: cat.slug })}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                filters.category === cat.slug
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{cat.name}</span>
              <span className="text-xs text-muted-foreground">{cat.productCount}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Price Range</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update({ minPrice: e.target.value })}
            className="h-9 text-sm"
            min={0}
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
            className="h-9 text-sm"
            min={0}
          />
        </div>
      </div>

      <Separator />

      {/* In Stock */}
      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => update({ inStock: e.target.checked })}
            className="size-4 rounded border-border text-primary accent-primary"
          />
          <span className="text-sm text-foreground">In stock only</span>
        </label>
      </div>

      {/* Active filter tags */}
      {activeCount > 0 && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Badge variant="outline" className="gap-1 pr-1">
                {categories.find((c) => c.slug === filters.category)?.name || filters.category}
                <button onClick={() => update({ category: '' })}>
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <Badge variant="outline" className="gap-1 pr-1">
                Rs. {filters.minPrice || '0'} – {filters.maxPrice || '∞'}
                <button onClick={() => update({ minPrice: '', maxPrice: '' })}>
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {filters.inStock && (
              <Badge variant="outline" className="gap-1 pr-1">
                In stock
                <button onClick={() => update({ inStock: false })}>
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

// ─── Mobile Filter Drawer Trigger ───

export function MobileFilterButton({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="lg:hidden">
      <SlidersHorizontal className="size-4" />
      Filters
      {activeCount > 0 && (
        <Badge className="ml-1 h-4 w-4 justify-center p-0 text-[10px]">
          {activeCount}
        </Badge>
      )}
    </Button>
  );
}
