export const CATEGORIES = [
  { value: 'Infrastruktur', label: '🏗️ Infrastruktur', color: 'blue' },
  { value: 'Lingkungan', label: '🌿 Lingkungan', color: 'green' },
  { value: 'Keamanan', label: '🛡️ Keamanan', color: 'red' },
  { value: 'Kesehatan', label: '🏥 Kesehatan', color: 'pink' },
  { value: 'Pendidikan', label: '📚 Pendidikan', color: 'purple' },
  { value: 'Administrasi', label: '📋 Administrasi', color: 'orange' },
  { value: 'Lainnya', label: '📌 Lainnya', color: 'gray' },
];

export const STATUSES = [
  { value: 'Menunggu', label: 'Menunggu', className: 'status-menunggu' },
  { value: 'Diproses', label: 'Diproses', className: 'status-diproses' },
  { value: 'Selesai', label: 'Selesai', className: 'status-selesai' },
  { value: 'Ditolak', label: 'Ditolak', className: 'status-ditolak' },
];

export const URGENCY_LEVELS = [
  { value: 'High', label: 'High', className: 'badge-high', icon: '🔴' },
  { value: 'Medium', label: 'Medium', className: 'badge-medium', icon: '🟡' },
  { value: 'Low', label: 'Low', className: 'badge-low', icon: '🟢' },
];

export const getStatusClass = (status) => {
  const map = {
    'Menunggu': 'pill-wait',
    'Diproses': 'pill-proc',
    'Selesai':  'pill-done',
    'Ditolak':  'pill-reject',
  };
  return map[status] || 'pill-wait';
};

export const getUrgencyClass = (urgency) => {
  const map = {
    'High':   'pill-high',
    'Medium': 'pill-medium',
    'Low':    'pill-low',
  };
  return map[urgency] || 'pill-medium';
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const formatDateShort = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};

export const resolveFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const rootUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  return `${rootUrl}${url}`;
};
