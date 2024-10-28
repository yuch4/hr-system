import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import type { Employee } from '../types/employee';
import { createEmployee, checkEmailExists } from '../lib/database';

type EmployeeFormData = Omit<Employee, 'id' | 'created_at'>;

export function EmployeeRegistration() {
  const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm<EmployeeFormData>();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = async (email: string) => {
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        return 'このメールアドレスは既に登録されています';
      }
      return true;
    } catch (error) {
      console.error('メールアドレス検証エラー:', error);
      return 'メールアドレスの検証中にエラーが発生しました';
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      clearErrors();
      
      // Final email check before submission
      const emailValidation = await validateEmail(data.email);
      if (emailValidation !== true) {
        setError('email', { type: 'manual', message: emailValidation });
        return;
      }

      await createEmployee(data);
      navigate('/employees');
    } catch (error) {
      console.error('従業員登録エラー:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : '従業員の登録に失敗しました。もう一度お試しください。';
      
      if (errorMessage.includes('メールアドレス')) {
        setError('email', { type: 'manual', message: errorMessage });
      } else {
        setSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規従業員登録</h1>
      
      {submitError && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">会社名</label>
          <input
            {...register('company_name', { 
              required: '会社名は必須です',
              maxLength: { value: 100, message: '会社名は100文字以内で入力してください' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.company_name && (
            <span className="text-red-500 text-sm mt-1 block">{errors.company_name.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">氏名</label>
          <input
            {...register('name', { 
              required: '氏名は必須です',
              maxLength: { value: 50, message: '氏名は50文字以内で入力してください' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && (
            <span className="text-red-500 text-sm mt-1 block">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
          <input
            type="email"
            {...register('email', { 
              required: 'メールアドレスは必須です',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '有効なメールアドレスを入力してください'
              },
              validate: validateEmail
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.email && (
            <span className="text-red-500 text-sm mt-1 block">{errors.email.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">部署</label>
          <input
            {...register('department', { 
              required: '部署は必須です',
              maxLength: { value: 50, message: '部署は50文字以内で入力してください' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.department && (
            <span className="text-red-500 text-sm mt-1 block">{errors.department.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">役職</label>
          <input
            {...register('position', { 
              required: '役職は必須です',
              maxLength: { value: 50, message: '役職は50文字以内で入力してください' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.position && (
            <span className="text-red-500 text-sm mt-1 block">{errors.position.message}</span>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            `}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                登録中...
              </>
            ) : (
              '従業員を登録'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}