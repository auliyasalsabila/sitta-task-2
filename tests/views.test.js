import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import StockView from '../src/views/StockView.vue';
import TrackingView from '../src/views/TrackingView.vue';
import App from '../src/App.vue';
import HomeView from '../src/views/HomeView.vue';

let wrapper;
beforeEach(() => {
  localStorage.clear();
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { wrapper?.unmount(); document.body.innerHTML = ''; });

describe('Halaman stok Vue', () => {
  test('filter kategori mengikuti daerah dan reset membersihkan filter', async () => {
    wrapper = mount(StockView);
    expect(wrapper.findAll('tbody tr')).toHaveLength(4);
    expect(wrapper.findAll('.filter-grid select')).toHaveLength(4);
    await wrapper.find('.filter-grid select').setValue('Jakarta');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    await wrapper.findAll('.filter-grid select')[1].setValue('MK Wajib');
    await wrapper.find('.filter-grid select').setValue('Surabaya');
    expect(wrapper.vm.filters.category).toBe('');
    expect(wrapper.vm.categoryOptions).toEqual(['Praktikum']);
    await wrapper.find('.filters .text-button').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(4);
  });

  test('form menolak input kosong, menambah stok nol, lalu menyimpan edit', async () => {
    wrapper = mount(StockView, { attachTo: document.body });
    await wrapper.find('.page-header .primary').trigger('click');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.findAll('.field-error').length).toBeGreaterThan(0);
    expect(document.activeElement.id).toBe('kode');
    const fields = { kode: 'STSI4209', judul: 'Pemrograman Web', kategori: 'MK Wajib', upbjj: 'Jakarta', lokasiRak: 'R4-A1', harga: '75000', qty: '0', safety: '10' };
    for (const [id, value] of Object.entries(fields)) await wrapper.find(`#${id}`).setValue(value);
    await wrapper.find('form').trigger('submit');
    expect(wrapper.findAll('tbody tr')).toHaveLength(5);
    expect(wrapper.find('.badge.danger').text()).toContain('Kosong');
    let row = wrapper.findAll('tbody tr').find(row => row.text().includes('STSI4209'));
    await row.find('button').trigger('click');
    await wrapper.find('#qty').setValue('10');
    await wrapper.find('form').trigger('submit');
    row = wrapper.findAll('tbody tr').find(row => row.text().includes('STSI4209'));
    expect(row.find('.badge.success').text()).toContain('Aman');
    const saved = JSON.parse(localStorage.getItem('sitta-vue-v1-stok'));
    expect(saved.find(item => item.kode === 'STSI4209').qty).toBe(10);
  });
});

describe('Halaman tracking Vue', () => {
  test('pilihan paket memperbarui isi dan harga; submit membuat nomor DO berurutan', async () => {
    wrapper = mount(TrackingView);
    expect(wrapper.text()).toContain('Rina Wulandari');
    await wrapper.find('#paket').setValue('PAKET-UT-002');
    expect(wrapper.findAll('.package-detail li')).toHaveLength(2);
    expect(wrapper.vm.totalHarga).toBe(140000);
    const number = wrapper.vm.nextNumber;
    await wrapper.find('#nim').setValue('123456789');
    await wrapper.find('#nama').setValue('Mahasiswa Praktikum');
    await wrapper.find('#pengiriman').setValue('EXP');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.vm.selectedDo).toBe(number);
    expect(wrapper.vm.selectedOrder).toMatchObject({ total: 140000, status: 'Diproses', ekspedisi: 'JNE Express' });
    expect(wrapper.vm.nextNumber).not.toBe(number);
    expect(wrapper.vm.totalHarga).toBe(0);
    expect(JSON.parse(localStorage.getItem('sitta-vue-v1-tracking'))[number]).toBeDefined();
    await wrapper.find('input[type="search"]').setValue('Mahasiswa Praktikum');
    expect(wrapper.findAll('.order-card')).toHaveLength(1);
  });

  test('input DO kosong tidak menghasilkan pesanan baru', async () => {
    wrapper = mount(TrackingView);
    await wrapper.find('form').trigger('submit');
    expect(wrapper.vm.errors).toHaveProperty('nim');
    expect(wrapper.vm.errors).toHaveProperty('paket');
    expect(Object.keys(wrapper.vm.tracking)).toHaveLength(1);
  });
});

test('navigasi RouterLink memuat halaman Vue tanpa reload dokumen', async () => {
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/', component: HomeView }, { path: '/stok', component: StockView }, { path: '/tracking', component: TrackingView },
  ] });
  await router.push('/');
  await router.isReady();
  wrapper = mount(App, { global: { plugins: [router] } });
  await wrapper.find('nav a[href="/stok"]').trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe('/stok');
  expect(wrapper.findComponent(StockView).exists()).toBe(true);
  await wrapper.find('nav a[href="/tracking"]').trigger('click');
  await flushPromises();
  expect(wrapper.findComponent(TrackingView).exists()).toBe(true);
});
