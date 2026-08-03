import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ChevronLeft,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Logo } from '../common/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  ];

  const sidebarContent = (
    <div className={cn(
      'flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="font-bold text-xl text-slate-900">Nexus</span>
          </div>
        )}
        {isCollapsed && <Logo size="sm" />}

        {/* Collapse toggle - desktop only */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn(
            'w-5 h-5 text-slate-500 transition-transform duration-200',
            isCollapsed && 'rotate-180'
          )} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-slate-50',
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 flex-shrink-0',
                isActive ? 'text-indigo-600' : 'text-slate-500'
              )} />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        {!isCollapsed && (
          <p className="text-xs text-slate-400 text-center">
            Nexus Admin v1.0.0
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {sidebarContent}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>
    </>
  );
}
