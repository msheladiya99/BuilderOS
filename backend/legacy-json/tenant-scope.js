function projectKeywords(project) {
  const keys = new Set();
  keys.add(project.name.toLowerCase());
  keys.add(project.subdomain.toLowerCase().replace(/-/g, " "));
  for (const part of project.subdomain.split("-")) {
    if (part.length >= 4) keys.add(part);
  }
  const firstWord = project.name.split(/\s+/)[0]?.toLowerCase();
  if (firstWord && firstWord.length >= 4) keys.add(firstWord);
  return [...keys];
}

function matchesProjectText(text, project) {
  const t = String(text || "").toLowerCase();
  if (!t) return false;
  return projectKeywords(project).some((k) => t.includes(k));
}

function getProject(data, projectId) {
  return (data.projects || []).find((p) => p.id === projectId) || null;
}

function filterByProjectId(items, projectId) {
  return items.filter((i) => i.projectId === projectId);
}

function filterByProjectText(items, project, fields) {
  return items.filter((item) =>
    fields.some((f) => matchesProjectText(String(item[f] ?? ""), project))
  );
}

function filterErpUsersForProject(users, projectId) {
  return users.filter((u) => {
    const email = String(u.email || "").toLowerCase();
    if (projectId === 2) return email.includes("greenvalley");
    if (projectId === 1) return email.includes("builderos") && !email.includes("greenvalley");
    return true;
  });
}

export function inferOwnerProjectId(owner, units) {
  if (owner.project_id != null) return Number(owner.project_id);
  if (!owner.unit_id || !units) return null;
  const unit = units.find((u) => String(u.id) === String(owner.unit_id));
  return unit?.projectId ?? null;
}

export function ownerBelongsToProject(owner, projectId, units) {
  if (!projectId) return true;
  return inferOwnerProjectId(owner, units) === projectId;
}

export function filterOwnersForProject(owners, projectId, units) {
  if (!projectId) return owners;
  return owners.filter((o) => ownerBelongsToProject(o, projectId, units));
}

export function backfillOwnerProjectIds(owners, units) {
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

export function scopeBootstrap(data, projectId) {
  if (!projectId) return data;
  const project = getProject(data, projectId);
  const scoped = { ...data };

  scoped.projects = (data.projects || []).filter((p) => p.id === projectId);
  scoped.units = filterByProjectId(data.units || [], projectId);

  if (data.constructionStages) {
    scoped.constructionStages = filterByProjectId(data.constructionStages, projectId);
  }
  if (data.constructionLogs) {
    scoped.constructionLogs = filterByProjectId(data.constructionLogs, projectId);
  }
  if (data.constructionPhotos) {
    scoped.constructionPhotos = filterByProjectId(data.constructionPhotos, projectId);
  }

  if (project) {
    if (data.customers) scoped.customers = filterByProjectText(data.customers, project, ["unit", "name"]);
    if (data.leads) scoped.leads = filterByProjectText(data.leads, project, ["interest"]);
    if (data.payments) scoped.payments = filterByProjectText(data.payments, project, ["unit", "customer"]);
    if (data.pendingDues) {
      scoped.pendingDues = filterByProjectText(data.pendingDues, project, ["unit", "customer"]);
    }
    if (data.tickets) scoped.tickets = filterByProjectText(data.tickets, project, ["unit"]);
    if (data.maintenanceBills) {
      scoped.maintenanceBills = filterByProjectText(data.maintenanceBills, project, ["unit"]);
    }
    if (data.vouchers) scoped.vouchers = filterByProjectText(data.vouchers, project, ["desc", "party"]);
    if (data.documentFiles) {
      scoped.documentFiles = filterByProjectText(data.documentFiles, project, ["name"]);
    }
    if (data.notifications) {
      scoped.notifications = filterByProjectText(data.notifications, project, ["message", "title"]);
    }
  }

  if (data.erpUsers) scoped.erpUsers = filterErpUsersForProject(data.erpUsers, projectId);
  if (data.owners) scoped.owners = filterOwnersForProject(data.owners, projectId, data.units);

  return scoped;
}

export function scopeDashboard(db, projectId) {
  const scoped = scopeBootstrap(db, projectId);
  const units = scoped.units || [];
  const leads = scoped.leads || [];
  const payments = scoped.payments || [];
  const projects = scoped.projects || [];
  return { units, leads, payments, projects, pendingDues: scoped.pendingDues || [] };
}
