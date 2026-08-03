import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { MenuItem } from '../types';

const STORAGE_KEY = 'sidebar_expanded';

/**
 * Helper to find all parent IDs of a given path in a menu tree
 */
function findParentIds(menus: MenuItem[], targetPath: string, parents: string[] = []): string[] {
  for (const menu of menus) {
    if (menu.path === targetPath) {
      return parents;
    }

    if (menu.children && menu.children.length > 0) {
      const found = findParentIds(menu.children, targetPath, [...parents, menu.id]);
      if (found.length > 0 || menu.children.some(child => child.path === targetPath)) {
        if (menu.children.some(child => child.path === targetPath)) {
          return [...parents, menu.id];
        }
        return found;
      }
    }
  }
  return [];
}

/**
 * Helper to flatten menu tree for path lookups
 */
function flattenMenus(menus: MenuItem[], result: MenuItem[] = []): MenuItem[] {
  for (const menu of menus) {
    result.push(menu);
    if (menu.children && menu.children.length > 0) {
      flattenMenus(menu.children, result);
    }
  }
  return result;
}

interface SidebarNavigationState {
  /** Set of expanded parent menu IDs */
  expandedIds: Set<string>;
  /** Toggle expand/collapse for a menu item */
  toggle: (id: string) => void;
  /** Set expanded state for a menu item */
  setExpanded: (id: string, expanded: boolean) => void;
  /** Expand a specific menu item and all its parents */
  expandToPath: (path: string, menus: MenuItem[]) => void;
  /** Check if a menu item is expanded */
  isExpanded: (id: string) => boolean;
  /** Check if current route is a descendant of this menu */
  isRouteActive: (menu: MenuItem) => boolean;
  /** Get the deepest active menu item */
  getActiveMenu: (menus: MenuItem[]) => MenuItem | null;
}

export function useSidebarNavigation(menus: MenuItem[] | undefined): SidebarNavigationState {
  const location = useLocation();
  const currentPath = location.pathname;
  const isInitialized = useRef(false);

  // Load persisted state from localStorage
  const getPersistedState = useCallback((): Set<string> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return new Set();
  }, []);

  // State for expanded menu IDs
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => getPersistedState());

  // Persist state to localStorage
  useEffect(() => {
    if (isInitialized.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedIds]));
      } catch {
        // Ignore localStorage errors
      }
    }
    isInitialized.current = true;
  }, [expandedIds]);

  // Flatten menus for quick lookup
  const flattenedMenus = useMemo(() => {
    if (!menus) return [];
    return flattenMenus(menus);
  }, [menus]);

  // Get all parent IDs for the current path
  const parentIdsForCurrentRoute = useMemo(() => {
    if (!menus || !currentPath) return new Set<string>();
    const parents = findParentIds(menus, currentPath);
    return new Set(parents);
  }, [menus, currentPath]);

  // Initialize expanded state based on current route on mount
  useEffect(() => {
    if (!menus || menus.length === 0) return;

    // If current route is a child menu, expand its parents
    if (parentIdsForCurrentRoute.size > 0) {
      setExpandedIds(prev => {
        // Merge existing state with route-based parents
        // Route takes priority - always expand parents for active route
        const newSet = new Set([...prev, ...parentIdsForCurrentRoute]);
        return newSet;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, menus]); // Only run when path or menus change

  // Expand to a specific path (called on mount or route change)
  const expandToPath = useCallback((path: string, menuList: MenuItem[]) => {
    const parents = findParentIds(menuList, path);
    if (parents.length > 0) {
      setExpandedIds(prev => new Set([...prev, ...parents]));
    }
  }, []);

  // Toggle expand/collapse for a menu item
  const toggle = useCallback((id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Set expanded state for a menu item
  const setExpanded = useCallback((id: string, expanded: boolean) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  // Check if a menu item is expanded
  const isExpanded = useCallback((id: string) => {
    // Route-based expansion takes priority
    if (parentIdsForCurrentRoute.has(id)) {
      return true;
    }
    return expandedIds.has(id);
  }, [expandedIds, parentIdsForCurrentRoute]);

  // Check if current route is a descendant of this menu
  const isRouteActive = useCallback((menu: MenuItem): boolean => {
    if (!currentPath) return false;

    // Direct match
    if (menu.path === currentPath) {
      return true;
    }

    // Check if any child path matches
    if (menu.children && menu.children.length > 0) {
      return menu.children.some(child =>
        child.path === currentPath ||
        (child.children && child.children.some(grandChild => grandChild.path === currentPath))
      );
    }

    return false;
  }, [currentPath]);

  // Get the deepest active menu item
  const getActiveMenu = useCallback((_menuList: MenuItem[]): MenuItem | null => {
    return flattenedMenus.find(menu => menu.path === currentPath) || null;
  }, [flattenedMenus, currentPath]);

  return {
    expandedIds,
    toggle,
    setExpanded,
    expandToPath,
    isExpanded,
    isRouteActive,
    getActiveMenu,
  };
}
