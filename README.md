# NoteletWeb

## ภาพรวมโปรเจกต์

**NoteletWeb** คือ Frontend Server สำหรับระบบเช่าและยืมอุปกรณ์ (NoteLet Platform) พัฒนาด้วย **TypeScript, Express.js และ Vanilla JavaScript** โดยทำหน้าที่:

- Proxy คำขอ API ไปยัง Go Backend ที่ Railway
- ให้บริการไฟล์ HTML/CSS/JS แบบ Static
- รองรับ WebSocket สำหรับระบบแชทแบบเรียลไทม์
- รองรับทั้งโหมด **เช่า** (มีค่าใช้จ่าย) และ **ยืม** (ฟรี จากหน่วยงาน)

---

## โครงสร้างโปรเจกต์

```
NoteletWeb/
├── package.json                        # ตั้งค่าโปรเจกต์ Node.js และ dependencies
├── tsconfig.json                       # TypeScript config ฝั่ง Server
├── tsconfig.client.json                # TypeScript config ฝั่ง Client (Browser)
├── tsconfig.test.json                  # TypeScript config สำหรับรัน Jest Tests
├── vercel.json                         # ตั้งค่า Deploy บน Vercel
├── README.md                           # ไฟล์นี้
│
├── src/                                # Source Code ฝั่ง Server (TypeScript)
│   ├── index.ts                        # Entry point ของ Express Server
│   ├── routes.ts                       # ตั้งค่า Routes ทั้งหมด
│   ├── controllers/
│   │   └── index.ts                    # Controller Template (boilerplate)
│   ├── routes/
│   │   └── index.ts                    # ฟังก์ชัน setRoutes() กำหนด Page Routes
│   ├── utils/
│   │   └── index.ts                    # Utility functions ทั่วไป
│   └── client/                         # TypeScript ฝั่ง Client (Compile → public/js/)
│       ├── globals.d.ts                # Global Type Definitions (Window, User, CartItem ฯลฯ)
│       ├── tsconfig.json               # tsconfig เฉพาะของ client
│       ├── js/
│       │   └── auth.ts                 # Auth & API Client (Compile → public/js/auth.js)
│       └── features/
│           └── management/
│               └── device-edit-delete.ts  # Form Handler สำหรับแก้ไข/ลบอุปกรณ์
│
├── public/                             # Static Files ที่ส่งให้ Browser
│   ├── index.html                      # หน้าหลัก (Homepage / Landing Page)
│   ├── css/
│   │   └── styles.css                  # Master Stylesheet ทั้งเว็บ
│   ├── js/
│   │   ├── auth.js                     # Auth & API Client (Compiled จาก auth.ts)
│   │   ├── config.js                   # ค่า Config ทั่วไป (API URL, Supabase)
│   │   ├── image-upload.js             # จัดการอัปโหลดภาพอุปกรณ์
│   │   ├── chat-notifications.js       # Widget แจ้งเตือนแชทแบบ Realtime
│   │   └── navpopups.js                # Cart, Favorites, Checkout Popup
│   ├── video/                          # ไฟล์วิดีโอ (Background / Demo)
│   └── features/
│       ├── auth/
│       │   ├── login.html              # หน้า Login
│       │   ├── register.html           # หน้าสมัครสมาชิก
│       │   └── devices-auth.html       # หน้า Authenticate ก่อนเข้าดูอุปกรณ์
│       ├── devices/
│       │   ├── devices.html            # หน้าแสดงอุปกรณ์ทั้งหมด
│       │   ├── manage.html             # หน้าจัดการอุปกรณ์ (Admin)
│       │   ├── renttype.html           # เลือกประเภทอุปกรณ์ (เช่า)
│       │   ├── borrowtype.html         # เลือกประเภทอุปกรณ์ (ยืม)
│       │   ├── renttypedevice.html     # ผลลัพธ์อุปกรณ์เช่าตามประเภท
│       │   ├── borrowtypedevice.html   # ผลลัพธ์อุปกรณ์ยืมตามประเภท
│       │   ├── rentdevice.html         # รายละเอียดอุปกรณ์เช่า (จอง)
│       │   ├── borrowdevice.html       # รายละเอียดอุปกรณ์ยืม (ขอยืม)
│       │   ├── rentout.html            # จัดการอุปกรณ์ที่ปล่อยเช่า (เจ้าของ)
│       │   └── devicehistory.html      # ประวัติการเช่า/ยืม
│       ├── chat/
│       │   └── rental-chat.html        # หน้าแชทแบบ Realtime
│       └── management/
│           ├── giveout.html            # จัดการอุปกรณ์ที่หน่วยงานปล่อยยืม
│           └── device-edit-delete.js   # Handler แก้ไข/ลบอุปกรณ์ (for Management)
│
└── test/
    ├── tsconfig.json                   # tsconfig เฉพาะรัน Test
    └── index.test.ts                   # Unit Tests (Jest)
```

---

## อธิบายทุกไฟล์

### ไฟล์ Config (Root)

| ไฟล์ | คำอธิบาย |
|------|----------|
| `package.json` | กำหนด dependencies (Express 4.22.1, http-proxy-middleware 3.0.5), scripts (`npm start`, `npm run build`, `npm test`) และ entry point (`dist/index.js`) |
| `tsconfig.json` | TypeScript config สำหรับ Server — Target ES2020, Module CommonJS, Output `./dist`, ไม่รวม `src/client` |
| `tsconfig.client.json` | TypeScript config สำหรับ Browser — Target ES2020, Module None (Browser), Output `./public`, รวม DOM types |
| `tsconfig.test.json` | ขยายจาก tsconfig.json เพิ่ม jest และ node types สำหรับรัน Test |
| `vercel.json` | Vercel Deployment config — Build `src/index.ts` ด้วย @vercel/node, Route `/uploads/*` ไป Railway, Route `/*` ผ่าน Express |

---

### src/ — Server Source Code

#### `src/index.ts` — Entry Point
- สร้าง Express Server รันบน **Port 3030**
- ตั้ง API Target: `https://noteletwebapi-production.up.railway.app`
- ตั้ง **Proxy Middleware** สำหรับ `/api/**` และ `/uploads/**`
- เปิด **WebSocket Proxy** (`ws: true`) สำหรับ `/api/chat/ws` (Realtime Chat)
- จัดการ Error เมื่อ Backend ไม่ตอบสนอง (Response 502)
- Export app สำหรับทั้ง Standalone และ Serverless

#### `src/routes.ts`
- Re-export หรือ entry สำหรับ routes (เชื่อมกับ `src/routes/index.ts`)

#### `src/routes/index.ts` — Route Definitions
- เสิร์ฟไฟล์ Static จากโฟลเดอร์ `/public`
- กำหนด Page Routes ทั้งหมด:
  - `GET /` → `index.html` (Homepage)
  - `GET /login` → `login.html`
  - `GET /register` → `register.html`
  - `GET /rentout` → หน้าจัดการอุปกรณ์เช่า
  - `GET /giveout` → หน้าจัดการอุปกรณ์ยืม
  - `GET /renttype` → เลือกประเภทเช่า
  - `GET /borrowtype` → เลือกประเภทยืม
  - `GET /renttypedevice`, `/borrowtypedevice` → ผลลัพธ์ตามประเภท
  - `GET /searchdevice` → ค้นหาอุปกรณ์
  - `GET /borrowdevice` → รายละเอียดอุปกรณ์ยืม
  - `GET /devicehistory` → ประวัติ
- Health Check: `GET /api/health` → `{ status: "ok" }`

#### `src/controllers/index.ts` — Controller Template
- Class `IndexController` พร้อม method `handleGetRequest()` และ `handlePostRequest()`
- เป็น Boilerplate ยังไม่ได้ใช้งานจริง

#### `src/utils/index.ts` — Utility Functions
- `formatDate(date)` → แปลง Date เป็น ISO string (YYYY-MM-DD)
- `generateRandomId()` → สร้าง Random Alphanumeric ID
- `isEmpty(obj)` → ตรวจสอบว่า Object ว่างหรือไม่

---

### src/client/ — Client-side TypeScript

#### `src/client/globals.d.ts` — Global Type Definitions
- ขยาย `Window` interface:
  - `_cnClick()` — Mark chat notifications as read
  - `uploadDeviceImages()` — อัปโหลดภาพอุปกรณ์ (คืน `Promise<string[]>`)
  - `NoteLetAuth` — Auth namespace
- กำหนด Data Models:
  - `User` — ข้อมูลผู้ใช้ (id, email, name, phone, admin, profile image)
  - `CartItem` — ไอเทมในตะกร้า (name, price, dates, pickup/return times, source)
  - `FavItem` — รายการโปรด
  - `ChatNotification` — การแจ้งเตือนแชท
  - `ApiOptions`, `ApiResponse<T>` — Types สำหรับ API Request/Response

#### `src/client/js/auth.ts` — Auth & API Client *(Compile → `public/js/auth.js`)*
- จัดการ Auth Token ใน `localStorage`
  - `getAuthToken()`, `getRefreshToken()`
  - `saveAuthData()`, `clearAuthData()`
  - `isAuthenticated()` — ตรวจสอบ JWT expiry
- `apiRequest<T>(endpoint, options)` — API Wrapper:
  - ใส่ Bearer Token อัตโนมัติ
  - Auto-refresh เมื่อได้ 401 response
- `refreshAccessToken()` — POST `/api/auth/refresh`
- `logout()` — ล้าง Token และ Redirect ไป Login

#### `src/client/features/management/device-edit-delete.ts` — Device Management
- *(Compile → `public/features/management/device-edit-delete.js`)*
- **Edit Modal**: เปิด Modal พร้อมข้อมูลอุปกรณ์, แสดงภาพปัจจุบัน, รองรับอัปโหลดภาพใหม่
- **Delete Handler**: ฟัง click บน `.btn-delete`, เรียก `PUT /api/devices/{deviceId}`, Reload รายการ

---

### public/js/ — Client JavaScript (Compiled & Static)

#### `public/js/auth.js` *(Compiled จาก auth.ts)*
- ดู `src/client/js/auth.ts` ด้านบน

#### `public/js/config.js` — Global Config
- `window.NOTELET_API_URL = ''` (ใช้ Express Proxy)
- Supabase URL และ Anon Key สำหรับ Google OAuth

#### `public/js/image-upload.js` — Image Upload Handler
- ฟัง Event บน `#imageUpload` (เพิ่มอุปกรณ์) และ `#editImages` (แก้ไขอุปกรณ์)
- Validate ไฟล์ (ต้องเป็น image/*, ≤ 10MB, สูงสุด 5 ภาพ)
- แสดง Preview พร้อมปุ่มลบ
- `uploadImages(files)` — ส่ง FormData ไปยัง `/api/upload/images`, คืน URL array

#### `public/js/chat-notifications.js` — Chat Notification Widget
- Widget ลอยมุมขวาล่าง (รูปกระดิ่ง)
- Polling `/api/chat/notifications/unread` ทุก 30 วินาที
- แสดง Badge จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
- Dropdown รายการ Notifications พร้อมคลิกเพื่อเปิดห้องแชท
- รับ Custom Event `chatNewNotif` สำหรับ Update ทันที

#### `public/js/navpopups.js` — Cart, Favorites & Checkout Popup
- จัดการ `localStorage`:
  - `notelet_cart_v1` — ตะกร้า
  - `notelet_favs_v1` — รายการโปรด
  - `notelet_history_v1` — ประวัติการซื้อ/เช่า
- สร้าง UI แบบ Dynamic:
  - `#miniCartPopup` — Dropdown ตะกร้า
  - `#miniFavPopup` — Dropdown รายการโปรด
  - `#confirmDialog` — Modal ยืนยัน Checkout
- `addCartToHistory()` — ย้ายตะกร้าไปประวัติเมื่อ Checkout

---

### public/css/

#### `public/css/styles.css` — Master Stylesheet
- **CSS Variables**: `--blue: #043873` (Navy), `--accent: #FFE492` (Gold), `--primary: #4F9CF9` (Sky Blue)
- Global: Font Inter, Box-sizing
- Header: Sticky Navy Bar
- Components: User Profile Dropdown, Device Cards, Mini-Cart Popup, Cart Badges
- Animation: `fadeInPop` สำหรับ UI transitions

---

### public/ — HTML Pages

#### `public/index.html` — Homepage
- Hero section พร้อม Video background
- Search box (เลือก เช่า/ยืม, ค้นหา)
- Grid แสดงอุปกรณ์แนะนำ 4 คอลัมน์
- Tabs "How it works" แบบ Step-by-step

---

### public/features/auth/

| ไฟล์ | คำอธิบาย |
|------|----------|
| `login.html` | หน้า Login — Email + Password, Google OAuth via Supabase, Glass-morphism Card |
| `register.html` | หน้าสมัครสมาชิก — Email, Password, ชื่อ-นามสกุล, เบอร์โทร, รูปโปรไฟล์ |
| `devices-auth.html` | หน้า Auth Gate — ตรวจสอบว่า Login แล้วก่อนเข้าดูอุปกรณ์ |

---

### public/features/devices/

| ไฟล์ | คำอธิบาย |
|------|----------|
| `devices.html` | แสดงอุปกรณ์ทั้งหมด — Filter บาร์, ค้นหา, เรียงลำดับ, Grid card layout |
| `manage.html` | Admin จัดการอุปกรณ์ — Tab: My Devices / Requests / Active Rentals / History, Status badges |
| `renttype.html` | เลือกประเภทอุปกรณ์เช่า — 3 หมวด (Notebook, Tablet, Others) |
| `borrowtype.html` | เลือกประเภทอุปกรณ์ยืม — 3 หมวด (Notebook, Tablet, Others) |
| `renttypedevice.html` | ผลลัพธ์อุปกรณ์เช่าตามประเภท (รับ query param `type`) |
| `borrowtypedevice.html` | ผลลัพธ์อุปกรณ์ยืมตามประเภท (รับ query param `type`) |
| `rentdevice.html` | รายละเอียดอุปกรณ์เช่า — Gallery, ชื่อ, ราคา, Date Picker, คำนวณราคารวม |
| `borrowdevice.html` | รายละเอียดอุปกรณ์ยืม — ฟรี, เลือกระยะเวลา 3/7/14 วัน, "Request to Borrow" |
| `rentout.html` | เจ้าของอุปกรณ์จัดการ — Tab: My Devices / Requests / Active / History, Confirm/Reject/Returned |
| `devicehistory.html` | ประวัติการเช่า/ยืม — Timeline view, แหล่งที่มา, วันที่, สถานะ |

---

### public/features/chat/

#### `rental-chat.html` — Realtime Chat
- UI แชทแบบ Vertical (max-width 860px)
- แสดง Avatar ผู้ใช้, Timestamp, วันที่คั่นระหว่างบทสนทนา
- Connection Status Indicator (เขียว = เชื่อมต่อแล้ว, ส้ม = กำลังเชื่อมต่อ)
- รองรับ WebSocket ผ่าน proxy ที่ `/api/chat/ws`

---

### public/features/management/

| ไฟล์ | คำอธิบาย |
|------|----------|
| `giveout.html` | หน้าสำหรับหน่วยงาน (Department) จัดการอุปกรณ์ที่ปล่อยยืม — Grid card, สถานะ Requested/Returned |
| `device-edit-delete.js` | Handler สำหรับ Edit/Delete อุปกรณ์ในหน้า Management (Compiled จาก device-edit-delete.ts) |

---

### test/

| ไฟล์ | คำอธิบาย |
|------|----------|
| `tsconfig.json` | TypeScript config เฉพาะสำหรับรัน Jest, เพิ่ม `@types/jest` |
| `index.test.ts` | Unit Tests หลักของโปรเจกต์ (รันด้วย `npm test`) |

---

## การติดตั้งและรัน

### ติดตั้ง Dependencies

```
npm install
```

### รัน Development Server

```
npm start
```

เปิดที่ `http://localhost:3030`

### Build TypeScript

```
npm run build
```

Compile ทั้ง Server (`src/`) และ Client (`src/client/`) ไปยัง `dist/` และ `public/`

### รัน Tests

```
npm test
```

---

## เทคโนโลยีที่ใช้

| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|-----------|---------|--------|
| Node.js | - | Runtime |
| TypeScript | 5.9.3 | ภาษาหลัก (Server + Client) |
| Express.js | 4.22.1 | Web Framework |
| http-proxy-middleware | 3.0.5 | Proxy ไปยัง Go Backend |
| Jest | 29.7 | Unit Testing |
| Supabase | CDN | Google OAuth |

---

## Deployment

### Vercel
- สร้าง `vercel.json` กำหนดให้ Build จาก `src/index.ts`
- Route `/uploads/*` → Railway Backend
- Route `/*` → Express Handler

### Railway (Go Backend)
- API Target: `https://noteletwebapi-production.up.railway.app`
- รับคำขอ `/api/**` ทั้งหมดผ่าน Proxy

---

