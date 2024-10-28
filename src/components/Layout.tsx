import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Users, UserPlus, LogOut, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Layout() {
  const { signOut, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) return <Outlet />;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            人事システム
          </h1>
        </div>
        <nav className="mt-8">
          <Link
            to="/employees"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <Users className="h-5 w-5 mr-2" />
            従業員一覧
          </Link>
          <Link
            to="/register-employee"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            従業員登録
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 mr-2" />
            ログアウト
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}