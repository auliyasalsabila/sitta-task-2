<template>
    <div class="page-view">
        <header class="page-header compact">
            <div>
                <p class="eyebrow">INVENTORI</p>
                <h1>Stok Bahan Ajar</h1>
            </div>

            <button class="button primary" @click="openAdd">
                ＋ Tambah bahan ajar
            </button>
        </header>

        <div class="stats">
            <article>
                <span>Total persediaan</span>
                <strong>
                    {{ stats.total }} <small>eksemplar</small>
                </strong>
                <p>{{ stok.length }} data bahan ajar</p>
            </article>

            <article>
                <span>Stok menipis</span>
                <strong class="text-orange">
                    {{ stats.low }} <small>bahan ajar</small>
                </strong>
                <p>Perlu perhatian untuk re-order</p>
            </article>

            <article>
                <span>Stok kosong</span>
                <strong class="text-red">
                    {{ stats.empty }} <small>bahan ajar</small>
                </strong>
                <p>Prioritaskan pengadaan ulang</p>
            </article>
        </div>

        <p v-if="notice" class="notice" role="status">
            ✓ {{ notice }}
        </p>

        <p v-if="storageWarning" class="warning" role="alert">
            Penyimpanan browser tidak tersedia. Perubahan hanya bertahan di halaman ini.
        </p>

        <section class="panel filters">
            <div class="section-title">
                <h2>Temukan bahan ajar</h2>

                <button class="text-button" @click="resetFilters">
                    Reset filter
                </button>
            </div>

            <div class="filter-grid">
                <label>
                    UT-Daerah
                    <select v-model="filters.region">
                        <option value="">Seluruh UT-Daerah</option>
                        <option
                            v-for="region in upbjjList"
                            :key="region"
                        >
                            {{ region }}
                        </option>
                    </select>
                </label>

                <label v-if="filters.region">
                    Kategori mata kuliah
                    <select v-model="filters.category">
                        <option value="">Semua kategori</option>
                        <option
                            v-for="category in categoryOptions"
                            :key="category"
                        >
                            {{ category }}
                        </option>
                    </select>
                </label>

                <label>
                    Kondisi stok
                    <select v-model="filters.condition">
                        <option value="">Semua kondisi</option>
                        <option value="low">Di bawah safety stock</option>
                        <option value="empty">Stok kosong</option>
                    </select>
                </label>

                <label>
                    Urutkan
                    <select v-model="filters.sort">
                        <option value="judul">Judul</option>
                        <option value="qty">Jumlah stok</option>
                        <option value="harga">Harga</option>
                    </select>
                </label>

                <label>
                    Urutan
                    <select v-model="filters.direction">
                        <option value="asc">Terkecil ↑</option>
                        <option value="desc">Terbesar ↓</option>
                    </select>
                </label>
            </div>

        </section>

        <section class="panel table-panel">
            <div class="section-title">
                <h2>
                    Daftar persediaan
                    <span class="count">
                        {{ filteredStocks.length }}
                    </span>
                </h2>

            </div>

            <div class="table-scroll">
                <table>
                    <caption class="sr-only">
                        Daftar stok bahan ajar sesuai filter
                    </caption>

                    <thead>
                        <tr>
                            <th>Mata kuliah</th>
                            <th>Kategori / UT-Daerah</th>
                            <th>Rak</th>
                            <th>Harga</th>
                            <th>Stok / Safety</th>
                            <th>Status</th>
                            <th>Catatan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr
                            v-for="item in filteredStocks"
                            :key="item.kode + item.upbjj"
                        >
                            <td>
                                <span
                                    class="course-code"
                                    v-text="item.kode"
                                ></span>

                                <strong class="course-title">
                                    {{ item.judul }}
                                </strong>
                            </td>

                            <td>
                                {{ item.kategori }}
                                <small>{{ item.upbjj }}</small>
                            </td>

                            <td>
                                <span class="rack">
                                    {{ item.lokasiRak }}
                                </span>
                            </td>

                            <td class="nowrap">
                                {{ rupiah(item.harga) }}
                            </td>

                            <td>
                                <strong>{{ item.qty }}</strong>
                                <span class="muted">
                                    / {{ item.safety }}
                                </span>
                            </td>

                            <td>
                                <span
                                    v-if="item.qty === 0"
                                    class="badge danger"
                                >
                                    Kosong
                                </span>

                                <span
                                    v-else-if="item.qty < item.safety"
                                    class="badge warning-badge"
                                >
                                    Menipis
                                </span>

                                <span
                                    v-else
                                    class="badge success"
                                >
                                    Aman
                                </span>
                            </td>

                            <td
                                class="note"
                                v-html="safeNote(item.catatanHTML)"
                            ></td>

                            <td>
                                <button
                                    class="edit-button"
                                    :aria-label="'Edit ' + item.judul + ' ' + item.upbjj"
                                    @click="edit(item)"
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>

                        <tr v-if="!filteredStocks.length">
                            <td colspan="8" class="empty-state">
                                Tidak ada bahan ajar yang sesuai filter.
                                Coba ubah atau reset filter.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section
            v-if="showForm"
            id="stock-form"
            class="panel form-panel"
        >
            <div class="section-title">
                <div>
                    <p class="eyebrow">FORMULIR PERSEDIAAN</p>
                    <h2>
                        {{ editingKey ? 'Edit bahan ajar' : 'Tambah bahan ajar' }}
                    </h2>
                </div>

                <button class="text-button" @click="cancel">
                    Tutup ✕
                </button>
            </div>

            <form @submit.prevent="submit" novalidate>
                <div class="form-grid">
                    <label for="kode">
                        Kode mata kuliah

                        <input
                            id="kode"
                            v-model="form.kode"
                            type="text"
                            :aria-invalid="!!errors.kode"
                            aria-describedby="err-kode"
                        >

                        <span
                            v-if="errors.kode"
                            id="err-kode"
                            class="field-error"
                        >
                            {{ errors.kode }}
                        </span>
                    </label>

                    <label for="judul">
                        Nama mata kuliah

                        <input
                            id="judul"
                            v-model="form.judul"
                            type="text"
                            :aria-invalid="!!errors.judul"
                            aria-describedby="err-judul"
                        >

                        <span
                            v-if="errors.judul"
                            id="err-judul"
                            class="field-error"
                        >
                            {{ errors.judul }}
                        </span>
                    </label>

                    <label for="kategori">
                        Kategori

                        <select
                            id="kategori"
                            v-model="form.kategori"
                            :aria-invalid="!!errors.kategori"
                            aria-describedby="err-kategori"
                        >
                            <option value="">Pilih kategori</option>
                            <option
                                v-for="option in kategoriList"
                                :key="option"
                            >
                                {{ option }}
                            </option>
                        </select>

                        <span
                            v-if="errors.kategori"
                            id="err-kategori"
                            class="field-error"
                        >
                            {{ errors.kategori }}
                        </span>
                    </label>

                    <label for="upbjj">
                        UT-Daerah

                        <select
                            id="upbjj"
                            v-model="form.upbjj"
                            :aria-invalid="!!errors.upbjj"
                            aria-describedby="err-upbjj"
                        >
                            <option value="">Pilih ut-daerah</option>
                            <option
                                v-for="option in upbjjList"
                                :key="option"
                            >
                                {{ option }}
                            </option>
                        </select>

                        <span
                            v-if="errors.upbjj"
                            id="err-upbjj"
                            class="field-error"
                        >
                            {{ errors.upbjj }}
                        </span>
                    </label>

                    <label for="lokasiRak">
                        Lokasi rak

                        <input
                            id="lokasiRak"
                            v-model="form.lokasiRak"
                            type="text"
                            :aria-invalid="!!errors.lokasiRak"
                            aria-describedby="err-lokasiRak"
                        >

                        <span
                            v-if="errors.lokasiRak"
                            id="err-lokasiRak"
                            class="field-error"
                        >
                            {{ errors.lokasiRak }}
                        </span>
                    </label>

                    <label for="harga">
                        Harga (Rp)

                        <input
                            id="harga"
                            v-model.number="form.harga"
                            type="number"
                            min="0"
                            step="1"
                            :aria-invalid="!!errors.harga"
                            aria-describedby="err-harga"
                        >

                        <span
                            v-if="errors.harga"
                            id="err-harga"
                            class="field-error"
                        >
                            {{ errors.harga }}
                        </span>
                    </label>

                    <label for="qty">
                        Jumlah stok

                        <input
                            id="qty"
                            v-model.number="form.qty"
                            type="number"
                            min="0"
                            step="1"
                            :aria-invalid="!!errors.qty"
                            aria-describedby="err-qty"
                        >

                        <span
                            v-if="errors.qty"
                            id="err-qty"
                            class="field-error"
                        >
                            {{ errors.qty }}
                        </span>
                    </label>

                    <label for="safety">
                        Safety stock

                        <input
                            id="safety"
                            v-model.number="form.safety"
                            type="number"
                            min="0"
                            step="1"
                            :aria-invalid="!!errors.safety"
                            aria-describedby="err-safety"
                        >

                        <span
                            v-if="errors.safety"
                            id="err-safety"
                            class="field-error"
                        >
                            {{ errors.safety }}
                        </span>
                    </label>

                    <label class="full" for="catatanHTML">
                        Catatan (opsional)

                        <textarea
                            id="catatanHTML"
                            v-model="form.catatanHTML"
                            maxlength="500"
                            rows="3"
                            :aria-invalid="!!errors.catatanHTML"
                            aria-describedby="err-catatanHTML"
                        ></textarea>

                        <span
                            v-if="errors.catatanHTML"
                            id="err-catatanHTML"
                            class="field-error"
                        >
                            {{ errors.catatanHTML }}
                        </span>
                    </label>
                </div>

                <p
                    v-show="form.qty !== '' && form.safety !== ''"
                    class="helper"
                >
                    Pratinjau status:
                    <strong>{{ previewStatus }}</strong>
                </p>

                <p class="helper">
                    Catatan mendukung tag em, strong, u, i, b tanpa atribut.
                    Tag lain ditampilkan sebagai teks.
                </p>

                <div class="form-actions">
                    <button
                        type="button"
                        class="button secondary"
                        @click="cancel"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        class="button primary"
                    >
                        Simpan bahan ajar
                    </button>
                </div>
            </form>
        </section>
    </div>
</template>

<script>
import { initialData } from '../data/dataBahanAjar.js';

import {
    rupiah,
    stockStatus,
    filterStocks,
    validateStock,
    safeNote,
    loadData,
    saveData
} from '../utils/domain.js';

const emptyForm = () => ({
    kode: '',
    judul: '',
    kategori: '',
    upbjj: '',
    lokasiRak: '',
    harga: '',
    qty: '',
    safety: '',
    catatanHTML: ''
});

export default {
    data() {
        return {
            stok: loadData('stok', initialData.stok),
            upbjjList: initialData.upbjjList,
            kategoriList: initialData.kategoriList,

            filters: {
                region: '',
                category: '',
                condition: '',
                sort: 'judul',
                direction: 'asc'
            },

            form: emptyForm(),
            errors: {},
            editingKey: '',
            showForm: false,
            notice: '',
            storageWarning: false
        };
    },

    computed: {
        regionStocks() {
            return this.stok.filter(
                item => !this.filters.region ||
                    item.upbjj === this.filters.region
            );
        },

        categoryOptions() {
            return this.kategoriList.filter(
                category => this.regionStocks.some(
                    item => item.kategori === category
                )
            );
        },

        filteredStocks() {
            return filterStocks(
                this.regionStocks,
                this.filters.category,
                this.filters.condition,
                this.filters.sort,
                this.filters.direction
            );
        },

        stats() {
            return {
                total: this.stok.reduce(
                    (sum, item) => sum + item.qty,
                    0
                ),

                low: this.stok.filter(
                    item => item.qty > 0 && item.qty < item.safety
                ).length,

                empty: this.stok.filter(
                    item => item.qty === 0
                ).length
            };
        },

        previewStatus() {
            return stockStatus({
                qty: Number(this.form.qty),
                safety: Number(this.form.safety)
            });
        }
    },

    watch: {
        'filters.region'() {
            this.filters.category = '';
        },

        stok: {
            deep: true,

            handler(value) {
                this.storageWarning = !saveData('stok', value);
            }
        }
    },

    methods: {
        rupiah,
        stockStatus,
        safeNote,

        resetFilters() {
            this.filters = {
                region: '',
                category: '',
                condition: '',
                sort: 'judul',
                direction: 'asc'
            };
        },

        openAdd() {
            this.form = emptyForm();
            this.editingKey = '';
            this.errors = {};
            this.showForm = true;
            this.notice = '';

            this.$nextTick(() => {
                document.querySelector('#kode')?.focus();
            });
        },

        edit(item) {
            this.form = {
                ...item
            };

            this.editingKey = `${item.kode}|${item.upbjj}`;
            this.errors = {};
            this.showForm = true;
            this.notice = '';

            this.$nextTick(() => {
                document.querySelector('#stock-form')?.scrollIntoView({
                    behavior: 'smooth'
                });

                document.querySelector('#kode')?.focus();
            });
        },

        cancel() {
            this.showForm = false;
            this.form = emptyForm();
            this.errors = {};
            this.editingKey = '';
        },

        submit() {
            const item = {
                ...this.form,
                kode: this.form.kode.trim().toUpperCase(),
                judul: this.form.judul.trim(),
                lokasiRak: this.form.lokasiRak.trim()
            };

            this.errors = validateStock(
                item,
                this.stok,
                this.editingKey,
                this.upbjjList,
                this.kategoriList
            );

            if (Object.keys(this.errors).length) {
                this.$nextTick(() => {
                    document.querySelector('[aria-invalid="true"]')?.focus();
                });

                return;
            }

            for (const key of ['harga', 'qty', 'safety']) {
                item[key] = Number(item[key]);
            }

            if (this.editingKey) {
                const i = this.stok.findIndex(
                    s => `${s.kode}|${s.upbjj}` === this.editingKey
                );

                this.stok.splice(i, 1, item);
            } else {
                this.stok.push(item);
            }

            this.notice = this.editingKey
                ? 'Perubahan bahan ajar berhasil disimpan.'
                : 'Bahan ajar baru berhasil ditambahkan.';

            this.cancel();
        }
    }
};
</script>