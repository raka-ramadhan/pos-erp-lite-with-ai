import { type ReactNode, type ChangeEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface MasterPageProps {
  title: string;
  subtitle?: string;
  onCreate?: () => void;
  createLabel?: string;
  canCreate?: boolean;
  createPermission?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function MasterPage({
  title,
  subtitle,
  onCreate,
  createLabel = 'Add New',
  canCreate = true,
  searchPlaceholder = 'Search...',
  onSearch,
  searchQuery = '',
  children,
  actions,
}: MasterPageProps) {
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {actions}

          {onCreate && canCreate && (
            <Button
              variant="primary"
              size="md"
              onClick={onCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {createLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      {onSearch && (
        <div className="max-w-md">
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}
