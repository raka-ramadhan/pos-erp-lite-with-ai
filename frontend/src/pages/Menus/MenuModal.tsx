import { useEffect, useState } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import {
  LayoutDashboard, Database, Users, Shield, Key, Package,
  Tags, ShoppingCart, ShoppingBag, BarChart3, Settings,
  Mail, Menu, Home, User, FileText, Folder,
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
  Play, Plus, Power, Printer, RefreshCw, Repeat,
  RotateCcw, RotateCw, Save, Scissors, Search as SearchIcon,
  Send, Server, Share, Share2, ShieldCheck, ShieldPlus,
  Sidebar, Signal, SkipBack, SkipForward,
  Smartphone, Snowflake, Sparkles, Square,
  Star, Store, Sun, Sunrise, Sunset, Table,
  Tablet, Target, Terminal, ToggleLeft,
  ToggleRight, Trash, Trash2, Truck,
  Type, Umbrella, Unlock, Upload, UserCheck,
  UserMinus, UserPlus, Users as UsersIcon, Video,
  VideoOff, Voicemail, Volume1, Volume2, VolumeX,
  Watch, Wifi, Wind, X as XIcon, Zap, ZoomIn, ZoomOut,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { useCreateMenu, useUpdateMenu, useMenus } from '../../hooks/useMenus';
import type { MenuItem } from '../../types';

const menuSchema = z.object({
  name: z.string().min(1, 'Menu name is required'),
  code: z.string().min(1, 'Menu code is required')
    .regex(/^[a-z_]+$/, 'Code must be lowercase with underscores'),
  description: z.string().optional(),
  type: z.enum(['GROUP', 'MENU', 'SUBMENU', 'LINK']),
  icon: z.string().optional(),
  path: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean(),
  isHidden: z.boolean(),
  parentId: z.string().nullable().optional(),
  permissionId: z.string().nullable().optional(),
});

type MenuFormData = z.infer<typeof menuSchema>;

// Icon mapping - name to component
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Database, Users, Shield, Key, Package,
  Tags, ShoppingCart, ShoppingBag, BarChart3, Settings,
  Mail, Menu, Home, User, FileText, Folder,
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
  Play, Plus, Power, Printer, RefreshCw, Repeat,
  RotateCcw, RotateCw, Save, Scissors, SearchIcon,
  Send, Server, Share, Share2, ShieldCheck, ShieldPlus,
  Sidebar, Signal, SkipBack, SkipForward,
  Smartphone, Snowflake, Sparkles, Square,
  Star, Store, Sun, Sunrise, Sunset, Table,
  Tablet, Target, Terminal, ToggleLeft,
  ToggleRight, Trash, Trash2, Truck,
  Type, Umbrella, Unlock, Upload, UserCheck,
  UserMinus, UserPlus, UsersIcon, Video,
  VideoOff, Voicemail, Volume1, Volume2, VolumeX,
  Watch, Wifi, Wind, XIcon, Zap, ZoomIn, ZoomOut,
};

// Available icons with categories
const ICON_CATEGORIES = {
  'Navigation': ['LayoutDashboard', 'Menu', 'Home', 'Navigation', 'Sidebar', 'Maximize2', 'Minimize2'],
  'Users': ['Users', 'User', 'UserPlus', 'UserMinus', 'UserCheck', 'UsersIcon'],
  'Content': ['FileText', 'File', 'Folder', 'Archive', 'Clipboard', 'BookOpen', 'Type'],
  'Data': ['Database', 'Server', 'Cpu', 'Activity'],
  'Business': ['Briefcase', 'Building', 'Building2', 'Store', 'ShoppingCart', 'ShoppingBag', 'CreditCard', 'DollarSign'],
  'Communication': ['Mail', 'MessageSquare', 'Bell', 'Inbox', 'Send', 'Voicemail'],
  'Security': ['Shield', 'ShieldCheck', 'ShieldPlus', 'Lock', 'Unlock', 'Key', 'Eye'],
  'Media': ['Image', 'Camera', 'Video', 'VideoOff', 'Music', 'Play', 'Pause'],
  'Charts': ['BarChart', 'BarChart3', 'PieChart', 'TrendingUp', 'TrendingDown', 'Activity', 'Percent'],
  'Actions': ['Plus', 'Edit', 'Trash', 'Trash2', 'Copy', 'Scissors', 'Save', 'Upload', 'Share', 'Share2'],
  'UI': ['Settings', 'ToggleLeft', 'ToggleRight', 'Bell', 'MoreHorizontal', 'MoreVertical', 'Maximize2', 'Minimize2', 'XIcon', 'Check', 'SearchIcon'],
  'Status': ['Check', 'CheckSquare', 'Info', 'HelpCircle', 'Flag', 'Star'],
  'Lists': ['List', 'Link', 'Map', 'Target', 'Compass', 'Navigation'],
  'Time': ['Clock', 'Calendar', 'Sunrise', 'Sunset', 'Sun', 'Snowflake'],
  'Money': ['DollarSign', 'CreditCard', 'Gift', 'Tags', 'Percent', 'TrendingUp', 'TrendingDown'],
  'Flags': ['Globe', 'Flag', 'Map', 'Compass', 'Navigation', 'Signal'],
};

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuItem | null;
}

export function MenuModal({ isOpen, onClose, menu }: MenuModalProps) {
  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();
  const { data: menus } = useMenus();

  const isEditing = !!menu;
  const isSubmitting = createMenu.isPending || updateMenu.isPending;
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      type: 'MENU',
      icon: '',
      path: '',
      sortOrder: 1,
      isActive: true,
      isHidden: false,
      parentId: null,
      permissionId: null,
    },
  });

  const watchedType = watch('type');
  const watchedIcon = watch('icon');
  const watchedParentId = watch('parentId');

  useEffect(() => {
    if (isOpen) {
      if (menu) {
        reset({
          name: menu.name,
          code: menu.code,
          description: menu.description || '',
          type: menu.type as any,
          icon: menu.icon || '',
          path: menu.path || '',
          sortOrder: menu.sortOrder,
          isActive: menu.isActive,
          isHidden: menu.isHidden,
          parentId: menu.parentId || null,
          permissionId: menu.permissions?.[0]?.id || null,
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          type: 'MENU',
          icon: '',
          path: '',
          sortOrder: 1,
          isActive: true,
          isHidden: false,
          parentId: null,
          permissionId: null,
        });
      }
    }
  }, [isOpen, menu, reset]);

  // Build parent options for dropdown
  const buildParentOptions = (items: MenuItem[], depth = 0): { value: string; label: string }[] => {
    const options: { value: string; label: string }[] = [];
    items.forEach((item) => {
      if (menu && item.id === menu.id) return;
      const prefix = depth > 0 ? '  '.repeat(depth) + '└ ' : '';
      options.push({ value: item.id, label: `${prefix}${item.name}` });
      if (item.children && item.children.length > 0) {
        options.push(...buildParentOptions(item.children, depth + 1));
      }
    });
    return options;
  };

  const parentOptions = menus ? [
    { value: '', label: 'No Parent (Root)' },
    ...buildParentOptions(menus),
  ] : [{ value: '', label: 'Loading...' }];

  // Filter icons based on search
  const filteredCategories = iconSearch
    ? { 'Search Results': Object.keys(ICON_MAP).filter(name => name.toLowerCase().includes(iconSearch.toLowerCase())) }
    : ICON_CATEGORIES;

  const onSubmit = async (data: MenuFormData) => {
    try {
      const submitData = {
        ...data,
        parentId: data.parentId || undefined,
        permissionId: data.permissionId || undefined,
      };

      if (isEditing && menu) {
        await updateMenu.mutateAsync({
          id: menu.id,
          data: submitData,
        });
      } else {
        await createMenu.mutateAsync(submitData as any);
      }
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to save menu';
      alert(message);
    }
  };

  // Render icon component
  const renderIcon = (iconName: string, size = 18) => {
    const IconComponent = ICON_MAP[iconName];
    if (!IconComponent) return <LayoutDashboard size={size} className="text-slate-400" />;
    return <IconComponent size={size} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Menu' : 'Create New Menu'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Menu Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['GROUP', 'MENU', 'SUBMENU', 'LINK'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue('type', type)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      watchedType === type
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Name and Code */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Menu Name"
                placeholder="e.g. Dashboard"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Menu Code"
                placeholder="e.g. dashboard"
                error={errors.code?.message}
                disabled={isEditing}
                {...register('code')}
              />
            </div>

            {/* Parent Menu */}
            <div>
              <Select
                label="Parent Menu"
                options={parentOptions}
                value={watchedParentId || ''}
                onChange={(e) => setValue('parentId', e.target.value || null)}
              />
            </div>

            {/* Route and Icon */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Route Path"
                placeholder="e.g. /dashboard/users"
                error={errors.path?.message}
                {...register('path')}
              />

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Icon
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowIconPicker(!showIconPicker);
                      setIconSearch('');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left flex items-center justify-between hover:border-slate-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {watchedIcon ? (
                        <>
                          <span className="text-indigo-600">
                            {renderIcon(watchedIcon, 18)}
                          </span>
                          <span className="text-slate-700">{watchedIcon}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">Select an icon</span>
                      )}
                    </div>
                    <ChevronDown size={16} className="text-slate-400" />
                  </button>

                  {showIconPicker && (
                    <div className="absolute z-20 w-80 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl">
                      {/* Search */}
                      <div className="p-3 border-b border-slate-200">
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search icons..."
                            value={iconSearch}
                            onChange={(e) => setIconSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Icon Grid */}
                      <div className="max-h-72 overflow-y-auto p-2">
                        {Object.entries(filteredCategories).map(([category, iconNames]) => {
                          if (iconNames.length === 0) return null;
                          return (
                            <div key={category} className="mb-3">
                              {!iconSearch && (
                                <p className="text-xs font-medium text-slate-500 px-2 mb-1">{category}</p>
                              )}
                              <div className="grid grid-cols-6 gap-1">
                                {iconNames.map((iconName) => {
                                  const IconComponent = ICON_MAP[iconName];
                                  if (!IconComponent) return null;
                                  const isSelected = watchedIcon === iconName;
                                  return (
                                    <button
                                      key={iconName}
                                      type="button"
                                      onClick={() => {
                                        setValue('icon', iconName);
                                        setShowIconPicker(false);
                                        setIconSearch('');
                                      }}
                                      className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                                        isSelected
                                          ? 'bg-indigo-100 ring-2 ring-indigo-500'
                                          : 'hover:bg-slate-100'
                                      }`}
                                      title={iconName}
                                    >
                                      <IconComponent size={20} className={isSelected ? 'text-indigo-600' : 'text-slate-600'} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {iconSearch && Object.values(filteredCategories)[0]?.length === 0 && (
                          <p className="text-sm text-slate-500 text-center py-4">No icons found</p>
                        )}
                      </div>

                      {/* Footer */}
                      {watchedIcon && (
                        <div className="p-2 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => {
                              setValue('icon', '');
                              setShowIconPicker(false);
                              setIconSearch('');
                            }}
                            className="w-full text-sm text-red-600 hover:bg-red-50 py-1.5 rounded-lg"
                          >
                            Clear Selection
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Enter menu description (optional)"
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Sort Order */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sort Order"
                type="number"
                min={0}
                {...register('sortOrder', { valueAsNumber: true })}
              />
              <Select
                label="Permission"
                options={[
                  { value: '', label: 'No Permission (Public)' },
                ]}
                value={watch('permissionId') || ''}
                onChange={(e) => setValue('permissionId', e.target.value || null)}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <Checkbox
                label="Active"
                {...register('isActive')}
              />
              <Checkbox
                label="Hidden (not in sidebar)"
                {...register('isHidden')}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
              >
                {isEditing ? 'Update Menu' : 'Create Menu'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
