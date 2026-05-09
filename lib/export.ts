/**
 * Data Export Utilities — CSV/JSON export for admin
 */

export function toCSV(data: any[], columns?: string[]): string {
  if (!data.length) return '';
  const keys = columns || Object.keys(data[0]).filter(k => k !== '__v');
  const header = keys.join(',');
  const rows = data.map(item =>
    keys.map(k => {
      const val = item[k];
      if (val == null) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Escape CSV
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

export function downloadCSV(data: any[], filename: string, columns?: string[]) {
  const csv = toCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: any[], filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
