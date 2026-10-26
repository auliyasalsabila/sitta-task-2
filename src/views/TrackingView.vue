<template>
    <div class="page-view">
        <header class="page-header compact">
            <div>
                <p class="eyebrow">DISTRIBUSI</p>
                <h1>Tracking Delivery Order</h1>
            </div>
        </header>

        <p v-if="notice" class="notice" role="status">
            ✓ {{ notice }}
        </p>

        <p v-if="storageWarning" class="warning" role="alert">
            Penyimpanan browser tidak tersedia.
            Perubahan hanya bertahan di halaman ini.
        </p>

        <div class="tracking-layout">
            <div>
                <section class="panel">
                    <div class="section-title">
                        <h2>Telusuri pengiriman</h2>
                        <span class="count">
                            {{ Object.keys(tracking).length }}
                        </span>
                    </div>

                    <label class="search-label">
                        Cari nomor DO, NIM, atau nama

                        <input
                            v-model="search"
                            type="search"
                            placeholder="Contoh: DO2025-0001 atau Rina"
                        >
                    </label>

                    <div class="order-list">
                        <button
                            v-for="[kode, order] in filteredOrders"
                            :key="kode"
                            class="order-card"
                            :class="{ selected: selectedDo === kode }"
                            :aria-pressed="selectedDo === kode"
                            @click="selectedDo = kode"
                        >
                            <span>
                                <strong>{{ kode }}</strong>
                                <small>
                                    {{ order.nama }} · {{ order.nim }}
                                </small>
                            </span>

                            <span
                                class="badge"
                                :class="order.status === 'Diproses' ? 'warning-badge' : 'info'"
                            >
                                {{ order.status }}
                            </span>
                        </button>

                        <p
                            v-if="!filteredOrders.length"
                            class="empty-state"
                        >
                            Tidak ada pengiriman yang sesuai pencarian.
                        </p>
                    </div>
                </section>

                <section
                    v-if="selectedOrder"
                    class="panel shipment-detail"
                >
                    <div class="section-title">
                        <div>
                            <p class="eyebrow">DETAIL PENGIRIMAN</p>
                            <h2>{{ selectedDo }}</h2>
                        </div>

                        <span class="badge info">
                            {{ selectedOrder.status }}
                        </span>
                    </div>

                    <dl class="detail-grid">
                        <div>
                            <dt>Penerima</dt>
                            <dd>{{ selectedOrder.nama }}</dd>
                        </div>

                        <div>
                            <dt>NIM</dt>
                            <dd>{{ selectedOrder.nim }}</dd>
                        </div>

                        <div>
                            <dt>Ekspedisi</dt>
                            <dd>{{ selectedOrder.ekspedisi }}</dd>
                        </div>

                        <div>
                            <dt>Tanggal kirim</dt>
                            <dd>{{ selectedOrder.tanggalKirim }}</dd>
                        </div>

                        <div class="full">
                            <dt>Paket bahan ajar</dt>
                            <dd>
                                {{ selectedOrder.paket }} ·
                                {{ packageName(selectedOrder.paket) }}
                            </dd>
                        </div>

                        <div>
                            <dt>Total harga</dt>
                            <dd class="price">
                                {{ rupiah(selectedOrder.total) }}
                            </dd>
                        </div>
                    </dl>

                    <h3 class="timeline-title">
                        Perjalanan paket
                    </h3>

                    <ol class="timeline">
                        <li
                            v-for="(step, index) in selectedOrder.perjalanan"
                            :key="index"
                        >
                            <time>{{ step.waktu }}</time>
                            <p>{{ step.keterangan }}</p>
                        </li>
                    </ol>

                </section>
            </div>

            <section class="panel order-form">
                <div class="section-title">
                    <div>
                        <p class="eyebrow">PENGIRIMAN BARU</p>
                        <h2>Buat delivery order</h2>
                    </div>
                </div>

                <form @submit.prevent="submit" novalidate>
                    <label>
                        Nomor DO

                        <input
                            :value="nextNumber"
                            readonly
                        >

                    </label>

                    <div class="form-grid">
                        <label class="full" for="nim">
                            NIM

                            <input
                                id="nim"
                                v-model="form.nim"
                                type="text"
                                inputmode="numeric"
                                maxlength="9"
                                :aria-invalid="!!errors.nim"
                                aria-describedby="err-nim"
                            >

                            <span
                                v-if="errors.nim"
                                id="err-nim"
                                class="field-error"
                            >
                                {{ errors.nim }}
                            </span>
                        </label>

                        <label class="full" for="nama">
                            Nama penerima

                            <input
                                id="nama"
                                v-model="form.nama"
                                type="text"
                                :aria-invalid="!!errors.nama"
                                aria-describedby="err-nama"
                            >

                            <span
                                v-if="errors.nama"
                                id="err-nama"
                                class="field-error"
                            >
                                {{ errors.nama }}
                            </span>
                        </label>

                        <label class="full" for="pengiriman">
                            Ekspedisi

                            <select
                                id="pengiriman"
                                v-model="form.pengiriman"
                                :aria-invalid="!!errors.pengiriman"
                                aria-describedby="err-pengiriman"
                            >
                                <option value="">
                                    Pilih ekspedisi
                                </option>

                                <option
                                    v-for="option in pengirimanList"
                                    :key="option.kode"
                                    :value="option.kode"
                                >
                                    {{ shippingName(option.kode) }} ·
                                    {{ option.nama }}
                                </option>
                            </select>

                            <span
                                v-if="errors.pengiriman"
                                id="err-pengiriman"
                                class="field-error"
                            >
                                {{ errors.pengiriman }}
                            </span>
                        </label>

                        <label class="full" for="paket">
                            Paket bahan ajar

                            <select
                                id="paket"
                                v-model="form.paket"
                                :aria-invalid="!!errors.paket"
                                aria-describedby="err-paket"
                            >
                                <option value="">
                                    Pilih paket bahan ajar
                                </option>

                                <option
                                    v-for="item in paket"
                                    :key="item.kode"
                                    :value="item.kode"
                                >
                                    {{ item.kode }} · {{ item.nama }}
                                </option>
                            </select>

                            <span
                                v-if="errors.paket"
                                id="err-paket"
                                class="field-error"
                            >
                                {{ errors.paket }}
                            </span>
                        </label>

                        <div
                            v-if="selectedPackage"
                            class="package-detail full"
                        >
                            <strong>
                                Isi {{ selectedPackage.nama }}
                            </strong>

                            <ul>
                                <li
                                    v-for="item in packageContents"
                                    :key="item.kode"
                                >
                                    {{ item.kode }} · {{ item.judul }}
                                </li>
                            </ul>
                        </div>

                        <label class="full" for="tanggalKirim">
                            Tanggal kirim

                            <input
                                id="tanggalKirim"
                                v-model="form.tanggalKirim"
                                type="date"
                                :aria-invalid="!!errors.tanggalKirim"
                                aria-describedby="err-tanggalKirim"
                            >

                            <span
                                v-if="errors.tanggalKirim"
                                id="err-tanggalKirim"
                                class="field-error"
                            >
                                {{ errors.tanggalKirim }}
                            </span>
                        </label>
                    </div>

                    <div class="total-price">
                        <span>Total harga paket</span>
                        <strong>
                            {{ rupiah(totalHarga) }}
                        </strong>
                    </div>

                    <p class="helper">
                        Harga mengikuti paket yang dipilih,
                        belum termasuk ongkir.
                    </p>

                    <button
                        type="submit"
                        class="button primary wide"
                    >
                        Buat delivery order ↗
                    </button>
                </form>
            </section>
        </div>
    </div>
</template>

<script>
import { initialData } from '../data/dataBahanAjar.js';

import {
    rupiah,
    nextDo,
    localDate,
    validateOrder,
    loadData,
    saveData
} from '../utils/domain.js';

const emptyOrder = () => ({
    nim: '',
    nama: '',
    pengiriman: '',
    paket: '',
    tanggalKirim: localDate()
});

export default {
    data() {
        return {
            tracking: loadData('tracking', initialData.tracking),
            stok: loadData('stok', initialData.stok),
            paket: initialData.paket,
            pengirimanList: initialData.pengirimanList,

            form: emptyOrder(),
            totalHarga: 0,
            errors: {},
            search: '',
            selectedDo: 'DO2025-0001',
            notice: '',
            storageWarning: false
        };
    },

    computed: {
        nextNumber() {
            return nextDo(this.tracking);
        },

        selectedPackage() {
            return this.paket.find(
                item => item.kode === this.form.paket
            );
        },

        packageContents() {
            return (this.selectedPackage?.isi || []).map(kode => ({
                kode,
                judul: this.stok.find(
                    item => item.kode === kode
                )?.judul || 'Bahan ajar'
            }));
        },

        filteredOrders() {
            const query = this.search.trim().toLowerCase();

            return Object.entries(this.tracking)
                .filter(([kode, order]) =>
                    `${kode} ${order.nim} ${order.nama}`
                        .toLowerCase()
                        .includes(query)
                )
                .reverse();
        },

        selectedOrder() {
            return this.tracking[this.selectedDo];
        }
    },

    watch: {
        'form.paket'(kode) {
            this.totalHarga = this.paket.find(
                item => item.kode === kode
            )?.harga || 0;
        },

        tracking: {
            deep: true,

            handler(value) {
                this.storageWarning = !saveData('tracking', value);
            }
        }
    },

    methods: {
        rupiah,

        packageName(kode) {
            return this.paket.find(
                item => item.kode === kode
            )?.nama || kode;
        },

        shippingName(kode) {
            return kode === 'EXP'
                ? 'JNE Express'
                : 'JNE Regular';
        },

        submit() {
            const order = {
                ...this.form,
                nim: this.form.nim.trim(),
                nama: this.form.nama.trim()
            };

            this.errors = validateOrder(
                order,
                this.paket,
                this.pengirimanList
            );

            if (Object.keys(this.errors).length) {
                this.$nextTick(() => {
                    document.querySelector('[aria-invalid="true"]')?.focus();
                });

                return;
            }

            // Hitung kembali saat submit agar tidak memakai nomor lama.
            const kode = nextDo(this.tracking);

            this.tracking[kode] = {
                nim: order.nim,
                nama: order.nama,
                status: 'Diproses',
                ekspedisi: this.shippingName(order.pengiriman),
                layanan: order.pengiriman,
                tanggalKirim: order.tanggalKirim,
                paket: order.paket,
                total: this.selectedPackage.harga,

                perjalanan: [
                    {
                        waktu: `${localDate()} ${new Date()
                            .toLocaleTimeString('id-ID', {
                                hour12: false
                            })
                            .replaceAll('.', ':')}`,

                        keterangan:
                            'Delivery order dibuat; menunggu penyerahan ke ekspedisi.'
                    }
                ]
            };

            this.selectedDo = kode;
            this.search = '';
            this.notice = `${kode} berhasil dibuat.`;
            this.form = emptyOrder();
            this.totalHarga = 0;
            this.errors = {};
        }
    }
};
</script>