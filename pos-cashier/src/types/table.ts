// Table types

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface DiningTable {
  id: string;
  tableCode: string;
  tableName: string;
  areaName: string;
  capacity: number;
  status: TableStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TableArea {
  areaName: string;
}

export interface TableSummary {
  id: string;
  tableCode: string;
  tableName: string;
  status: TableStatus;
}

// Table status display configuration
export const TABLE_STATUS_CONFIG: Record<
  TableStatus,
  { label: string; color: string; bgColor: string; selectable: boolean }
> = {
  available: {
    label: 'Tersedia',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    selectable: true,
  },
  occupied: {
    label: 'Terisi',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    selectable: false,
  },
  reserved: {
    label: 'Dipesan',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    selectable: false,
  },
  maintenance: {
    label: 'Perbaikan',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    selectable: false,
  },
};
