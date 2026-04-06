import React from 'react';
import { Building2, MapPin, Link2, Users, UserCheck } from 'lucide-react';

export default function UserProfile({ user }) {
  const defaultUser = {
    login: 'username',
    avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    followers: 1234,
    following: 567,
    bio: 'Full-stack developer | Open source enthusiast',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    blog: 'https://example.com',
  };

  const profileData = user || defaultUser;

  return (
    <div className="bg-github-bg border border-github-border rounded-lg p-6 mb-6">
      <div className="flex gap-6 items-start">
        {/* Avatar */}
        <img
          src={profileData.avatar_url}
          alt={profileData.login}
          className="w-20 h-20 rounded-full border-2 border-github-border flex-shrink-0"
        />

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white mb-1">{profileData.login}</h1>
          {profileData.bio && (
            <p className="text-github-muted text-sm mb-4">{profileData.bio}</p>
          )}

          <div className="flex gap-6 mb-3">
            <div className="flex items-center gap-1.5 text-github-text text-sm">
              <Users size={14} className="text-github-muted" />
              <span className="font-semibold text-white">{(profileData.followers || 0).toLocaleString()}</span>
              <span className="text-github-muted">followers</span>
            </div>
            <div className="flex items-center gap-1.5 text-github-text text-sm">
              <UserCheck size={14} className="text-github-muted" />
              <span className="font-semibold text-white">{(profileData.following || 0).toLocaleString()}</span>
              <span className="text-github-muted">following</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-github-muted text-xs">
            {profileData.company && (
              <div className="flex items-center gap-1.5">
                <Building2 size={12} />
                <span>{profileData.company}</span>
              </div>
            )}
            {profileData.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={12} />
                <span>{profileData.location}</span>
              </div>
            )}
            {profileData.blog && (
              <div className="flex items-center gap-1.5">
                <Link2 size={12} />
                <a
                  href={profileData.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline truncate max-w-xs"
                >
                  {profileData.blog}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
