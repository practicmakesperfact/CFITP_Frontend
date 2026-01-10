# CFITP Frontend

**Client Feedback & Issue Tracking Portal (Frontend)**

A modern, role-based frontend application for managing client feedback, issues, notifications, reports, and user activity.  
Built with **React + Vite**, optimized for performance, scalability, and clean UI/UX.

---

## 📌 Project Overview

CFITP Frontend provides a unified interface for:

- Clients to submit feedback and track issues
- Staff to manage assigned issues and communication
- Managers to analyze performance and generate reports
- Admins to manage users, system data, and audit logs

The system integrates tightly with a **Django REST API backend** and supports **real-time notifications**, **role-based access control**, and **data-driven dashboards**.

---

## 🧩 Tech Stack (Strictly Used)

### Core

- **React + Vite**
- **Tailwind CSS** (custom theme)
- **React Router DOM**

### State Management

- **TanStack React Query** – server state
- **Zustand** – lightweight UI state

### Networking

- **Axios** with interceptors (JWT + refresh tokens)

### UI & UX

- **shadcn/ui** + **Tailwind**
- **lucide-react** icons
- **Framer Motion** – animations
- **lottie-react** – empty/success states
- **react-hot-toast** – notifications

### Forms & Validation

- **react-hook-form**
- **yup**

### Data Visualization & Export

- **ApexCharts (react-apexcharts)**
- **SheetJS (xlsx)** – CSV/XLSX export
- **PDF generation handled by backend**

### File Handling & Security

- **react-dropzone** – attachments
- **DOMPurify** – sanitize HTML comments

### Realtime

- **PusherJS** – in-app notifications
- Fallback polling every 60 seconds

---

## 🔐 Authentication & Security

- JWT-based authentication
- Access & refresh tokens
- Tokens stored in `localStorage` (MVP)
- Automatic token refresh via Axios interceptors
- Role-based route protection

> ⚠️ **Production Recommendation**  
> Use **httpOnly cookies** for refresh tokens to mitigate XSS risks.

---

## 🎯 Core Features

### Authentication

- Register / Login / Logout
- Token refresh
- Role detection (`Client`, `Staff`, `Manager`, `Admin`)

### Dashboards (Role-Based)

- KPI cards
- Charts (ApexCharts)
- Tables and activity feeds
- Separate layouts per role

### Issues Management

- Create, update, assign, close/reopen issues
- Filters: status, priority, assignee
- Threaded comments (sanitized)
- File attachments

### Feedback

- Client feedback submission
- Convert feedback → issue (Staff/Manager)

### Notifications

- Realtime via Pusher
- Toast alerts
- Notification drawer
- Read/unread state
- Polling fallback if realtime fails

### Reports

- Visual analytics
- CSV export
- Trigger backend PDF generation
- Poll report status → download when ready
- Lazy-loaded charts & exports

### Profile

- View & edit profile
- Change password
- Activity history timeline
- Export activity (CSV)

---

## 📁 Folder Structure

```text
CFITP-frontend/
│
├── public/
│
├── src/
│   ├── api/
│   │   ├── axiosClient.js
│   │   ├── authApi.js
│   │   ├── issuesApi.js
│   │   ├── commentsApi.js
│   │   ├── feedbackApi.js
│   │   ├── attachmentsApi.js
│   │   ├── notificationsApi.js
│   │   ├── reportsApi.js
│   │   └── index.js
│   │
│   ├── app/
│   │   ├── queryClient.js
│   │   ├── store/
│   │   │   └── uiStore.js
│   │   └── hooks.js
│   │
│   ├── components/
│   │   ├── Layout/
│   │   ├── Dashboard/
│   │   ├── Issues/
│   │   ├── Comments/
│   │   ├── Notifications/
│   │   ├── Profile/
│   │   ├── Reports/
│   │   └── UI/
│   │
│   ├── pages/
│   │   ├── Auth/
│   │   ├── Dashboards/
│   │   ├── Issues/
│   │   ├── Feedback/
│   │   ├── Reports/
│   │   ├── Notifications/
│   │   └── Profile/
│   │
│   ├── routes/
│   │   └── index.jsx
│   │
│   ├── utils/
│   │   ├── authHelper.js
│   │   ├── formatters.js
│   │   └── domSanitize.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   ├── assets/
│   │   └── illustrations/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md

Axios + React Query Setup
Axios Interceptors

Adds access token to headers

Handles 401 → refresh token → retry request

Redirects to login if refresh fails

React Query

All API calls wrapped with useQuery / useMutation

Optimistic updates for comments & issues

Cache mutation on realtime events

🔐 Route Protection

ProtectedRoute.jsx – authentication guard

RoleRoute.jsx – role-based authorization

Unauthorized users are auto-redirected

🔔 Realtime Notifications

PusherJS user-specific channels

React Query cache update on events

Toast notification on new activity

Polling fallback every 60 seconds

🎨 Theme
Type	Color
Primary	#0EA5A4 (Teal)
Accent	#FB923C (Orange)
Background	#F8FAFC
Text	#334155

Animations via Framer Motion for modals, lists, and transitions.

🔧 Environment Variables
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_PUSHER_KEY=your-pusher-key
VITE_PUSHER_CLUSTER=mt1

Installation
npm install

Required Packages
npm install react-apexcharts apexcharts
npm install lucide-react react-router-dom
npm install react-hot-toast
npm install @tanstack/react-query
npm install framer-motion
npm install zustand axios
npm install react-hook-form yup
npm install react-dropzone
npm install dompurify
npm install lottie-react
npm install xlsx exceljs
npm install @tanstack/react-table
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npm audit fix

▶️ Scripts
npm run dev       # Start development server
npm run build     # Production build
npm run preview   # Preview production build

🧠 Development Priority Roadmap
HIGH PRIORITY

User management (list/edit)

Feedback admin panel

Attachments browser

MEDIUM PRIORITY

Bulk actions

Admin tables

CSV exports

LOW PRIORITY

System settings

Advanced audit logs

Backup & maintenance UI

📄 License

This project is intended for academic, institutional, and enterprise use.
Customize licensing as needed.

🤝 Backend Integration

Backend: Django + Django REST Framework + Celery
PDF reports, email notifications, and heavy processing are handled server-side.
```
