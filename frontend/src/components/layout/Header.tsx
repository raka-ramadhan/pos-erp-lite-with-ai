import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLogout } from '../../hooks';
import { setLoggingOut } from '../../api/client';
import type { RootState } from '../../store';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const logoutMutation = useLogout();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    // Close dropdown first
    setIsProfileOpen(false);

    // Set flag to prevent 401 interceptor from triggering
    setLoggingOut(true);

    // Navigate to login page
    navigate('/login', { replace: true });

    // Then clear auth state (runs in background)
    logoutMutation.mutate();
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Hamburger menu - mobile only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          {/* Page title */}
          <h1 className="text-lg lg:text-xl font-semibold text-slate-900">
            {title}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notifications */}
          <button
            className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User profile */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              {/* Avatar */}
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user ? getInitials(user.name) : 'JD'}
                </span>
              </div>

              {/* Name - hidden on mobile */}
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-900">
                  {user?.name || 'User'}
                </span>
                <span className="text-xs text-slate-500 capitalize">
                  {user?.role?.name || 'User'}
                </span>
              </div>

              <ChevronDown className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
                isProfileOpen && 'rotate-180'
              )} />
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <>
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 py-2 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
