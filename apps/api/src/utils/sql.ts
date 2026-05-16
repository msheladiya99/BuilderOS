/** Utility to safely quote PostgreSQL identifiers (schema, table, column names) */
export function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}
