# 👹 MonsterPass

Aplikasi web sederhana untuk mengecek kekuatan password kamu — tapi dengan cara yang lebih seru! Setiap kali kamu mengetik password, seekor monster lucu nan menyeramkan akan muncul dan bereaksi secara langsung. Semakin kuat password yang kamu buat, semakin lemah dan menyedihkan monsternya jadi.

## ✨ Fitur

- **Reaksi monster real-time** — monster berubah ekspresi setiap kamu mengetik
- **5 tingkat kekuatan password**, dari yang paling lemah sampai paling kuat:
  - 💀 **Godlike** — belum ada password, monster sangat besar dan menakutkan
  - 😈 **Strong** — password lemah, monster percaya diri dan meremehkan
  - 😤 **Annoyed** — password sedang, monster mulai khawatir
  - 😰 **Scared** — password kuat, monster mengecil dan berkeringat
  - 😵 **Defeated** — password sangat kuat, monster kecil, menangis, dan kalah total
- Pesan-pesan lucu dan sarkastik dari monster di setiap level
- Tombol show/hide untuk menampilkan atau menyembunyikan password
- Desain minimalis dengan palet warna soft (tidak norak)

## 🛠️ Tech Stack

- **HTML5** — struktur halaman
- **Tailwind CSS** — styling (via CDN)
- **Vanilla JavaScript** — logika dan interaktivitas

## 📂 Struktur Project

```
MonsterPass/
├── index.html              # Halaman utama
├── css/
│   └── style.css           # Styling tambahan & animasi
├── js/
│   ├── main.js              # Entry point aplikasi
│   ├── appController.js     # Mengatur alur aplikasi
│   ├── strengthCalculator.js # Logika perhitungan kekuatan password
│   ├── messageManager.js    # Mengatur pesan-pesan monster
│   ├── monsterRenderer.js   # Mengatur tampilan & animasi monster
│   └── toggleManager.js     # Logika tombol show/hide password
└── tests/                   # Unit test
```

## 🚀 Cara Menjalankan di Lokal

1. **Clone repository ini**
   ```bash
   git clone https://github.com/meiditaa02/MonsterPass.git
   ```

2. **Masuk ke folder project**
   ```bash
   cd MonsterPass
   ```

3. **Buka file `index.html`**

   Cara paling gampang, langsung double-click file `index.html` di File Explorer, atau buka lewat browser.

   Atau kalau pakai Kiro/VS Code dengan extension **Live Preview**:
   - Klik kanan pada `index.html`
   - Pilih **"Show Preview"**

4. **Coba ketik password apa saja** dan lihat reaksi monsternya berubah secara langsung! 🎮

## 🧪 Menjalankan Test (opsional)

Jika ingin menjalankan unit test:

```bash
npm install
npm test
```

## 📝 Proses Pengembangan

Project ini dibuat menggunakan **Kiro IDE** dengan fitur **Spec-Driven Development** — dimulai dari penyusunan requirements, design, hingga implementasi tasks secara terstruktur. Dokumentasi spec lengkap dapat dilihat di folder `.kiro/specs/monster-pass/`.

## 👤 Author

Dibuat oleh Meidita sebagai bagian dari Code Camp ReVoU.

---

*Dibuat dengan 💜 dan sedikit rasa takut sama monster.*
