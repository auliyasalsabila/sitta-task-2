<template>
    <div class="page-view">
        <header class="page-header home-heading">
            <div>
                <p class="eyebrow">SELAMAT DATANG DI SITTA</p>
                <h1>Bahan Ajar Terkelola<br>Belajar Tanpa Jeda</h1>
            </div>
        </header>
        <div class="home-grid">
            <RouterLink class="feature-card" to="/stok"><span class="feature-icon">▤</span>
                <h2>Stok bahan ajar</h2>
                <p>Lihat persediaan seluruh UT-Daerah, temukan stok menipis, dan perbarui data bahan ajar.</p><span class="feature-link">Kelola persediaan <span>↗</span></span>
            </RouterLink>
            <RouterLink class="feature-card" to="/tracking"><span class="feature-icon orange">↗</span>
                <h2>Tracking delivery order</h2>
                <p>Buat delivery order baru dan telusuri perjalanan paket bahan ajar menuju penerima.</p><span class="feature-link">Buka tracking DO <span>↗</span></span>
            </RouterLink>
        </div>
    </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>
