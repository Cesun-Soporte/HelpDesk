import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, List, Settings, Users } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer flex items-center gap-2"
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Help Desk</h1>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button
              onClick={() => navigate('/tickets')}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
            >
              <List className="w-5 h-5" />
              Tickets
            </button>

            {user && user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 font-medium transition"
              >
                <Settings className="w-5 h-5" />
                Admin
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
