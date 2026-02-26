# 🚗 SmartPark

## 📌 Projekt áttekintés

A SmartPark egy szerepkör alapú parkoláskezelő rendszer, amely webes és mobil platformon is elérhető.

A rendszer célja a parkolási jegyek vásárlásának, ellenőrzésének és adminisztrációjának digitalizálása egy egységes, modern rendszerben.

---

# 🏗 Rendszer architektúra

A SmartPark két fő alkalmazásból áll:

## 🌐 Webalkalmazás

A webalkalmazás minden szerepkör számára elérhető:

- 👤 User
- 👮 Officer
- 🛠 Admin

Bejelentkezés után a rendszer szerepkör alapján külön felületet tölt be.

## 📱 Mobilalkalmazás (MAUI)

A mobilalkalmazás az alábbi szerepkörök számára érhető el:

- 👤 User
- 👮 Officer

⚠ Az Admin szerepkör kizárólag weben használható.

---

# 👥 Szerepkörök és funkciók

---

## 👤 User (Felhasználó)

### Elérhető weben és mobilon

A felhasználó képes:

- Saját járművek kezelése (hozzáadás, szerkesztés, törlés)
- Parkolási zónák megtekintése
- Parkolási jegy vásárlása
- Aktív és lejárt jegyek megtekintése
- Saját bírságok megtekintése

### Felület részei

- Dashboard
- Járművek
- Zónák
- Jegyek
- Bírságok

---

## 👮 Officer (Parkolóőr)

### Elérhető weben és mobilon

Az officer képes:

- Rendszám ellenőrzés
- Jegy érvényességének vizsgálata
- Bírság kiállítása
- Jegyek listázása
- Bírságok listázása

### Felület részei

- Dashboard
- Rendszám ellenőrzés
- Bírság létrehozás
- Ellenőrzési lista

---

## 🛠 Admin (Adminisztrátor)

### Elérhető kizárólag weben

Az admin képes:

- Felhasználók kezelése
- Szerepkörök módosítása
- Parkolási zónák létrehozása
- Zónák szerkesztése
- Statisztikák megtekintése
- Monitoring

### Felület részei

- Dashboard
- Felhasználók
- Zónák
- Monitoring

---

# 🔐 Jogosultsági rendszer

A rendszer szerepkör alapú hozzáférés-vezérlést alkalmaz.

|   Funkció  |    User    |   Officer  |   Admin   |
|------------|------------|------------|-----------|
| Jegyvásárlás | ✔ | ✖ | ✖ |
| Rendszám ellenőrzés | ✖ | ✔ | ✔ |
| Bírság kiállítás | ✖ | ✔ | ✔ |
| Felhasználó kezelés | ✖ | ✖ | ✔ |
| Zóna kezelés | ✖ | ✖ | ✔ |

---

# 🧱 Fő rendszer elemek

A rendszer fő entitásai:

- User
- Vehicle
- Zone
- Ticket
- Fine

Kapcsolatok:

- Egy User több járművel rendelkezhet
- Egy User több jeggyel rendelkezhet
- Egy User több bírságot kaphat
- Egy Zone több jegyhez kapcsolódhat

---

# 📱 Mobil alkalmazás sajátosságai

A mobilalkalmazás célja a gyors és terepen történő használat.

### User mobil fókusz:
- Gyors jegyvásárlás
- Aktív jegyek megtekintése
- Bírság értesítések

### Officer mobil fókusz:
- Gyors rendszám ellenőrzés
- Azonnali státusz kijelzés
- Gyors bírság létrehozás

---

# 🎯 Projekt cél

- Modern, átlátható rendszer kialakítása
- Szerepkör alapú működés
- Web és mobil integráció
- Felhasználóbarát kezelőfelület

---

# 🚀 Fejlesztési irány

A projekt moduláris felépítésű:

- Auth modul
- User modul
- Officer modul
- Admin modul
- Mobil navigációs rendszer

---

# 📄 Dokumentáció

A projekt tartalmazza:

- Funkcionális specifikáció
- ER diagram
- Jogosultsági mátrix
- UI tervek
- Tesztelési terv

---

# 👨‍💻 Készítette

SmartPark fejlesztői csapat
