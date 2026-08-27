import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/events',    label: 'Events',    icon: '📅' },
  { to: '/admin/users',     label: 'Users',     icon: '👥' },
];

export default function AdminSidebar() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/admin'); };

  return (
    <div className="w-56 bg-gray-900 min-h-screen flex flex-col border-r border-gray-800 shrink-0">
      <div className="px-5 py-5 border-b border-gray-800">
        <p className="text-white font-bold text-base">Campus Connect</p>
        <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
