import { useState, useMemo } from 'react';
import {
  Plus, RefreshCw, ChevronRight, ChevronDown, Pencil, Trash2,
  LayoutDashboard, Database, Users, Shield, Key, Package,
  Tags, ShoppingCart, ShoppingBag, BarChart3, Settings,
  Mail, User, FileText, Folder,
  HelpCircle, Bell, Calendar, Clock, Map,
  CreditCard, DollarSign, PieChart, BarChart,
  TrendingUp, TrendingDown, Activity, File,
  Archive, BookOpen, Briefcase, Building, Building2,
  Camera, Cast, CheckSquare, Clipboard,
  Code, Coffee, Command, Compass, Copy, Cpu,
  Edit, Eye, Flag, Gift, Globe, Hash,
  Heart, Image, Inbox, Info, Layers, Link,
  List, Lock, LogIn, LogOut, Maximize2, MessageSquare,
  Minimize2, MoreHorizontal, MoreVertical, Move,
  Music, Navigation, Octagon, Pause, Percent,
  Play, Power, Printer, Repeat,
  RotateCcw, RotateCw, Save, Scissors,
  Send, Server, Share, Share2, ShieldCheck, ShieldPlus,
  Sidebar, Signal, SkipBack, SkipForward,
  Smartphone, Snowflake, Sparkles, Square,
  Star, Store, Sun, Sunrise, Sunset, Table,
  Tablet, Target, Terminal, ToggleLeft,
  ToggleRight, Trash, Truck,
  Type, Umbrella, Unlock, Upload, UserCheck,
  UserMinus, UserPlus, Video,
  VideoOff, Voicemail, Volume1, Volume2, VolumeX,
  Watch, Wifi, Wind, Zap, ZoomIn, ZoomOut,
} from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { useMenus, useDeleteMenu } from '../../hooks/useMenus';
import { useHasPermission } from '../../hooks/usePermission';
import { MenuModal } from './MenuModal';
import { MenuDetailDrawer } from './MenuDetailDrawer';
import type { MenuItem } from '../../types';

// Icon mapping for menu icons
const MENU_ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Database, Users, Shield, Key, Package,
  Tags, ShoppingCart, ShoppingBag, BarChart3, Settings,
  Mail, User, FileText, Folder,
  HelpCircle, Bell, Calendar, Clock, Map,
  CreditCard, DollarSign, PieChart, BarChart,
  TrendingUp, TrendingDown, Activity, File,
  Archive, BookOpen, Briefcase, Building, Building2,
  Camera, Cast, CheckSquare, Clipboard,
  Code, Coffee, Command, Compass, Copy, Cpu,
  Edit, Eye, Flag, Gift, Globe, Hash,
  Heart, Image, Inbox, Info, Layers, Link,
  List, Lock, LogIn, LogOut, Maximize2, MessageSquare,
  Minimize2, MoreHorizontal, MoreVertical, Move,
  Music, Navigation, Octagon, Pause, Percent,
  Play, Power, Printer, Repeat,
  RotateCcw, RotateCw, Save, Scissors,
  Send, Server, Share, Share2, ShieldCheck, ShieldPlus,
  Sidebar, Signal, SkipBack, SkipForward,
  Smartphone, Snowflake, Sparkles, Square,
  Star, Store, Sun, Sunrise, Sunset, Table,
  Tablet, Target, Terminal, ToggleLeft,
  ToggleRight, Trash, Truck,
  Type, Umbrella, Unlock, Upload, UserCheck,
  UserMinus, UserPlus, Video,
  VideoOff, Voicemail, Volume1, Volume2, VolumeX,
  Watch, Wifi, Wind, Zap, ZoomIn, ZoomOut,
};

export function MenusPage() {
  // State
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [viewingMenu, setViewingMenu] = useState<MenuItem | null>(null);

  // Queries
  const { data: menus, isLoading, refetch } = useMenus();
  const deleteMenu = useDeleteMenu();

  // Permissions
  const canCreate = useHasPermission('menu.create');
  const canUpdate = useHasPermission('menu.update');
  const canDelete = useHasPermission('menu.delete');

  // Toggle expanded
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Expand all
  const expandAll = () => {
    if (!menus) return;
    const allIds = new Set<string>();
    const collectIds = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          allIds.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(menus);
    setExpandedIds(allIds);
  };

  // Collapse all
  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Filter menus based on search
  const filterMenus = (items: MenuItem[], query: string): MenuItem[] => {
    if (!query) return items;

    const lowerQuery = query.toLowerCase();
    const result: MenuItem[] = [];

    items.forEach((item) => {
      const matches =
        item.name.toLowerCase().includes(lowerQuery) ||
        item.code.toLowerCase().includes(lowerQuery) ||
        item.path?.toLowerCase().includes(lowerQuery);

      if (matches) {
        result.push(item);
      } else if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenus(item.children, query);
        if (filteredChildren.length > 0) {
          result.push({ ...item, children: filteredChildren });
        }
      }
    });

    return result;
  };

  // Apply filters
  const filteredMenus = useMemo(() => {
    let result = menus || [];

    // Apply search
    if (searchQuery) {
      result = filterMenus(result, searchQuery);
    }

    // Apply type filter
    if (typeFilter) {
      const applyTypeFilter = (items: MenuItem[]): MenuItem[] => {
        return items
          .filter((item) => item.type === typeFilter)
          .map((item) => ({
            ...item,
            children: item.children ? applyTypeFilter(item.children) : [],
          }));
      };
      result = applyTypeFilter(result);
    }

    // Apply status filter
    if (statusFilter) {
      const isActive = statusFilter === 'active';
      const applyStatusFilter = (items: MenuItem[]): MenuItem[] => {
        return items
          .filter((item) => item.isActive === isActive)
          .map((item) => ({
            ...item,
            children: item.children ? applyStatusFilter(item.children) : [],
          }));
      };
      result = applyStatusFilter(result);
    }

    return result;
  }, [menus, searchQuery, typeFilter, statusFilter]);

  // Handlers
  const handleCreate = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleView = (menu: MenuItem) => {
    setViewingMenu(menu);
  };

  const handleDelete = async (menu: MenuItem, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (menu.children && menu.children.length > 0) {
      alert(`Cannot delete "${menu.name}" because it has ${menu.children.length} child menu(s). Please delete or move the children first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete menu "${menu.name}"?`)) {
      try {
        await deleteMenu.mutateAsync(menu.id);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to delete menu';
        alert(message);
      }
    }
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'GROUP':
        return <Badge variant="info" size="sm">Group</Badge>;
      case 'MENU':
        return <Badge variant="secondary" size="sm">Menu</Badge>;
      case 'SUBMENU':
        return <Badge variant="warning" size="sm">Submenu</Badge>;
      case 'LINK':
        return <Badge variant="default" size="sm">Link</Badge>;
      default:
        return <Badge size="sm">{type}</Badge>;
    }
  };

  // Render menu item recursively
  const renderMenuItem = (menu: MenuItem, depth = 0) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedIds.has(menu.id);

    // Get icon component
    const IconComponent = menu.icon ? MENU_ICON_MAP[menu.icon] : null;

    return (
      <div key={menu.id}>
        <div
          className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100 cursor-pointer ${
            depth > 0 ? 'ml-' + (depth * 8) : ''
          }`}
          style={{ marginLeft: depth * 32 }}
          onClick={() => handleView(menu)}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpand(menu.id);
            }}
            className={`w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 ${
              hasChildren ? 'text-slate-500' : 'text-transparent'
            }`}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <span className="w-4 h-4" />
            )}
          </button>

          {/* Icon */}
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            {IconComponent ? (
              <IconComponent className="w-4 h-4 text-indigo-600" />
            ) : (
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
            )}
          </div>

          {/* Menu Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{menu.name}</span>
              {getTypeBadge(menu.type)}
              {!menu.isActive && <Badge variant="danger" size="sm">Inactive</Badge>}
              {menu.isHidden && <Badge variant="default" size="sm">Hidden</Badge>}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-mono">{menu.code}</span>
              {menu.path && <span className="font-mono">{menu.path}</span>}
            </div>
          </div>

          {/* Child Count */}
          {hasChildren && (
            <Badge variant="outline" size="sm">
              {menu.children.length} child
            </Badge>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(menu);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => handleDelete(menu, e)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
                title="Delete"
                disabled={hasChildren}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="bg-slate-50">
            {menu.children.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <MasterPage
      title="Menu Management"
      subtitle="Manage application navigation and sidebar"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Menu
            </Button>
          )}
        </div>
      }
      canCreate={!!canCreate}
    >
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="search"
            placeholder="Search menus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Select
            options={[
              { value: '', label: 'All Types' },
              { value: 'GROUP', label: 'Group' },
              { value: 'MENU', label: 'Menu' },
              { value: 'SUBMENU', label: 'Submenu' },
              { value: 'LINK', label: 'Link' },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="secondary" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Tree */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LayoutDashboard className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No menus found</h3>
            <p className="text-sm text-slate-500 mb-4">
              {searchQuery || typeFilter || statusFilter
                ? 'Try adjusting your filters'
                : 'Create a new menu to get started'}
            </p>
            {canCreate && !searchQuery && (
              <Button variant="primary" size="sm" onClick={handleCreate}>
                Add Menu
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMenus.map((menu) => renderMenuItem(menu))}
          </div>
        )}
      </div>

      {/* Menu Modal */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menu={editingMenu}
      />

      {/* Detail Drawer */}
      <MenuDetailDrawer
        isOpen={!!viewingMenu}
        onClose={() => setViewingMenu(null)}
        menu={viewingMenu}
        onEdit={handleEdit}
      />
    </MasterPage>
  );
}
