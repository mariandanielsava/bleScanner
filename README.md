# BleScannerMdSava

**Acest proiect este o temă de interviu.**

Aplicație React Native pentru scanarea dispozitivelor Bluetooth Low Energy (BLE) din apropiere, conectare la ele și vizualizarea serviciilor GATT și caracteristicilor expuse.

---

## Cum funcționează interfața

Aplicația are **două tab-uri** în bara de jos:

### Tab „Scanner” (Satelit)

- **Buton principal**: „Start scanning” / „Stop scanning” — pornește sau oprește scanarea BLE. Înainte de scanare se verifică permisiunile și starea Bluetooth (pe Android se poate deschide dialogul de activare Bluetooth, pe iOS utilizatorul este redirecționat în Setări).
- **Mesaj de stare**: indică dacă scanarea rulează („Searching for BLE devices…”) sau este oprită.
- **Zona de eroare**: dacă apare o problemă (permisiuni refuzate, Bluetooth dezactivat etc.), mesajul este afișat deasupra listei.
- **Lista de dispozitive**: dispozitivele găsite apar cu nume (sau ID dacă nu au nume), puterea semnalului (RSSI) în dBm și bare de semnal. Fiecare dispozitiv are un buton:
  - **Connect** — când nu ești conectat;
  - **Connecting...** — în timpul conexiunii;
  - **Explore** — când ești deja conectat; apăsarea duce la tab-ul Device.
- **Sortare**: după ce s-a oprit scanarea, poți apăsa „Sort by signal strength” pentru a ordona dispozitivele după puterea semnalului.

### Tab „Device” (Cip)

- Dacă **nu ești conectat** la niciun dispozitiv: se afișează mesajul „No device connected” și instrucțiunea de a te conecta din tab-ul Scanner.
- După **conectare**:
  - Card cu **numele dispozitivului** și RSSI.
  - Buton **Refresh** — reîncarcă serviciile GATT ale dispozitivului.
  - Buton **Disconnect** — deconectează de la dispozitiv.
  - **Lista de servicii**: fiecare serviciu afișează UUID-ul și caracteristicile (UUID + proprietăți: Read, Write, Notify etc.). Dacă nu s-au încărcat servicii, apare un mesaj și poți folosi Refresh.

---

## Tehnici de optimizare

În proiect s-au folosit următoarele tehnici pentru performanță și fluență:

- **Map pentru lista de periferice** — dispozitivele găsite la scanare sunt ținute într-un `Map<id, Peripheral>` (în `BleProvider`), nu într-un array. Actualizarea/adaugarea unui dispozitiv după ID este O(1), se evită căutări și recreearea array-urilor la fiecare discovery. Lista afișată se obține cu `Array.from(map.values())` doar când e nevoie.

- **Throttle la actualizarea state-ului** — la fiecare periferică găsită (evenimente foarte frecvente în BLE) nu se face `setState` imediat. Actualizarea listei din state este **throttle-uită** (ex. la 300 ms): prima periferică declanșează o actualizare imediată, următoarele programează o singură actualizare după interval. Astfel se reduce numărul de re-render-uri și UI-ul rămâne fluid.

- **FlashList** — în tab-ul Scanner lista de dispozitive folosește **@shopify/flash-list** în loc de `FlatList`. FlashList oferă virtualizare eficientă și performanță mai bună pe liste lungi, cu `estimatedItemSize` setat pentru scroll fără sărituri.

- **memo, useCallback, useMemo** — componente precum `DeviceItem`, `ServiceItem`, `ScannerEmptyList` sunt înfășurate în `React.memo` pentru a evita re-render-uri când props nu se schimbă. Handler-ele și listele derivate folosesc `useCallback` / `useMemo` ca să nu se recreeze la fiecare render și să nu declanșeze re-render-uri inutile la copii (ex. `renderItem`, `keyExtractor`).

- **Ref-uri pentru date care nu influențează UI** — starea „internă” (map-ul de periferice, timer-ul de throttle, ID-ul dispozitivului selectat, flag-ul de sortare) este păstrată în `useRef`, nu în state, acolo unde nu e nevoie să redesenăm ecranul la schimbare. Astfel se limitează setState-urile doar la ce e necesar pentru afișare.

---

## Instalare și rulare

### Cerințe

- **Node.js** ≥ 22.11.0
- Mediu configurat pentru [React Native](https://reactnative.dev/docs/set-up-your-environment) (Android Studio / Xcode, emulatoare sau dispozitive reale)

### Pași

1. **Instalare dependențe** (în rădăcina proiectului):

   ```sh
   npm install
   ```

2. **Pornire Metro** (serverul de development):

   ```sh
   npm start
   ```

3. **Build și rulare** (într-un terminal separat):

   - **Android**: `npm run android`
   - **iOS**:
     - Prima dată (sau după ce actualizezi dependențele native): `bundle install` apoi `bundle exec pod install` în folderul `ios/`
     - Apoi: `npm run ios`

Aplicația pornește în emulator sau pe dispozitivul conectat. Pentru reîncărcare forțată: Android — dublu tap **R** sau meniul Dev (Ctrl/Cmd + M); iOS — **R** în simulator.

---

## Testare

Rulezi testele cu:

```sh
npm test
```

---

## Tehnologii

- React Native 0.84, React 19
- **react-native-ble-manager** pentru BLE
- **@react-navigation/bottom-tabs** pentru tab-uri
- **@shopify/flash-list** pentru listă performantă
- TypeScript
