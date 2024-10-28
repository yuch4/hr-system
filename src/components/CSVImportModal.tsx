import React, { useState, useRef } from 'react';
import { X, Upload, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { validateCSVData } from '../utils/csvImport';
import { createEmployee } from '../lib/database';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const getErrorMessage = (error: unknown, employeeName: string): string => {
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      // メールアドレスの重複エラー
      if (errorMsg.includes('duplicate key') || errorMsg.includes('unique constraint')) {
        return `${employeeName}のメールアドレスは既に登録されています`;
      }
      
      // メールアドレスの形式エラー
      if (errorMsg.includes('invalid email') || errorMsg.includes('email format')) {
        return `${employeeName}のメールアドレスの形式が正しくありません`;
      }
      
      // 必須フィールドのエラー
      if (errorMsg.includes('required')) {
        const field = errorMsg.includes('email') ? 'メールアドレス' :
                     errorMsg.includes('name') ? '氏名' :
                     errorMsg.includes('company') ? '会社名' :
                     errorMsg.includes('department') ? '部署' :
                     errorMsg.includes('position') ? '役職' : '必須項目';
        return `${employeeName}の${field}が入力されていません`;
      }
      
      // データ長制限エラー
      if (errorMsg.includes('too long')) {
        const field = errorMsg.includes('email') ? 'メールアドレス' :
                     errorMsg.includes('name') ? '氏名' :
                     errorMsg.includes('company') ? '会社名' :
                     errorMsg.includes('department') ? '部署' :
                     errorMsg.includes('position') ? '役職' : 'データ';
        return `${employeeName}の${field}が長すぎます`;
      }
      
      // その他のデータベースエラー
      if (errorMsg.includes('database') || errorMsg.includes('db error')) {
        return `${employeeName}の登録中にデータベースエラーが発生しました`;
      }
    }
    
    return `${employeeName}の登録に失敗しました: システムエラーが発生しました`;
  };

  const downloadTemplate = () => {
    const template = '会社名,氏名,メールアドレス,部署,役職\n株式会社サンプル,山田太郎,yamada@example.com,営業部,部長';
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '従業員登録テンプレート.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);
    setSuccessCount(0);

    try {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(['ファイルサイズは5MB以下にしてください']);
        return;
      }

      const result = await validateCSVData(file);
      
      if (!result.valid) {
        setErrors(result.errors);
        return;
      }

      // Import valid records
      let imported = 0;
      const importErrors: string[] = [];
      const duplicateEmails = new Set<string>();

      for (const record of result.data) {
        try {
          if (duplicateEmails.has(record.email)) {
            importErrors.push(`${record.name}のメールアドレスがCSVファイル内で重複しています`);
            continue;
          }
          duplicateEmails.add(record.email);

          await createEmployee(record);
          imported++;
        } catch (error) {
          const errorMessage = getErrorMessage(error, record.name);
          importErrors.push(errorMessage);
        }
      }

      setSuccessCount(imported);
      if (importErrors.length > 0) {
        setErrors(importErrors);
      }
      if (imported > 0) {
        onSuccess();
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Parse error')) {
          setErrors(['CSVファイルの形式が不正です。UTF-8エンコーディングで保存されているか確認してください']);
        } else if (error.message.includes('encoding')) {
          setErrors(['ファイルの文字コードが不正です。UTF-8で保存し直してください']);
        } else {
          setErrors([`ファイル処理エラー: ${getErrorMessage(error, '')}`]);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) {
      setErrors(['ファイルをアップロードしてください']);
      return;
    }
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrors(['CSVファイルのみアップロード可能です']);
      return;
    }
    
    await processFile(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">CSVインポート</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            CSVファイルをドラッグ＆ドロップ
          </p>
          <p className="text-gray-500 text-sm mb-4">または</p>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              disabled={isProcessing}
            >
              ファイルを選択
            </button>
            <button
              onClick={downloadTemplate}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center gap-2 inline-flex"
            >
              <Download className="h-4 w-4" />
              テンプレートをダウンロード
            </button>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">処理中...</p>
          </div>
        )}

        {successCount > 0 && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            {successCount}件の従業員情報を登録しました
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">エラーが発生しました</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">CSVファイル要件:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>エンコーディング: UTF-8</li>
            <li>ファイルサイズ: 5MB以下</li>
            <li>必須列: 会社名, 氏名, メールアドレス, 部署, 役職</li>
            <li>1行目: 列名（上記の通り正確に記載）</li>
            <li>メールアドレス: 重複不可</li>
          </ul>
        </div>
      </div>
    </div>
  );
}