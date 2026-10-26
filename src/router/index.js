import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: 'Ringkasan' } },
    { path: '/stok', name: 'stock', component: () => import('../views/StockView.vue'), meta: { title: 'Stok bahan ajar' } },
    { path: '/tracking', name: 'tracking', component: () => import('../views/TrackingView.vue'), meta: { title: 'Tracking DO' } },
    { path: '/index.html', redirect: '/' },
    { path: '/stok.html', redirect: '/stok' },
    { path: '/tracking.html', redirect: '/tracking' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.afterEach(to => { document.title = `${to.meta.title || 'SITTA'} · SITTA UT`; });
export default router;
