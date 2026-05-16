type ProjectRow = { id: number; name: string; subdomain: string };

function projectKeywords(project: ProjectRow): string[] {
  const keys = new Set<string>();
  keys.add(project.name.toLowerCase());
  keys.add(project.subdomain.toLowerCase().replace(/-/g, " "));
  for (const part of project.subdomain.split("-")) {
    if (part.length >= 4) keys.add(part);
  }
  const firstWord = project.name.split(/\s+/)[0]?.toLowerCase();
  if (firstWord && firstWord.length >= 4) keys.add(firstWord);
  return [...keys];
}

export function matchesProjectText(text: string, project: ProjectRow): boolean {
  const t = text.toLowerCase();
  if (!t) return false;
  return projectKeywords(project).some((k) => t.includes(k));
}

function getProject(data: Record<string, unknown>, projectId: number): ProjectRow | null {
  const projects = data.projects as ProjectRow[] | undefined;
  return projects?.find((p) => p.id === projectId) ?? null;
}

function filterByProjectId<T extends { projectId?: number }>(items: T[], projectId: number): T[] {
  return items.filter((i) => i.projectId === projectId);
}

function filterByProjectText<T extends Record<string, unknown>>(
  items: T[],
  project: ProjectRow,
  fields: (keyof T)[]
): T[] {
  return items.filter((item) =>
    fields.some((f) => matchesProjectText(String(item[f] ?? ""), project))
  );
}

function filterErpUsersForProject(
  users: { email?: string }[],
  projectId: number
): typeof users {
  return users.filter((u) => {
    const email = String(u.email || "").toLowerCase();
    if (projectId === 2) return email.includes("greenvalley");
    if (projectId === 1) return email.includes("builderos") && !email.includes("greenvalley");
    return true;
  });
}

export function scopeBootstrap(data: Record<string, unknown>, projectId: number | null) {
  if (!projectId) return data;

  const project = getProject(data, projectId);
  const scoped: Record<string, unknown> = { ...data };

  if (Array.isArray(data.projects)) {
    scoped.projects = (data.projects as ProjectRow[]).filter((p) => p.id === projectId);
  }
  if (Array.isArray(data.units)) {
    scoped.units = filterByProjectId(data.units as { projectId: number }[], projectId);
  }
  if (Array.isArray(data.constructionStages)) {
    scoped.constructionStages = filterByProjectId(
      data.constructionStages as { projectId: number }[],
      projectId
    );
  }
  if (Array.isArray(data.constructionLogs)) {
    scoped.constructionLogs = filterByProjectId(
      data.constructionLogs as { projectId: number }[],
      projectId
    );
  }
  if (Array.isArray(data.constructionPhotos)) {
    scoped.constructionPhotos = filterByProjectId(
      data.constructionPhotos as { projectId: number }[],
      projectId
    );
  }

  if (project) {
    if (Array.isArray(data.customers)) {
      scoped.customers = filterByProjectText(
        data.customers as Record<string, unknown>[],
        project,
        ["unit", "name"]
      );
    }
    if (Array.isArray(data.leads)) {
      scoped.leads = filterByProjectText(data.leads as Record<string, unknown>[], project, [
        "interest",
      ]);
    }
    if (Array.isArray(data.payments)) {
      scoped.payments = filterByProjectText(data.payments as Record<string, unknown>[], project, [
        "unit",
        "customer",
      ]);
    }
    if (Array.isArray(data.pendingDues)) {
      scoped.pendingDues = filterByProjectText(
        data.pendingDues as Record<string, unknown>[],
        project,
        ["unit", "customer"]
      );
    }
    if (Array.isArray(data.tickets)) {
      scoped.tickets = filterByProjectText(data.tickets as Record<string, unknown>[], project, [
        "unit",
      ]);
    }
    if (Array.isArray(data.maintenanceBills)) {
      scoped.maintenanceBills = filterByProjectText(
        data.maintenanceBills as Record<string, unknown>[],
        project,
        ["unit"]
      );
    }
    if (Array.isArray(data.vouchers)) {
      scoped.vouchers = filterByProjectText(data.vouchers as Record<string, unknown>[], project, [
        "desc",
        "party",
      ]);
    }
    if (Array.isArray(data.documentFiles)) {
      scoped.documentFiles = filterByProjectText(
        data.documentFiles as Record<string, unknown>[],
        project,
        ["name"]
      );
    }
    if (Array.isArray(data.notifications)) {
      scoped.notifications = filterByProjectText(
        data.notifications as Record<string, unknown>[],
        project,
        ["message", "title"]
      );
    }
  }

  if (Array.isArray(data.erpUsers)) {
    scoped.erpUsers = filterErpUsersForProject(data.erpUsers as { email?: string }[], projectId);
  }

  if (Array.isArray(data.owners)) {
    scoped.owners = filterOwnersForProject(
      data.owners as OwnerRow[],
      projectId,
      data.units as { id: number; projectId: number }[] | undefined
    );
  }

  return scoped;
}

export type OwnerRow = {
  id: string;
  project_id?: number | null;
  unit_id?: string | null;
};

export function inferOwnerProjectId(
  owner: OwnerRow,
  units?: { id: number; projectId: number }[]
): number | null {
  if (owner.project_id != null) return Number(owner.project_id);
  if (!owner.unit_id || !units) return null;
  const unit = units.find((u) => String(u.id) === String(owner.unit_id));
  return unit?.projectId ?? null;
}

export function ownerBelongsToProject(
  owner: OwnerRow,
  projectId: number | null | undefined,
  units?: { id: number; projectId: number }[]
): boolean {
  if (!projectId) return true;
  const pid = inferOwnerProjectId(owner, units);
  return pid === projectId;
}

export function filterOwnersForProject(
  owners: OwnerRow[],
  projectId: number | null | undefined,
  units?: { id: number; projectId: number }[]
): OwnerRow[] {
  if (!projectId) return owners;
  return owners.filter((o) => ownerBelongsToProject(o, projectId, units));
}

export function backfillOwnerProjectIds(
  owners: OwnerRow[],
  units?: { id: number; projectId: number }[]
): boolean {
  let changed = false;
  for (const o of owners) {
    if (o.project_id != null) continue;
    const inferred = inferOwnerProjectId(o, units);
    if (inferred != null) {
      o.project_id = inferred;
      changed = true;
    }
  }
  return changed;
}

const TEXT_FILTER_FIELDS: Record<string, string[]> = {
  customers: ["unit", "name"],
  leads: ["interest"],
  payments: ["unit", "customer"],
  pendingDues: ["unit", "customer"],
  tickets: ["unit"],
  maintenanceBills: ["unit"],
  vouchers: ["desc", "party"],
  documentFiles: ["name"],
};

export function filterListForProject<T extends Record<string, unknown>>(
  collection: string,
  items: T[],
  projectId: number,
  data: Record<string, unknown>
): T[] {
  if (items.length === 0) return items;
  if (items[0].projectId != null) {
    return items.filter((i) => i.projectId === projectId) as T[];
  }
  const project = getProject(data, projectId);
  const fields = TEXT_FILTER_FIELDS[collection];
  if (!project || !fields) return items;
  return filterByProjectText(items, project, fields as (keyof T)[]);
}
