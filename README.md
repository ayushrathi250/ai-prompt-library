# AI Prompt Library - Production Full Stack SaaS Application

PromptHub is a production-quality, full-stack AI Prompt Library web application built with React 19, TypeScript, Express.js, MongoDB Mongoose, TailwindCSS v4, and DnD Kit. Designed with clean architecture, elegant UI/UX, smooth animations, and robust security practices.

---

## 🌟 Key Features

- **Dashboard Analytics**: Animated metrics for total prompts, favorites, categories distribution, and recently added templates.
- **10 Core Categories**: Coding, Marketing, Content Writing, Email, Resume, SQL, Design, Social Media, Productivity, and Others.
- **Drag-and-Drop Reordering**: Rearrange prompt cards using `@dnd-kit` with persisted ordering in MongoDB/database.
- **Full REST API Backend**: CRUD operations, duplicate prompt endpoint, pin/favorite toggles, bulk reorder, import, and export.
- **One-Click Clipboard Copying**: Instant 1-click copy with toast notifications.
- **Bulk JSON Import & Export**: Import JSON schema files with Zod validation feedback and export prompt backups.
- **Dark Mode Support**: Light and dark themes with LocalStorage persistence.
- **Form Validation**: Powered by `react-hook-form` and `zod`.
- **Search & Filtering**: Debounced multi-field search (title, prompt, description, tags) and category tabs.
- **Hybrid Database Architecture**: Automatically connects to MongoDB Atlas when `MONGO_URI` is provided, with an operational in-memory fallback for instant setup.

---

## 📂 Project Structure

```text
ai-prompt-library/
├── backend/
│   ├── config/             # DB connection & fallback store
│   ├── controllers/        # REST API controllers
│   ├── middleware/         # Centralized error handler
│   ├── models/             # Mongoose Prompt schema & indexes
│   ├── routes/             # Express API router
│   ├── utils/              # Default seed data generator
│   └── validators/         # Zod schemas for input validation
├── src/
│   ├── assets/             # SVGs & static media
│   ├── components/         # Reusable UI, modals, cards & lists
│   ├── constants/          # Category definitions & color tokens
│   ├── context/            # PromptContext & ThemeContext
│   ├── hooks/              # useDebounce & state hooks
│   ├── pages/              # Dashboard, All Prompts, Settings, 404
│   ├── services/           # Axios API client & prompt service
│   ├── types/              # TypeScript interfaces & types
│   ├── App.tsx             # Main layout & global providers
│   ├── main.tsx            # Entry point
│   └── index.css           # Global Tailwind CSS import
├── server.ts               # Express + Vite middleware server entry
├── package.json            # Node dependencies & build scripts
├── .env.example            # Environment variables template
├── .gitignore              # Ignored files
└── README.md               # Project documentation
```

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas cluster (optional; fallback in-memory store available)

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Define environment variables inside `.env`:
```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-prompts?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000
VITE_API_URL=/api
```

---

## ⚡ Running the Application

### Development Mode
Starts the Express server with embedded Vite middleware and TypeScript `tsx`:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Production Build & Start
Bundles the frontend using Vite and builds the server into CommonJS (`dist/server.cjs`) with `esbuild`:
```bash
npm run build
npm start
```

---

## 🌐 API Documentation

### Base URL: `/api`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/prompts` | Fetch all prompts with search (`q`), `category`, `favorite`, `pinned`, `sort` |
| `GET` | `/api/prompts/:id` | Fetch a single prompt by ID |
| `POST` | `/api/prompts` | Create a new prompt template |
| `PUT` | `/api/prompts/:id` | Update prompt title, prompt text, category, or tags |
| `DELETE` | `/api/prompts/:id` | Delete a prompt |
| `POST` | `/api/prompts/:id/duplicate` | Duplicate an existing prompt |
| `PATCH` | `/api/prompts/:id/favorite` | Toggle favorite status |
| `PATCH` | `/api/prompts/:id/pin` | Toggle pinned status |
| `PATCH` | `/api/prompts/reorder` | Bulk update display orders (`[{ id, displayOrder }]`) |
| `POST` | `/api/prompts/import` | Bulk import JSON array of prompts |
| `GET` | `/api/prompts/export` | Download JSON file export of prompts |
| `GET` | `/api/stats` | Get dashboard overview statistics |

---

## 🍃 MongoDB Atlas Setup

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database cluster and database user.
3. Allow network access (0.0.0.0/0 for Cloud hosting).
4. Copy your MongoDB connection string and set `MONGO_URI` in `.env`.

---

## 🚀 Deployment

### Vercel / Render / Cloud Run
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- Set `NODE_ENV=production` and `MONGO_URI` in your hosting dashboard environment variables.

---

## 📄 License

Apache-2.0 License.
