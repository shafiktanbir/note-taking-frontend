# 🎨 Secure Note-Taking Platform (Frontend App)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production%20Live-brightgreen?logo=vercel)](https://note-taking-frontend-lyart.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-purple?logo=vite)](https://vitejs.dev/)

Modern, responsive React single-page application (SPA) built with **TypeScript**, **Vite**, and **Vanilla CSS (Glassmorphism & Sleek Dark Aesthetics)**, designed to interface seamlessly with the production REST API deployed on Vercel.

---

## 🔗 Live Production URLs & Repositories

- **Live Application URL:** [`https://note-taking-frontend-lyart.vercel.app`](https://note-taking-frontend-lyart.vercel.app)
- **Live Backend REST API:** [`https://note-taking-backend-opal.vercel.app/api`](https://note-taking-backend-opal.vercel.app/api)
- **GitHub Frontend Repository:** [`https://github.com/shafiktanbir/note-taking-frontend`](https://github.com/shafiktanbir/note-taking-frontend)
- **GitHub Backend Repository:** [`https://github.com/shafiktanbir/note-taking-backend`](https://github.com/shafiktanbir/note-taking-backend)

---

## 🖥️ UI Features & Functional Views

```
note-taking-frontend/
├── src/
│   ├── App.tsx             # Main App router, tab navigation, state management & UI views
│   ├── index.css           # Responsive glassmorphism design system & CSS custom properties
│   ├── main.tsx            # React DOM root entry point
│   ├── services/
│   │   └── api.ts          # API HTTP client handling JWT headers, tokens & REST requests
│   └── vite-env.d.ts       # Vite TypeScript environment declarations
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json             # Vercel SPA rewrite deployment config
```

### Key UI Features:
1. **Authentication Tab (`/login`):** Sign in or register new user/admin accounts with interest tagging. Stores JWT Bearer token in `localStorage`.
2. **User Notes Dashboard (`/dashboard`):** Create new notes, view paginated notes list (`page`, `limit`, `total`, `totalPages`), edit, and delete notes.
3. **Admin Console (`/admin`):** Admin-only user management panel listing users (paginated) sorted by creation date with role badges (`ADMIN` vs `USER`) and deletion controls.
4. **MongoDB Aggregations Explorer (`/aggregations`):**
   - **Scenario 1 View:** Grouped interest cards rendered from `/api/aggregations/interests`.
   - **Scenario 2 View:** User posts viewer performing `$lookup` joins against the `Posts` collection.

---

## 🔐 Pre-Seeded Test Credentials

| Role | Email | Password | Pre-seeded Features |
| :--- | :--- | :--- | :--- |
| **Regular User** | `john@example.com` | `User123!` | 2 Notes, 2 Posts, Interests: `chess`, `coding`, `gaming` |
| **Regular User** | `jane@example.com` | `User123!` | 1 Note, 1 Post, Interests: `reading`, `painting` |
| **Administrator** | `admin@example.com` | `Admin123!` | Admin console access, manage users, view all notes |

---

## 🛠️ Quick Start & Local Setup

```bash
# 1. Clone repository
git clone https://github.com/shafiktanbir/note-taking-frontend.git
cd note-taking-frontend

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env
# Default: VITE_API_BASE_URL=https://note-taking-backend-opal.vercel.app/api

# 4. Start local development server
npm run dev
# App running at http://localhost:3000
```

---

## 🧪 Build & Vercel Deployment

```bash
# Production TypeScript build
npm run build

# Deploy to Vercel Production
vercel --prod --yes -e VITE_API_BASE_URL="https://note-taking-backend-opal.vercel.app/api"
```
