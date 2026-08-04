import { useState, useMemo } from 'react';
import { RefreshCw, ChevronRight, Shield } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useMenuPermissions, useAllPermissions, useSetMenuPermissions } from '../../hooks/useMenuPermissions';
import type { MenuPermissionResponse, PermissionSimple } from '../../api/menu-permission.api';

export function MenuPermissionsPage() {
  const { data: menusData, isLoading, isFetching, refetch, error } = useMenuPermissions();
  const { data: allPermissions } = useAllPermissions();
  const setPermissions = useSetMenuPermissions();

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    if (!allPermissions) return {};

    const groups: Record<string, PermissionSimple[]> = {};
    allPermissions.forEach((perm) => {
      // Extract resource name from permission code (e.g., "view_categories" -> "categories")
      const parts = perm.code.split('_');
      let resource = parts.slice(1).join('_'); // Remove action prefix

      // Clean up resource names for display
      resource = resource
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(perm);
    });

    return groups;
  }, [allPermissions]);

  // Group menus by type
  const groupedMenus = useMemo(() => {
    if (!menusData) return { GROUP: [], MENU: [], SUBMENU: [], LINK: [] };

    const groups: Record<string, MenuPermissionResponse[]> = {
      GROUP: [],
      MENU: [],
      SUBMENU: [],
      LINK: [],
    };

    menusData.forEach((menu) => {
      // Determine type from menu code patterns
      const code = menu.menuCode.toLowerCase();
      if (['dashboard', 'rbac', 'master-data', 'master_data'].includes(code)) {
        groups.GROUP.push(menu);
      } else {
        groups.MENU.push(menu);
      }
    });

    return groups;
  }, [menusData]);

  const handleToggleExpand = (menuId: string) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);

    // Initialize selected permissions when expanding
    if (expandedMenu !== menuId) {
      const menu = menusData?.find((m) => m.menuId === menuId);
      if (menu) {
        setSelectedPermissions((prev) => ({
          ...prev,
          [menuId]: menu.permissions.map((p) => p.id),
        }));
      }
    }
  };

  const handleTogglePermission = (menuId: string, permissionId: string) => {
    setSelectedPermissions((prev) => {
      const current = prev[menuId] || [];
      const isSelected = current.includes(permissionId);

      return {
        ...prev,
        [menuId]: isSelected
          ? current.filter((id) => id !== permissionId)
          : [...current, permissionId],
      };
    });

    // Mark as having changes
  };

  const handleSave = async (menuId: string) => {
    const permissionIds = selectedPermissions[menuId] || [];
    try {
      await setPermissions.mutateAsync({ menuId, permissionIds });
      setExpandedMenu(null);
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
  };

  const handleCancel = () => {
    setSelectedPermissions({});
    setExpandedMenu(null);
  };

  const getActionLabel = (code: string): string => {
    const action = code.split('_')[0];
    const labels: Record<string, string> = {
      view: 'View',
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
    };
    return labels[action] || action;
  };

  return (
    <MasterPage
      title="Menu Permissions"
      subtitle="Assign permissions to control menu visibility"
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      }
    >
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">How Menu Permissions Work</h3>
            <p className="text-sm text-blue-700 mt-1">
              Each menu can be assigned multiple permissions. A menu will only appear in the sidebar
              if the user has at least one of the assigned permissions. If no permissions are assigned,
              the menu will be hidden from all users.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Unable to load menu permissions
            </h3>
            <p className="text-sm text-slate-500 mb-4">{error.message}</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Menu List */}
          {groupedMenus.MENU.map((menu) => {
            const isExpanded = expandedMenu === menu.menuId;
            const selected = selectedPermissions[menu.menuId] || [];
            const originalPermissionIds = menu.permissions.map((p) => p.id);
            const hasUnsavedChanges = JSON.stringify(selected.sort()) !== JSON.stringify(originalPermissionIds.sort());
            const isSaving = setPermissions.isPending;

            return (
              <div
                key={menu.menuId}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Menu Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => handleToggleExpand(menu.menuId)}
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                    <div>
                      <h3 className="font-medium text-slate-900">{menu.menuName}</h3>
                      <p className="text-xs text-slate-500 font-mono">{menu.menuCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {menu.permissions.length > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {menu.permissions.slice(0, 3).map((perm) => (
                          <Badge key={perm.id} variant="info" size="sm">
                            {getActionLabel(perm.code)}
                          </Badge>
                        ))}
                        {menu.permissions.length > 3 && (
                          <Badge variant="default" size="sm">
                            +{menu.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Hidden (No Permission)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Expanded Permission Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-4 bg-slate-50">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">
                        Select Permissions for "{menu.menuName}"
                      </h4>
                      <p className="text-xs text-slate-500">
                        Menu will be visible to users who have at least one of the selected permissions.
                      </p>
                    </div>

                    {/* Permission Groups */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                        <div
                          key={resource}
                          className="bg-white rounded-lg border border-slate-200 p-3"
                        >
                          <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            {resource}
                          </h5>
                          <div className="space-y-1">
                            {permissions.map((perm) => {
                              const isSelected = selected.includes(perm.id);
                              const wasOriginallyAssigned = originalPermissionIds.includes(perm.id);

                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-indigo-50 border border-indigo-200'
                                      : 'hover:bg-slate-100'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleTogglePermission(menu.menuId, perm.id)}
                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700">
                                      {getActionLabel(perm.code)} {resource}
                                    </p>
                                    <p className="text-xs text-slate-400 font-mono truncate">
                                      {perm.code}
                                    </p>
                                  </div>
                                  {wasOriginallyAssigned && !isSelected && (
                                    <Badge variant="warning" size="sm">
                                      Will be removed
                                    </Badge>
                                  )}
                                  {isSelected && !wasOriginallyAssigned && (
                                    <Badge variant="success" size="sm">
                                      New
                                    </Badge>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="text-sm text-slate-500">
                        {selected.length === 0 ? (
                          <span className="text-amber-600">
                            ⚠️ No permissions selected - Menu will be hidden from all users
                          </span>
                        ) : (
                          <span>
                            {selected.length} permission{selected.length !== 1 ? 's' : ''} selected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSave(menu.menuId)}
                          isLoading={isSaving}
                          disabled={!hasUnsavedChanges && JSON.stringify(selected.sort()) === JSON.stringify(originalPermissionIds.sort())}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </MasterPage>
  );
}
