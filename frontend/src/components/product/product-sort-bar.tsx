'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name_asc', label: 'Name: A–Z' },
  { value: 'name_desc', label: 'Name: Z–A' },
];

interface ProductSortBarProps {
  sort: string;
  onSortChange: (sort: string) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  totalResults: number;
  className?: string;
}

export function ProductSortBar({
  sort,
  onSortChange,
  view,
  onViewChange,
  totalResults,
  className,
}: ProductSortBarProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span>{' '}
        product{totalResults !== 1 ? 's' : ''} found
      </p>

      <div className="flex items-center gap-2">
        {/* Sort */}
        <Select value={sort} onValueChange={(v) => v && onSortChange(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="hidden items-center rounded-lg border border-border p-0.5 sm:flex">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => onViewChange('grid')}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => onViewChange('list')}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
