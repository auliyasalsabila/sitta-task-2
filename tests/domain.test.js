import { test } from 'vitest';
import assert from 'node:assert/strict';
import { initialData } from '../src/data/dataBahanAjar.js';
import { stockStatus, filterStocks, nextDo, validateStock, validateOrder, safeNote } from '../src/utils/domain.js';
test('status memprioritaskan kosong, batas aman, dan menipis', () => {
 assert.equal(stockStatus({qty:0,safety:0}), 'Kosong');
 assert.equal(stockStatus({qty:20,safety:20}), 'Aman');
 assert.equal(stockStatus({qty:7,safety:15}), 'Menipis');
});
test('filter re-order mencakup stok kosong, sort tidak mengubah data asal', () => {
 const stock=[...initialData.stok,{...initialData.stok[0],kode:'ZERO',qty:0}];
 const original=JSON.stringify(stock);
 const rows=filterStocks(stock,'','low','qty','asc');
 assert.equal(rows[0].kode,'ZERO');
 assert.equal(rows.length,3);
 assert.equal(filterStocks(stock,'','empty','harga','desc').length,1);
 assert.equal(JSON.stringify(stock),original);
 assert.deepEqual(filterStocks(initialData.stok,'MK Wajib','','harga','desc').map(x=>x.harga),[65000,60000]);
});
test('nomor DO mengikuti tahun, max sequence, dan mendukung format lampiran', () => {
 assert.equal(nextDo(initialData.tracking,2025),'DO2025-002');
 assert.equal(nextDo(initialData.tracking,2026),'DO2026-001');
 assert.equal(nextDo({'DO2026-003':{},'DO2026-010':{},'DO2025-099':{}},2026),'DO2026-011');
});
test('validasi stok menolak duplikat, kosong, negatif, pecahan dan menerima edit sendiri', () => {
 const item={...initialData.stok[0]};
 const validate=(x,key='')=>validateStock(x,initialData.stok,key,initialData.upbjjList,initialData.kategoriList);
 assert.ok(validate(item).kode);
 assert.deepEqual(validate(item,'EKMA4116|Jakarta'),{});
 for(const qty of ['',-1,2.5,'abc']) assert.ok(validate({...item,qty},'EKMA4116|Jakarta').qty);
 assert.ok(validate({...item,judul:'  '}).judul);
});
test('validasi DO menolak NIM, paket, ekspedisi, dan tanggal tidak valid', () => {
 const order={nim:'123456789',nama:'Rina',pengiriman:'REG',paket:'PAKET-UT-001',tanggalKirim:'2026-10-21'};
 const validate=x=>validateOrder(x,initialData.paket,initialData.pengirimanList);
 assert.deepEqual(validate(order),{});
 assert.ok(validate({...order,nim:'abc'}).nim);
 assert.ok(validate({...order,paket:'X'}).paket);
 assert.ok(validate({...order,pengiriman:''}).pengiriman);
 assert.ok(validate({...order,tanggalKirim:'2026-02-30'}).tanggalKirim);
 assert.ok(validate({...order,tanggalKirim:''}).tanggalKirim);
});
test('catatan mengizinkan format sederhana dan menetralkan markup lain', () => {
 assert.equal(safeNote('<em>Edisi</em>'),'<em>Edisi</em>');
 assert.ok(!safeNote('<img src=x onerror=alert(1)>').includes('<img'));
 assert.ok(!safeNote('<strong onclick="x">teks</strong>').includes('<strong onclick'));
});
