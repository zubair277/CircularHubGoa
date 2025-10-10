import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Camera, LogOut, Settings } from 'lucide-react';

interface ProfileAvatarProps {
  user?: {
    id: string;
    businessName?: string;
    email?: string;
    avatar?: string;
  };
  onViewProfile?: () => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProfileAvatar({
  user,
  onViewProfile,
  onEditProfile,
  onLogout,
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      avatar: 'h-12 w-12', // 48px
      text: 'text-sm',
      icon: 'h-4 w-4',
    },
    md: {
      avatar: 'h-16 w-16 md:h-20 md:w-20', // 64px mobile, 80px desktop
      text: 'text-base',
      icon: 'h-5 w-5',
    },
    lg: {
      avatar: 'h-24 w-24', // 96px
      text: 'text-lg',
      icon: 'h-6 w-6',
    },
  };

  const currentSize = sizeConfig[size];

  // Get user initials for fallback
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Default Hulk avatar
  const defaultAvatar = '/hulk-avatar.svg';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${className}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Avatar className={`${currentSize.avatar} ring-2 ring-transparent transition-all duration-300 ${
            isHovered ? 'ring-green-400 shadow-lg shadow-green-400/50' : 'ring-gray-200'
          }`}>
            <AvatarImage
              src={user?.avatar || defaultAvatar}
              alt={user?.businessName || 'User Avatar'}
              className="object-cover"
            />
            <AvatarFallback className="bg-green-100 text-green-800 font-semibold">
              {getInitials(user?.businessName, user?.email)}
            </AvatarFallback>
          </Avatar>
          
          {/* Hover glow effect */}
          {isHovered && (
            <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse" />
          )}
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-2 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl"
      >
        {/* User info header */}
        <div className="px-3 py-2 border-b border-gray-100">
          <p className={`font-semibold text-gray-900 ${currentSize.text}`}>
            {user?.businessName || 'User'}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {user?.email || 'user@example.com'}
          </p>
        </div>

        {/* Menu items */}
        <DropdownMenuItem
          onClick={onViewProfile}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors"
        >
          <User className={`${currentSize.icon} text-gray-600`} />
          <span className="text-gray-700">View Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onEditProfile}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors"
        >
          <Camera className={`${currentSize.icon} text-gray-600`} />
          <span className="text-gray-700">Edit Profile Picture</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onEditProfile}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors"
        >
          <Settings className={`${currentSize.icon} text-gray-600`} />
          <span className="text-gray-700">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-red-50 transition-colors text-red-600"
        >
          <LogOut className={`${currentSize.icon} text-red-500`} />
          <span className="text-red-600">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
