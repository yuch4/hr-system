import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Register() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { signUp } = useAuthStore();

  const onSubmit = async (data: any) => {
    try {
      await signUp(data.email, data.password);
      navigate('/employees');
    } catch (error) {
      console.error('登録エラー:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex items-center justify-center mb-8">
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold ml-2">アカウント作成</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パスワード</label>
            <input
              {...register('password')}
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            登録
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            こちらからログイン
          </Link>
        </p>
      </div>
    </div>
  );
}