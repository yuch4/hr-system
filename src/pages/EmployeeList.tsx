import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Download, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Employee } from '../types/employee';
import { getEmployees } from '../lib/database';
import { downloadCSV } from '../utils/csvExport';
import { CSVImportModal } from '../components/CSVImportModal';

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setError(null);
      const data = await getEmployees();
      setEmployees(data || []);
    } catch (error) {
      console.error('従業員データの取得エラー:', error);
      setError('従業員データの取得に失敗しました。後でもう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchTermLower) ||
      employee.email.toLowerCase().includes(searchTermLower) ||
      employee.department.toLowerCase().includes(searchTermLower) ||
      employee.company_name.toLowerCase().includes(searchTermLower) ||
      employee.position.toLowerCase().includes(searchTermLower)
    );
  });

  const handleExportCSV = () => {
    const filename = `従業員一覧_${new Date().toLocaleDateString('ja-JP')}.csv`;
    downloadCSV(filteredEmployees, filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchEmployees}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  const totalCount = employees.length;
  const filteredCount = filteredEmployees.length;
  const showingFilteredCount = searchTerm && filteredCount !== totalCount;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">従業員一覧</h1>
          <p className="mt-1 text-sm text-gray-600">
            {showingFilteredCount ? (
              <>全{totalCount}件中 {filteredCount}件表示</>
            ) : (
              <>全{totalCount}件</>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            disabled={filteredEmployees.length === 0}
          >
            <Download className="h-5 w-5" />
            CSVエクスポート
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            CSVインポート
          </button>
          <Link
            to="/register-employee"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            従業員を追加
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="従業員を検索..."
          className="pl-10 pr-4 py-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                氏名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メールアドレス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                会社名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                部署
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                役職
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? '検索条件に一致する従業員が見つかりません。' : '従業員が登録されていません。'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.company_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.position}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchEmployees();
          setIsImportModalOpen(false);
        }}
      />
    </div>
  );
}