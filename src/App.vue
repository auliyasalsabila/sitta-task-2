<template>
  <a class="skip-link" href="#main">Lewati navigasi</a>
  <AppSidebar />
  <main id="main" class="main">
    <RouterView />
    <footer class="footer">
      <span>SITTA · Sistem Informasi Tiras dan Transaksi Bahan Ajar</span>
    </footer>
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router';
import AppSidebar from './components/AppSidebar.vue';
</script>
