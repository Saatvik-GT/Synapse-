import React from 'react';

export default function StatsCard({ title, count, icon: Icon, iconColor = 'text-blue-400' }) {
  return (
    <div className="bg-github-bg border border-github-border rounded-lg p-5 github-hover cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-github-muted text-xs font-medium mb-1 uppercase tracking-wide">
            {title}
          </h3>
          <div className="text-2xl font-bold text-white">
            {typeof count === 'number' ? count.toLocaleString() : count}
          </div>
        </div>
        {Icon && <Icon size={22} className={iconColor} />}
      </div>
    </div>
  );
}
