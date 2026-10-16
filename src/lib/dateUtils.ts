export const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const todayKey = () => toDateKey(new Date());

export function calcAge(dob?: string | null): number | string {
    if (!dob) return '—';
    const b = new Date(dob);
    if (isNaN(b.getTime())) return '—';
    const n = new Date();
    let age = n.getFullYear() - b.getFullYear();
    const m = n.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--;
    return age;
}

export function formatTime(slot?: string | null) {
    if (!slot) return '—';
    const [h, m] = slot.split(':').map(Number);
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

const parseKey = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const formatDateLabel = (key: string) =>
    parseKey(key).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export const formatShortDate = (key: string) =>
    parseKey(key).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const formatPatientCode = (id: string) => `P-${id.padStart(4, '0')}`;