<div align="center">

# SMIS
### Sports Medical Information System
#### نظام إدارة الصحة الرياضية المتكامل

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://smis-app.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![MySQL](https://img.shields.io/badge/Database-TiDB%20Cloud-E6522C?style=for-the-badge&logo=mysql&logoColor=white)](https://tidbcloud.com)

<br/>

**A comprehensive, bilingual (Arabic/English) sports medical management platform — built for sports clubs to manage player health, injuries, rehabilitation, and medical workflows with role-based access control and real-time updates.**

**منصة متكاملة ثنائية اللغة (عربي/إنجليزي) لإدارة الصحة الرياضية — مصممة للأندية الرياضية لإدارة صحة اللاعبين والإصابات وبرامج التأهيل وسير العمل الطبي مع صلاحيات مبنية على الأدوار وتحديثات فورية.**

<br/>

[Live Demo](https://smis-app.vercel.app) · [GitHub](https://github.com/tarekokasha22/smis) · [Report Bug](https://github.com/tarekokasha22/smis/issues) · [Request Feature](https://github.com/tarekokasha22/smis/issues)

</div>

---

## Screenshots

> Screenshots coming soon.

![SMIS Dashboard Placeholder](https://via.placeholder.com/1200x600/1e293b/38bdf8?text=SMIS+Dashboard+%E2%80%94+Sports+Medical+Information+System)

---

## Features

- **Dashboard** — Real-time statistics, KPIs, and interactive charts for a full club health overview
- **Player Management** — Complete player profiles with status tracking, history, and medical records
- **Injury Tracking** — Log, monitor, and manage player injuries with detailed incident reports
- **Vitals & Health Measurements** — Record and trend physiological measurements per player
- **Rehabilitation Programs** — Design and track custom rehab plans with phase-based progression
- **Equipment & Supplies** — Manage medical inventory, usage logs, and stock levels
- **Appointments Scheduling** — Book, manage, and track medical appointments for players and staff
- **Performance Tracking** — Monitor physical and medical performance metrics over time
- **File Management** — Upload, organize, and retrieve medical documents and media files
- **User Management** — Full role-based access control (Admin, Doctor, Physiotherapist, Coach, Manager)
- **Notifications** — Real-time in-app alerts via Socket.io
- **Audit Logs** — Complete traceable history of all system actions
- **Reports** — Generate and export structured medical and administrative reports
- **Bilingual (i18n)** — Full Arabic and English support with seamless RTL/LTR switching
- **Real-Time Updates** — Powered by Socket.io for live data across connected clients

---

## Tech Stack

### Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-State%20Management-brown?style=flat-square)](https://zustand-demo.pmnd.rs)
[![React Query](https://img.shields.io/badge/React%20Query-5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![React Router](https://img.shields.io/badge/React%20Router-v6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Recharts](https://img.shields.io/badge/Recharts-Charts-22B5BF?style=flat-square)](https://recharts.org)
[![i18next](https://img.shields.io/badge/i18next-Bilingual-26A69A?style=flat-square)](https://www.i18next.com)

### Backend

[![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7?style=flat-square&logo=sequelize&logoColor=white)](https://sequelize.org)
[![MySQL](https://img.shields.io/badge/MySQL-TiDB%20Cloud-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://tidbcloud.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Multer](https://img.shields.io/badge/Multer-File%20Uploads-FF6C37?style=flat-square)](https://github.com/expressjs/multer)
[![Joi](https://img.shields.io/badge/Joi-Validation-0080FF?style=flat-square)](https://joi.dev)

### Infrastructure

[![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![TiDB Cloud](https://img.shields.io/badge/TiDB%20Cloud-Free%20MySQL-E6522C?style=flat-square)](https://tidbcloud.com)

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn**
- A **MySQL-compatible** database (local MySQL or [TiDB Cloud](https://tidbcloud.com) free tier)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/tarekokasha22/smis.git
cd smis
```

**2. Install frontend dependencies**

```bash
cd frontend
npm install
```

**3. Install backend dependencies**

```bash
cd ../backend
npm install
```

### Running Locally

**Start the backend (development)**

```bash
cd backend
npm run dev
```

**Start the frontend (development)**

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

---

## Environment Variables

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Backend — `backend/.env`

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=your_tidb_or_mysql_host
DB_PORT=4000
DB_NAME=smis
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SSL=true

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# File Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

> **Note:** Never commit `.env` files. A `.env.example` file is provided in each directory as a reference.

---

## Demo Accounts

The live demo is pre-seeded with the following accounts — each with a distinct role and permission set:

| Role | Email | Password | Access Level |
|---|---|---|---|
| Admin | admin@hilal.com | Admin@1234 | Full system access |
| Doctor | doctor@hilal.com | Doctor@1234 | Medical records, injuries, vitals |
| Physiotherapist | physio@hilal.com | Physio@1234 | Rehab programs, injuries, vitals |
| Coach | coach@hilal.com | Coach@1234 | Player profiles, performance |
| Manager | manager@hilal.com | Manager@1234 | Reports, staff, appointments |

> **Try the live demo:** [https://smis-app.vercel.app](https://smis-app.vercel.app)

---

## Project Structure

```
smis/
├── frontend/                  # React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── api/               # Axios API clients and query hooks
│   │   ├── assets/            # Images, icons, static files
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── layouts/           # Page layout wrappers
│   │   ├── locales/           # i18n translation files (ar / en)
│   │   ├── pages/             # Route-level page components
│   │   │   ├── appointments/
│   │   │   ├── dashboard/
│   │   │   ├── equipment/
│   │   │   ├── files/
│   │   │   ├── injuries/
│   │   │   ├── performance/
│   │   │   ├── players/
│   │   │   ├── rehab/
│   │   │   ├── reports/
│   │   │   ├── users/
│   │   │   └── vitals/
│   │   ├── store/             # Zustand global state stores
│   │   ├── utils/             # Helpers and utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── backend/                   # Express.js API server
│   ├── config/                # DB and app configuration
│   ├── controllers/           # Route controller logic
│   ├── middleware/             # Auth, validation, error handling
│   ├── models/                # Sequelize ORM models
│   ├── routes/                # Express route definitions
│   ├── seeders/               # Database seed scripts
│   ├── services/              # Business logic layer
│   ├── sockets/               # Socket.io event handlers
│   ├── uploads/               # Uploaded file storage
│   ├── utils/                 # Shared utility functions
│   ├── validations/           # Joi validation schemas
│   ├── app.js
│   └── server.js
│
└── README.md
```

---

## Deployment

Both the frontend and backend are deployed on **Vercel** as serverless functions, with the database hosted on **TiDB Cloud** (free MySQL-compatible tier).

| Service | Provider | URL |
|---|---|---|
| Frontend | Vercel | https://smis-app.vercel.app |
| Backend API | Vercel (Serverless) | https://smis-app.vercel.app/api |
| Database | TiDB Cloud | Managed MySQL |

**To deploy your own instance:**

1. Fork the repository.
2. Import both `frontend/` and `backend/` as separate Vercel projects (or configure a monorepo `vercel.json`).
3. Set the required environment variables in each Vercel project's settings.
4. Create a free TiDB Cloud cluster and update the database environment variables.
5. Run the seeders to populate initial data.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with dedication for sports medicine professionals.

صُنع بشغف لمحترفي الطب الرياضي.

[![GitHub](https://img.shields.io/badge/GitHub-tarekokasha22-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/tarekokasha22)

</div>
