export function downloadCSV(data: any[], filename: string) {
  // Define headers in Japanese
  const headers = {
    name: '氏名',
    email: 'メールアドレス',
    company_name: '会社名',
    department: '部署',
    position: '役職'
  };

  // Convert data to CSV format
  const csvContent = [
    // Headers row
    Object.values(headers).join(','),
    // Data rows
    ...data.map(row => [
      `"${row.name}"`,
      `"${row.email}"`,
      `"${row.company_name}"`,
      `"${row.department}"`,
      `"${row.position}"`,
    ].join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}