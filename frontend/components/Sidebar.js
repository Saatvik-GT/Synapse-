import React from 'react';
import { BookMarked, Star, Users, Bell, Settings, TrendingUp, GraduationCap, Pin } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
  { icon: BookMarked, id: 'dashboard', label: 'Dashboard' },
  { icon: Star, id: 'issues', label: 'Issues' },
  { icon: Users, id: 'priority', label: 'Priority' },
  { icon: Bell, id: 'insights', label: 'Insights' },
  { icon: Settings, id: 'settings', label: 'Settings' },
];

  const quickFilters = [
    { icon: TrendingUp, label: 'Trending' },
    { icon: GraduationCap, label: 'Learning' },
    { icon: Pin, label: 'Pinned' },
  ];

  return (

    <aside className="hidden lg:block fixed left-6 top-24 w-64 z-10">
      <div className="bg-github-bg border border-github-border rounded-lg p-6 sticky top-20">
        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
  key={index}
  onClick={() => setActiveTab(item.id)}
  className="flex items-center gap-3 px-4 py-3 rounded-lg text-github-text hover:bg-github-border hover:text-white transition w-full text-left"
>
  <Icon size={15} className="flex-shrink-0" />
  <span className="font-medium text-sm">{item.label}</span>
</button>
            );
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-github-border">
          <p className="text-xs text-github-muted mb-3 uppercase tracking-wide">Quick Filters</p>
          <div className="space-y-1">
            {quickFilters.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 text-left px-4 py-2 text-sm text-github-text hover:bg-github-border rounded transition"
                >
                  <Icon size={14} className="flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
