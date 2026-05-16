/**
 * Strict project isolation logic for the JSON-based demo store.
 * Now that seed data is cleaned up with explicit projectIds, we no longer need fuzzy text matching.
 */

type ProjectRow = { id: number; name: string; subdomain: string };

function getProject(data: Record<string, unknown>, projectId: number): ProjectRow | null {
  const projects = data.projects as ProjectRow[] | undefined;
  return projects?.find((p) => p.id === projectId) ?? null;
}

/** Filter a list of items to only those belonging to the specified project. */
export function filterListForProject<T extends Record<string, unknown>>(
  _collection: string,
  items: T[],
  projectId: number,
  _data: Record<string, unknown>
): T[] {
  if (items.length === 0) return items;
  
  // Every item must have a projectId for strict isolation
  return items.filter((i) => i.projectId === projectId) as T[];
}

/** Check if a single item belongs to a project/tenant (JSON fallback) */
export function canAccessItem(
  _collection: string,
  item: Record<string, unknown>,
  projectId: number,
  _data: Record<string, unknown>
): boolean {
  return item.projectId === projectId;
}

/** Scopes the entire bootstrap object for a project. */
export function scopeBootstrap(data: Record<string, unknown>, projectId: number | null) {
  if (projectId === null) return data;

  const scoped: Record<string, unknown> = { ...data };

  // Iterate through all arrays in the data and filter by projectId
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      // Collections where elements should have a projectId
      if (key === "users" || key === "projects") {
        // Special case: Filter projects/users directly by ID or project link
        if (key === "projects") {
          scoped[key] = value.filter((p: any) => p.id === projectId);
        } else {
          scoped[key] = value.filter((u: any) => u.projectId === projectId || u.role === "superadmin");
        }
      } else {
        // Standard collection filtering
        scoped[key] = value.filter((i: any) => i.projectId === projectId);
      }
    }
  }

  return scoped;
}

export type OwnerRow = {
  id: string;
  project_id?: number | null;
  unit_id?: string | null;
};

export function ownerBelongsToProject(
  owner: OwnerRow,
  projectId: number | null | undefined
): boolean {
  if (!projectId) return true;
  return Number(owner.project_id) === projectId;
}

export function filterOwnersForProject(
  owners: OwnerRow[],
  projectId: number | null | undefined
): OwnerRow[] {
  if (!projectId) return owners;
  return owners.filter((o) => ownerBelongsToProject(o, projectId));
}
