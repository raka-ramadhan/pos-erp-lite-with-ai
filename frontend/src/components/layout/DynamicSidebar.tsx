import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, X, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Logo } from '../common/Logo';
import { useSidebar } from '../../hooks/useSidebar';
import type { MenuItem } from '../../types';

// Icon mapping from string to Lucide components
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  ),
  Database: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
  ),
  Key: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
  ),
  Package: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  ),
  Tags: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
  ),
  ShoppingCart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
  ),
  ShoppingBag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  ),
  BarChart3: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
  ),
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItemProps {
  item: MenuItem;
  isCollapsed: boolean;
}

function NavItem({ item, isCollapsed }: NavItemProps) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = location.pathname === item.path;

  // Render icon if available
  const IconComponent = item.icon ? iconMap[item.icon] : null;

  // Don't render menu items without paths in collapsed mode
  if (isCollapsed && !item.path) {
    return null;
  }

  // For GROUP type, render as expandable header
  if (item.type === 'GROUP' && hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200',
            'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <div className="flex items-center gap-3">
            {IconComponent && (
              <IconComponent />
            )}
            {!isCollapsed && (
              <span className="font-medium text-sm">{item.name}</span>
            )}
          </div>
          {!isCollapsed && (
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          )}
        </button>

        {!isCollapsed && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map((child) => (
              <NavItem key={child.id} item={child} isCollapsed={isCollapsed} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // For MENU/LINK type with path
  if (item.path) {
    return (
      <Link
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
        {IconComponent && (
          <span className={cn(isActive ? 'text-indigo-600' : 'text-slate-500')}>
            <IconComponent />
          </span>
        )}
        {!isCollapsed && (
          <span className="font-medium text-sm">{item.name}</span>
        )}
      </Link>
    );
  }

  // Fallback
  return null;
}

export function DynamicSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const { data: menus, isLoading, error } = useSidebar();

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
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            Failed to load menu
          </div>
        ) : menus && menus.length > 0 ? (
          menus.map((item) => (
            <NavItem key={item.id} item={item} isCollapsed={isCollapsed} />
          ))
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            No menu items available
          </p>
        )}
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
