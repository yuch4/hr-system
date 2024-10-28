import Papa from 'papaparse';

interface CSVRow {
  [key: string]: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: any;
}

const REQUIRED_HEADERS = {
  '会社名': 'company_name',
  '氏名': 'name',
  'メールアドレス': 'email',
  '部署': 'department',
  '役職': 'position'
};

export function validateCSVData(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      encoding: 'UTF-8',
      complete: (results) => {
        const errors: string[] = [];
        const headers = results.meta.fields || [];
        
        // Validate headers
        const missingHeaders = Object.keys(REQUIRED_HEADERS).filter(
          header => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          errors.push(`必須列が不足しています: ${missingHeaders.join(', ')}`);
        }

        // Validate data
        const validData = results.data
          .filter((row: CSVRow) => {
            const rowErrors: string[] = [];
            const rowNum = results.data.indexOf(row) + 2; // +2 for header row and 0-based index

            // Check required fields
            Object.entries(REQUIRED_HEADERS).forEach(([header, field]) => {
              if (!row[header]?.trim()) {
                rowErrors.push(`${rowNum}行目: ${header}は必須です`);
              }
            });

            // Validate email format
            const email = row['メールアドレス'];
            if (email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
              rowErrors.push(`${rowNum}行目: メールアドレスの形式が不正です`);
            }

            if (rowErrors.length > 0) {
              errors.push(...rowErrors);
              return false;
            }
            return true;
          })
          .map((row: CSVRow) => ({
            company_name: row['会社名'],
            name: row['氏名'],
            email: row['メールアドレス'],
            department: row['部署'],
            position: row['役職']
          }));

        resolve({
          valid: errors.length === 0 && validData.length > 0,
          errors,
          data: validData
        });
      },
      error: (error) => {
        resolve({
          valid: false,
          errors: [`CSVファイルの解析に失敗しました: ${error.message}`]
        });
      }
    });
  });
}