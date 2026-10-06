# Sejarah Bitcoin

Single page tentang sejarah Bitcoin dan kriptografi di baliknya. Gaya visual gelap dan sinematik, minimal, responsif, dan nyaman di mobile.

Buka `index.html` langsung di browser. Tidak perlu build step atau dependensi; satu-satunya sumber eksternal adalah Google Fonts.

## Isi

1. **Prolog cypherpunk (1976–2005)**: Diffie–Hellman, eCash Chaum, ECC, Haber–Stornetta, Hashcash, b-money, RPOW dan Bit Gold.
2. **Lini masa (2008–2140)**: dari whitepaper, blok genesis, Pizza Day, SegWit dan Taproot sampai ETF spot dan halving keempat.
3. **Kriptografi**: SHA-256², proof-of-work, ECDSA/secp256k1 (plot kurva dengan penjumlahan titik), Merkle tree, Schnorr, HASH160/Bech32, HD wallet.
4. **Lab interaktif**: demo avalanche effect dan mini penambang proof-of-work.
5. **Verifikasi blok genesis**: header mentah 80 byte di-hash dua kali di browser, hasilnya dicocokkan dengan `000000000019d6…e26f`.
6. **Grafik halving**: imbalan blok dan total pasokan per epoch.
7. **Referensi**: repositori GitHub open source dan dokumen primer.

Semua hash dihitung dengan implementasi SHA-256 murni JavaScript (FIPS 180-4) di dalam halaman, tanpa mengirim data ke mana pun. Kamu juga bisa memanggil `sha256hex("teks")` dari DevTools.

## Referensi utama

- [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin), [bitcoin/bips](https://github.com/bitcoin/bips), [bitcoin-core/secp256k1](https://github.com/bitcoin-core/secp256k1)
- [bitcoinbook/bitcoinbook](https://github.com/bitcoinbook/bitcoinbook), [lightning/bolts](https://github.com/lightning/bolts), [mempool/mempool](https://github.com/mempool/mempool)
- [Bitcoin whitepaper](https://bitcoin.org/bitcoin.pdf), [Satoshi Nakamoto Institute](https://nakamotoinstitute.org/), [learnmeabitcoin.com](https://learnmeabitcoin.com/), [NIST FIPS 180-4](https://csrc.nist.gov/pubs/fips/180-4/upd1/final), [SEC 2](https://www.secg.org/sec2-v2.pdf)
