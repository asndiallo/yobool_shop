import { EntityId } from '@/types';

/**
 * JSON:API helper utilities for working with included relationships
 */

export interface JsonApiResource {
  readonly id: string;
  readonly type: string;
  readonly attributes?: unknown;
  readonly relationships?: unknown;
}

/**
 * Extract included resources by type from JSON:API response
 */
export function extractIncludedByType<T extends JsonApiResource>(
  included: unknown[] | undefined,
  type: string
): T[] {
  if (!included) return [];

  return included.filter(
    (item): item is T =>
      typeof item === 'object' &&
      item !== null &&
      'type' in item &&
      item.type === type
  );
}

/**
 * Find a specific included resource by type and id
 */
export function findIncluded<T extends JsonApiResource>(
  included: unknown[] | undefined,
  type: string,
  id: EntityId
): T | undefined {
  if (!included) return undefined;

  return included.find(
    (item): item is T =>
      typeof item === 'object' &&
      item !== null &&
      'type' in item &&
      item.type === type &&
      'id' in item &&
      item.id === id
  );
}

/**
 * Extract all included resources of a given type from relationship data
 */
export function extractRelationshipData<T extends JsonApiResource>(
  included: unknown[] | undefined,
  relationshipData:
    | { readonly id: EntityId; readonly type: string }[]
    | undefined,
  type: string
): T[] {
  if (!included || !relationshipData) return [];

  const ids = relationshipData.filter((r) => r.type === type).map((r) => r.id);

  return ids
    .map((id) => findIncluded<T>(included, type, id))
    .filter((item): item is T => item !== undefined);
}
