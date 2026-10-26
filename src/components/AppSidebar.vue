<template>
  <aside class="sidebar">
    <div>
      <RouterLink to="/" class="brand"><span class="brand-icon">S</span><span>SITTA<small>BAHAN AJAR UT</small></span></RouterLink>
      <p class="nav-caption">MENU UTAMA</p>
      <nav aria-label="Navigasi utama">
        <RouterLink v-for="item in navigation" :key="item.to" :to="item.to" :class="{ active: $route.path === item.to }" :aria-current="$route.path === item.to ? 'page' : undefined">
          <span aria-hidden="true">{{ item.icon }}</span>{{ item.label }}
        </RouterLink>
      </nav>
    </div>
    <div class="sidebar-foot"><span class="avatar">A</span><div>Administrator</div></div>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router';
const navigation = [
  { to: '/', label: 'Ringkasan', icon: '◫' },
  { to: '/stok', label: 'Stok Bahan Ajar', icon: '▤' },
  { to: '/tracking', label: 'Tracking DO', icon: '↗' },
];
</script>
