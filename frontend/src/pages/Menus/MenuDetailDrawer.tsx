import { X, ChevronRight, Shield, Calendar, Eye, EyeOff } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { MenuItem } from '../../types';

interface MenuDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuItem | null;
  onEdit: (menu: MenuItem) => void;
}

export function MenuDetailDrawer({ isOpen, onClose, menu, onEdit }: MenuDetailDrawerProps) {
  if (!isOpen || !menu) return null;

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

  const childCount = menu.children?.length || 0;
  const permissionCount = menu.permissions?.length || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-bold">{menu.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{menu.name}</h2>
              <p className="text-sm text-slate-500 font-mono">{menu.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={menu.isActive ? 'success' : 'danger'} size="sm">
              {menu.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Menu Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Type</label>
                  <div className="mt-1">{getTypeBadge(menu.type)}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Visibility</label>
                  <div className="mt-1 flex items-center gap-1">
                    {menu.isHidden ? (
                      <>
                        <EyeOff className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">Hidden</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-slate-600">Visible</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500">Route</label>
                  <p className="text-sm font-mono text-slate-900">{menu.path || '-'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500">Description</label>
                  <p className="text-sm text-slate-900">{menu.description || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Sort Order</label>
                  <p className="text-sm text-slate-900">{menu.sortOrder}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Icon</label>
                  <p className="text-sm text-slate-900">{menu.icon || '-'}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-indigo-600">{childCount}</span>
                </div>
                <p className="text-xs text-slate-500">Child Menus</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-green-600">{permissionCount}</span>
                </div>
                <p className="text-xs text-slate-500">Permissions</p>
              </div>
            </div>

            {/* Child Menus */}
            {menu.children && menu.children.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  Child Menus ({childCount})
                </h3>
                <div className="space-y-2">
                  {menu.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" size="sm">{child.type}</Badge>
                        <span className="text-sm font-medium text-slate-900">{child.name}</span>
                      </div>
                      <Badge variant={child.isActive ? 'success' : 'danger'} size="sm">
                        {child.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Permissions */}
            {menu.permissions && menu.permissions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Required Permissions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {menu.permissions.map((perm) => (
                    <Badge key={perm.id} variant="outline" size="sm">
                      {perm.code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Created</label>
                  <p className="text-sm text-slate-900">
                    {new Date(menu.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Last Updated</label>
                  <p className="text-sm text-slate-900">
                    {new Date(menu.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => onEdit(menu)}>
            Edit Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
