// Date and time formatters

// Format date to Indonesian locale
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

// Format time to Indonesian locale
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Format date and time
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)}, ${formatTime(d)}`;
}

// Generate order number
export function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD-${dateStr}-${randomNum}`;
}

// Format phone number for WhatsApp
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Add country code if not present
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  }
  if (!digits.startsWith('62')) {
    digits = '62' + digits;
  }

  return digits;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Format table display name
export function formatTableName(tableCode: string, tableName?: string | null): string {
  if (tableName) {
    return `${tableCode} - ${tableName}`;
  }
  return tableCode;
}

// Format order type label
export function formatOrderTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    dine_in_with_table: 'Dine In (Meja)',
    dine_in_quick_service: 'Quick Service',
    takeaway: 'Takeaway',
  };
  return labels[type] || type;
}

// Format modifier selection type
export function formatSelectionType(type: 'single' | 'multiple'): string {
  return type === 'single' ? 'Pilih salah satu' : 'Pilih beberapa';
}

// Pluralize text (Indonesian)
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || singular + 's';
}

// Format item count
export function formatItemCount(count: number): string {
  return `${count} ${pluralize(count, 'item', 'items')}`;
}
