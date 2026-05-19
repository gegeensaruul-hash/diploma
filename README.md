# ✅ Todo App — Fullstack Project

Indra Cyber Institute — Fullstack Final Project 2026
**Stack:** React (Vite) + Node.js (Express) + MySQL + Sequelize + Docker

---

## 🏗 Архитектур

```
todo_app/
├── client/              ← React SPA (Vite + Tailwind + Redux Toolkit)
│   ├── src/
│   │   ├── components/  ← Layout, Sidebar, Navbar, TodoModal
│   │   ├── pages/       ← Login, Dashboard, Todos, Trash, Users
│   │   └── redux/       ← Store, slices, API layers
│   └── Dockerfile
├── server/              ← Node.js REST API (Express + Sequelize)
│   ├── controllers/     ← auth, todo, category, user
│   ├── middleware/      ← auth, validation, rateLimit, error
│   ├── models/          ← User, Todo, Category
│   ├── routes/          ← бүх endpoint
│   └── Dockerfile
└── docker-compose.yml
```

### Frontend Architecture
- **Component-based** — React 18 + Vite
- **State management** — Redux Toolkit + RTK Query (caching, invalidation)
- **Routing** — React Router v6 (PrivateRoute, AdminRoute)
- **Forms** — React Hook Form + validation

### Backend Architecture
- **MVC pattern** — controllers / routes / models тусдаа
- **Middleware chain** — rateLimit → validation → auth → controller
- **RESTful API** — стандарт HTTP методууд (GET, POST, PUT, PATCH, DELETE)

---

## 🗄 Database Schema (3NF)

```
Users       — id, name, email, password(hashed), role, isActive
Todos       — id, title, description, status, priority, dueDate, isTrashed, userId, categoryId
Categories  — id, name, color, userId
```

**Харилцаа:**
- User → Todos (one-to-many)
- User → Categories (one-to-many)
- Category → Todos (one-to-many, optional)

---

## 🔐 Security

| Онцлог | Хэрэгжилт |
|--------|-----------|
| Password hashing | bcryptjs (salt 10) |
| Authentication | JWT (httpOnly cookie, 7 хоног) |
| Protected routes | Frontend + Backend middleware |
| Input validation | Custom middleware (XSS sanitize) |
| SQL Injection | Sequelize ORM parameterized queries |
| Rate limiting | Auth: 10/мин · API: 100/мин |
| Environment vars | .env файл |

---

## ✅ Функциональ шаардлагууд

- [x] Login / Register / Logout
- [x] Role-based access (Admin / User)
- [x] Todo CRUD (нэмэх, засах, устгах, сэргээх)
- [x] Статус солих (Хийх → Хийж байна → Дууссан)
- [x] Категори удирдлага
- [x] Хайх, filter (status, priority, category)
- [x] Pagination
- [x] Хогийн сав (Trash / Restore)
- [x] Dashboard статистик
- [x] Admin: хэрэглэгч харах, идэвхжүүлэх/хаах

---

## 🚀 Хэрхэн ажиллуулах

### 1. Docker (санал болгосон)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 2. Локал хөгжүүлэлт

**MySQL database үүсгэх:**
```sql
CREATE DATABASE todo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Backend:**
```bash
cd server
npm install
cp .env.example .env
# .env файлд MySQL мэдээллээ бөглөнө
npm start
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

---

## 📡 API Endpoints

### Auth `/api/auth`
| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| POST | /register | Бүртгэл |
| POST | /login | Нэвтрэх |
| POST | /logout | Гарах |
| GET | /me | Өөрийн мэдээлэл |

### Todos `/api/todos`
| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | / | Жагсаалт (search, status, priority, page) |
| GET | /stats | Тоо статистик |
| GET | /trash | Устгасан жагсаалт |
| GET | /:id | Нэг todo |
| POST | / | Үүсгэх |
| PUT | /:id | Засах |
| PATCH | /:id/status | Статус солих |
| PATCH | /:id/trash | Trash руу |
| PATCH | /:id/restore | Сэргээх |
| DELETE | /:id | Бүрмөсөн устгах |

### Categories `/api/categories`
| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | / | Жагсаалт |
| POST | / | Үүсгэх |
| PUT | /:id | Засах |
| DELETE | /:id | Устгах |

### Users `/api/users` (Admin)
| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | / | Бүх хэрэглэгч |
| PUT | /profile | Профайл засах |
| PUT | /change-password | Нууц үг солих |
| PUT | /:id/toggle | Идэвхжүүлэх/хаах |
| DELETE | /:id | Устгах |

---

## 📦 Жишээ хүсэлт (Postman)

**Бүртгэл:**
```json
POST /api/auth/register
{ "name": "Болд", "email": "bold@example.com", "password": "123456" }
```

**Todo үүсгэх:**
```json
POST /api/todos
{
  "title": "Шинэ даалгавар",
  "description": "Тайлбар...",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-05-01"
}
```

**Хайх + filter:**
```
GET /api/todos?search=шинэ&status=todo&priority=high&page=1&limit=10
```

---

## 💡 Юу сурсан бэ?

1. **Sequelize ORM** — MySQL-тэй ажиллах, association, hook ашиглах
2. **Redux Toolkit + RTK Query** — API cache, auto invalidation
3. **JWT + httpOnly Cookie** — аюулгүй authentication
4. **Docker Compose** — multi-service deploy, healthcheck
5. **Rate limiting + Validation** — production-ready хамгаалалт

---

*Indra Cyber Institute — Fullstack Final Project 2026*

---

## 💬 Group Chat (шинэ)

Dashboard дээр бүрэн функциональ real-time group chat нэмэгдлээ.

### Функцууд
| Функц | Тайлбар |
|-------|---------|
| Room үүсгэх | Нэр, тайлбартай chat room нэмэх |
| Room-д нэгдэх | Бусдын room-д нэгдэх |
| Room-оос гарах | Дурын үед гарах боломж |
| Room устгах | Үүсгэгч эсвэл admin устгах |
| Real-time мессеж | Socket.io WebSocket ашиглан |
| Мессежийн түүх | MySQL-д хадгалагдана |
| Member жагсаалт | Room-д хэн байгааг харах |

### Шинэ файлууд
```
server/
├── models/chatRoomModel.js
├── models/chatMessageModel.js
├── models/roomMemberModel.js
├── controllers/chatController.js
└── routes/chatRoute.js

client/src/
├── components/GroupChat.jsx
└── redux/slices/api/chatApiSlice.js
```

### Шинэ dependencies
- **server:** `socket.io ^4.7.4`
- **client:** `socket.io-client ^4.7.4`

### Database (автоматаар үүснэ — Sequelize sync)
```
ChatRooms   — id, name, description, createdBy
ChatMessages — id, roomId, userId, message
RoomMembers — id, roomId, userId
```
