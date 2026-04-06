import React, { useState, useEffect } from 'react';
import { BookMarked, Star, Users, Bell, Settings, GitBranch, KeyRound, Eye, EyeOff, Check, X } from 'lucide-react';

export default function Navbar({ onTokenChange }) {
  const menuItems = [
    { icon: BookMarked, label: 'Repositories' },
    { icon: Star, label: 'Starred' },
    { icon: Users, label: 'Followers' },
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'Settings' },
  ];

  const [token, setToken] = useState('');
  const [savedToken, setSavedToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('gh_token') || '';
    setSavedToken(stored);
    setToken(stored);
    if (onTokenChange) onTokenChange(stored);
  }, []);

  const handleSave = () => {
    const trimmed = token.trim();
    localStorage.setItem('gh_token', trimmed);
    setSavedToken(trimmed);
    if (onTokenChange) onTokenChange(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('gh_token');
    setToken('');
    setSavedToken('');
    if (onTokenChange) onTokenChange('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
  };

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

      {/* GitHub Token Section */}
      <div className="px-4 pb-3 border-t border-github-border pt-4">
        <div className="flex items-center gap-1.5 mb-2">
          <KeyRound size={13} className="text-github-muted" />
          <span className="text-xs text-github-muted uppercase tracking-wide">GitHub Token</span>
          {savedToken && (
            <span className="ml-auto text-xs text-green-400 flex items-center gap-0.5">
              <Check size={11} /> Active
            </span>
          )}
        </div>

        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full bg-[#161b22] border border-github-border text-white text-xs px-2.5 py-2 pr-8 rounded-md focus:outline-none focus:border-blue-500 placeholder-github-muted font-mono"
          />
          <button
            type="button"
            onClick={() => setShowToken((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-github-muted hover:text-white transition"
          >
            {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition ${
              saved
                ? 'bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
          {savedToken && (
            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-md bg-github-border hover:bg-red-800 text-github-muted hover:text-white transition"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <p className="text-github-muted text-xs mt-2 leading-relaxed">
          Needed for 5,000 req/hr.{' '}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Generate token
          </a>
        </p>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-github-border">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition font-medium text-sm">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
