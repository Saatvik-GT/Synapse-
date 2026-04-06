import React from 'react';
import { BookMarked, Star, Users, Bell, Settings, GitBranch } from 'lucide-react';

export default function Navbar() {
  const menuItems = [
    { icon: BookMarked, label: 'Repositories' },
    { icon: Star, label: 'Starred' },
    { icon: Users, label: 'Followers' },
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-github-bg border-r border-github-border flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-github-border flex items-center gap-2">
        <GitBranch size={20} className="text-blue-400" />
        <h1 className="text-xl font-bold text-white">Synapse</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-github-text hover:bg-github-border hover:text-white transition"
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-github-border">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition font-medium text-sm">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
