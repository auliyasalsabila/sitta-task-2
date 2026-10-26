export const rupiah = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
}).format(value);
export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const stockStatus = (item) => item.qty === 0 ? 'Kosong' : item.qty < item.safety ? 'Menipis' : 'Aman';
export function filterStocks(items, category, condition, sort, direction) {
    return items.filter(item => (!category || item.kategori === category) &&
            (condition === 'low' ? item.qty < item.safety : condition === 'empty' ? item.qty === 0 : true))
        .sort((a, b) => (sort === 'judul' ? a.judul.localeCompare(b.judul, 'id') : a[sort] - b[sort]) * (direction === 'desc' ? -1 : 1));
}
export function nextDo(tracking, year = new Date().getFullYear()) {
    const prefix = `DO${year}-`;
    const sequence = Object.keys(tracking).filter(key => key.startsWith(prefix) && /^\d+$/.test(key.slice(prefix.length)))
        .reduce((max, key) => Math.max(max, Number(key.slice(prefix.length))), 0) + 1;
    return prefix + String(sequence).padStart(3, '0');
}
export function validateStock(item, stocks, originalKey, regions, categories) {
    const errors = {};
    for (const key of ['kode', 'judul', 'lokasiRak'])
        if (!String(item[key] ?? '').trim()) errors[key] = 'Wajib diisi.';
    if (!/^[A-Z0-9-]+$/.test(item.kode)) errors.kode = 'Gunakan huruf kapital, angka, atau tanda hubung.';
    if (!regions.includes(item.upbjj)) errors.upbjj = 'Pilih UT-Daerah.';
    if (!categories.includes(item.kategori)) errors.kategori = 'Pilih kategori.';
    for (const key of ['harga', 'qty', 'safety']) {
        if (item[key] === '' || !Number.isFinite(Number(item[key])) || Number(item[key]) < 0 || !Number.isInteger(Number(item[key]))) errors[key] = 'Isi bilangan bulat minimal 0.';
    }
    if (String(item.catatanHTML).length > 500) errors.catatanHTML = 'Catatan maksimal 500 karakter.';
    if (stocks.some(s => `${s.kode}|${s.upbjj}` !== originalKey && s.kode === item.kode && s.upbjj === item.upbjj)) errors.kode = 'Kode sudah tersedia di UT-Daerah ini.';
    return errors;
}
export function validateOrder(order, packages, shipping) {
    const errors = {};
    if (!/^\d{9}$/.test(order.nim)) errors.nim = 'NIM harus terdiri dari 9 digit angka.';
    if (!order.nama.trim()) errors.nama = 'Nama wajib diisi.';
    if (!shipping.some(s => s.kode === order.pengiriman)) errors.pengiriman = 'Pilih ekspedisi.';
    if (!packages.some(p => p.kode === order.paket)) errors.paket = 'Pilih paket bahan ajar.';
    const date = new Date(`${order.tanggalKirim}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(order.tanggalKirim) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== order.tanggalKirim) errors.tanggalKirim = 'Isi tanggal yang valid.';
    return errors;
}
// Hanya tag pemformatan tanpa atribut yang diizinkan untuk v-html.
export function safeNote(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replace(/&lt;(\/?)(em|strong|u|i|b)&gt;/gi, '<$1$2>');
}
export function loadData(key, fallback) {
    try {
        const stored = JSON.parse(localStorage.getItem(`sitta-vue-v1-${key}`));
        if (stored && typeof stored === typeof fallback && Array.isArray(stored) === Array.isArray(fallback)) return stored;
    } catch {
        /* Gunakan data lampiran jika penyimpanan gagal. */ }
    return JSON.parse(JSON.stringify(fallback));
}
export function saveData(key, value) {
    try {
        localStorage.setItem(`sitta-vue-v1-${key}`, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}