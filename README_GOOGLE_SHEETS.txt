VERSI GOOGLE SHEETS - WEBSITE KUESIONER PKN STAN

CARA SETUP (GRATIS)
1. Buat Google Spreadsheet baru.
2. Buka Extensions > Apps Script.
3. Hapus isi Code.gs lalu salin isi google-apps-script/Code.gs ke sana.
4. Ganti:
   - ADMIN_KEY = kunci rahasia untuk dashboard
   - SUBMIT_KEY = kunci untuk pengiriman jawaban
   Gunakan dua kunci berbeda, misalnya rangkaian huruf/angka panjang.
5. Klik Save.
6. Deploy > New deployment > pilih Web app.
   Execute as: Me
   Who has access: Anyone
7. Copy Web app URL.
8. Buka config.js di website dan isi:
   scriptUrl = URL Web App
   submitKey = sama dengan SUBMIT_KEY di Code.gs
   adminKey = sama dengan ADMIN_KEY di Code.gs
9. Upload SEMUA file di folder ini ke hosting statis/gratis. Bisa juga dibuka dari GitHub Pages, Netlify, atau layanan static hosting lain.
10. Halaman kuesioner: index.html
    Dashboard: admin.html

CATATAN KEAMANAN
- Data responses tersimpan di Google Spreadsheet Anda.
- Jangan membagikan link spreadsheet edit kepada responden.
- Dashboard memakai adminKey. Jangan memasukkan adminKey ke repository publik jika ingin keamanan lebih baik. Untuk penelitian kecil, ini cukup sebagai lapisan akses sederhana; untuk keamanan tinggi diperlukan autentikasi server-side.
- SUBMIT_KEY mencegah pengiriman sembarang tanpa kunci, tetapi bukan sistem anti-bot penuh.

FITUR
- Google Sheets sebagai database
- Dashboard real-time
- Filter prodi dan angkatan
- Jumlah responden per strata
- Progress target 200-250
- Grafik batang sederhana
- Download CSV yang dapat dibuka di Excel


VERSI PERBAIKAN: URL Web App sudah diisi, angkatan dibatasi 2022-2026, dan koneksi website menggunakan JSONP agar tidak terkena error CORS/Failed to fetch pada browser. Jika Kode.gs berubah, lakukan Deploy > Manage deployments > Edit > New version > Deploy.


PEMBARUAN JENIS KELAMIN
- Website sekarang memiliki field wajib Jenis Kelamin: Perempuan / Laki-laki.
- Apps Script menyimpan field gender ke sheet Responses.
- Spreadsheet tujuan: https://docs.google.com/spreadsheets/d/1MIQiPly79CmfH0mvzCbUdFbTZD5DSciRuymNlypNLvI/edit
- Setelah mengganti Code.gs, lakukan Deploy > Manage deployments > Edit > New version.
- URL Web App tetap menggunakan deployment yang sama.


HADIAH GOPAY / PRIVASI:
- Form meminta Nomor Whatsapp (Keperluan Hadiah).
- Nomor WhatsApp TIDAK masuk ke sheet Responses.
- Nomor WhatsApp disimpan di sheet terpisah bernama GiveawayContacts untuk pengundian/pemberian hadiah.
- Setelah memperbarui Code.gs di Apps Script, deploy sebagai versi baru.


PEMBARUAN WHATSAPP DI RESPONSES
- Kolom whatsapp sekarang berada langsung di sheet Responses.
- Data lama di Responses dipertahankan. Baris lama akan memiliki kolom WhatsApp kosong.
- Setelah mengganti Code.gs, jalankan fungsi hapusKolomNama() SATU KALI untuk menambahkan kolom WhatsApp tanpa menghapus baris respons lama. Fungsi ini hanya menghapus kolom respondent_name bila masih ada, lalu menambahkan whatsapp.
- Jangan jalankan tesSpreadsheet() pada data produksi karena akan menambahkan baris tes.
