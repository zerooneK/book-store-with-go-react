# 📚 Book Store

A full-stack book store web application built as a learning project — a React frontend talking to a Go (Fiber) REST API, backed by PostgreSQL.

> ⚠️ **Status: work in progress.** This is a first Go project and is not yet feature-complete. Core flows (auth, book catalog, cart) are in place, but checkout/orders and several production concerns are not implemented.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Frontend Routes](#frontend-routes)
- [Current Limitations](#current-limitations)
- [Roadmap](#roadmap)

---

## Overview

Book Store is an online bookstore where users can browse a catalog, register/log in, and manage a shopping cart. Admin users can create, edit, and delete books.

- **Browse** the book catalog (no login required)
- **Register / Log in** with JWT-based authentication
- **Add books to cart** and adjust quantities
- **Admin panel** (role-based UI) to manage the catalog

The frontend is a single-page React app; the backend is a Go REST API using Fiber, GORM, and PostgreSQL.

---

## Tech Stack

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Frontend  | React 19, React Router 7, Axios, SweetAlert2, Vite 7              |
| Backend   | Go 1.25, Fiber v2, GORM, PostgreSQL driver, JWT (golang-jwt/v5)   |
| Database  | PostgreSQL (via GORM `AutoMigrate`)                               |
| Auth      | JWT (HS256, 72h expiry), bcrypt password hashing (cost 14)        |
| Styling   | Plain CSS with a custom "space / galaxy" glassmorphism theme      |

---

## Project Structure

```
book-store-with-go-react/
├── backend/                  # Go + Fiber REST API
│   ├── main.go               # App entrypoint: DB, middleware, routes
│   ├── go.mod
│   ├── database/
│   │   └── database.go       # PostgreSQL connection + GORM AutoMigrate
│   ├── handlers/
│   │   ├── auth_handler.go   # SignUp, Login
│   │   ├── book_handler.go   # GetBooks, CreateBook, UpdateBook, DeleteBook
│   │   └── cart_handler.go   # AddToCart, GetCart, UpdateCartItem, DeleteCartItem
│   └── models/
│       ├── book.go
│       ├── cart.go
│       └── user.go
└── frontend/                 # React + Vite SPA
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx          # Router + 404 route
        ├── App.jsx           # Home page, book grid, admin CRUD, cart logic
        ├── App.css
        ├── BookCard.jsx      # Single book card
        ├── BookDetailModal.jsx
        ├── Cart.jsx          # Cart modal
        ├── Login.jsx
        ├── Register.jsx
        └── assets/
```

---

## Prerequisites

- **Go** 1.25+
- **Node.js** (recent LTS) and npm
- **PostgreSQL** running locally (or reachable via the env vars below)

---

## Getting Started

### Backend

1. From the `backend/` directory, create a `.env` file (see [Environment Variables](#environment-variables)).
2. Run the API:

```bash
cd backend
go run main.go
```

The server starts on port `3000` by default (configurable via `PORT`).

### Frontend

1. Install dependencies and start the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default. Open it in your browser.

> The frontend calls the backend at `http://localhost:3000` (hardcoded as `API_BASE_URL`). Make sure the backend is running on that origin, or update the constant in `frontend/src/App.jsx` and `frontend/src/Login.jsx`.

---

## Environment Variables

The backend loads configuration from a `.env` file (via `godotenv`) in `backend/`.

| Variable       | Required | Default                | Description                                   |
| -------------- | -------- | ---------------------- | --------------------------------------------- |
| `DB_HOST`      | yes      | —                      | PostgreSQL host                               |
| `DB_USER`      | yes      | —                      | PostgreSQL user                               |
| `DB_PASSWORD`  | yes      | —                      | PostgreSQL password                           |
| `DB_NAME`      | yes      | —                      | Database name                                 |
| `DB_PORT`      | yes      | —                      | PostgreSQL port                               |
| `JWT_SECRET`   | yes      | —                      | Secret used to sign/verify JWTs               |
| `FRONTEND_URL` | no       | `http://localhost:5173`| Allowed CORS origin for the frontend          |
| `PORT`         | no       | `3000`                 | Port the backend listens on                   |

The DSN is built as:
```
host=... user=... password=... dbname=... port=... sslmode=disable TimeZone=Asia/Bangkok
```

> Note: `sslmode=disable` is fine for local development but should be changed for production.

---

## API Reference

Base URL: `http://localhost:3000`

### Public (no auth)

| Method | Path     | Description                       |
| ------ | -------- | --------------------------------- |
| GET    | `/books` | List all books                    |
| POST   | `/signup | Register a new user               |
| POST   | `/login` | Authenticate and receive a JWT    |

### Admin (`/admin/*`) — JWT required

| Method | Path               | Description          |
| ------ | ------------------ | -------------------- |
| POST   | `/admin/book`      | Create a book        |
| PUT    | `/admin/book/:id`  | Update a book        |
| DELETE | `/admin/book/:id`  | Soft-delete a book   |

### User cart (`/api/*`) — JWT required, scoped to the token owner

| Method | Path                | Description                    |
| ------ | ------------------- | ------------------------------ |
| POST   | `/api/cart`         | Add a book to the cart         |
| GET    | `/api/cart`         | List the user's cart items     |
| PUT    | `/api/cart/:id`     | Update a cart item's quantity  |
| DELETE | `/api/cart/:id`     | Remove a cart item             |

Authenticated requests must include the header:
```
Authorization: Bearer <token>
```

---

## Data Models

### User
| Field    | Type   | Notes                                  |
| -------- | ------ | -------------------------------------- |
| id       | uint   | auto (gorm.Model)                      |
| email    | string | unique, not null                       |
| password | string | not null, never serialized (`json:"-"`)|
| name     | string |                                        |
| role     | string | default `user`                         |

### Book
| Field       | Type   | Notes                              |
| ----------- | ------ | ---------------------------------- |
| id          | uint   | auto (gorm.Model)                  |
| title       | string |                                    |
| author      | string |                                    |
| price       | int    |                                    |
| image_url   | string |                                    |
| stock       | int    | default 0                          |
| description | string |                                    |

### CartItem
| Field    | Type   | Notes                                              |
| -------- | ------ | -------------------------------------------------- |
| id       | uint   | auto (gorm.Model)                                  |
| user_id  | uint   | not null                                           |
| book_id  | uint   | not null, cascading delete                         |
| book     | Book   | eager-loaded relation                              |
| quantity | int    | default 1                                          |

All models embed `gorm.Model`, so deletes are soft deletes (`DeletedAt`).

---

## Frontend Routes

| Route       | Component        | Description                                                  |
| ----------- | ---------------- | ------------------------------------------------------------ |
| `/`         | `App`            | Home / book catalog, admin CRUD, cart logic                  |
| `/login`    | `Login`          | Login page (email + password)                                |
| `/register` | `Register`       | Registration page (name, email, password, confirm)           |
| `*`         | `NotFound`       | 404 page ("Lost in space")                                   |

Cart and book detail are rendered as modal overlays within `App`, not as separate routes.

---

## Current Limitations

- **No checkout / orders.** The cart exists, but purchasing and order history are not implemented. The checkout button shows a "feature under construction" notice.
- **No role enforcement on admin routes.** The backend JWT middleware only verifies the token signature — any authenticated user can call `/admin/*` endpoints. `User.Role` is stored but not checked.
- **No input validation at runtime.** The `Book` struct has `validate` tags, but no validator middleware is wired up in `main.go`.
- **Hardcoded API base URL.** `API_BASE_URL` is hardcoded to `http://localhost:3000` in the frontend (not configurable via env).
- **No protected frontend routes.** All pages are accessible to anyone; protection is API-side only.
- **No `.env.example`, Dockerfile, docker-compose, CI, or Makefile** is provided yet.
- **Mixed-language responses.** Some backend error messages are in Thai, others in English.
- **Placeholder module name.** The Go module is named `my-fiber-app` and the npm package `my-web`.

---

## Roadmap

- [ ] Checkout flow and order history
- [ ] Enforce admin role on `/admin/*` routes
- [ ] Wire up request validation
- [ ] Centralize and env-configure the API base URL
- [ ] Add protected frontend routes
- [ ] Add `.env.example`, Docker support, and CI
- [ ] Unify error message language
- [ ] Rename modules to a consistent project name
