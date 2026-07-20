import { guideLimitFor, exceedsGuideLimit } from '@/app/config/business';
import type { CatalogOption } from '../types/catalog.types';

export interface GuideDraft {
  guide_number: number;
  heads: number;
}

export function parseHeads(value: string): number {
  return Math.max(0, Number.parseInt(value, 10) || 0);
}

export function guideDraftsFor(cattleType: string, heads: number, guide1: string, guide2: string): GuideDraft[] {
  if (!exceedsGuideLimit(cattleType, heads)) {
    return [{ guide_number: 1, heads }];
  }

  return [
    { guide_number: 1, heads: parseHeads(guide1) },
    { guide_number: 2, heads: parseHeads(guide2) },
  ];
}

export function guidesAreValid(cattleType: string, heads: number, guides: GuideDraft[]): boolean {
  const limit = guideLimitFor(cattleType);
  return guides.length > 0
    && guides.every((guide) => guide.heads > 0 && guide.heads <= limit)
    && guides.reduce((total, guide) => total + guide.heads, 0) === heads;
}

export function catalogLabel(options: CatalogOption[] | undefined, value: string, fallback = '—'): string {
  return options?.find((option) => option.value === value)?.label || fallback;
}
