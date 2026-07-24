# StudyAI — AI-Powered Study Assistant

> Make your study smarter and easier with AI. Summaries, flashcards, study plans, and much more.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)](https://prisma.io)
[![Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?logo=netlify)](https://netlify.com)

---

## 🚀 Live Link

**https://study-ai-plan.netlify.app/**

---

## 📸 Screenshots

<table align="center">
  <tr>
    <td align="center">
      <b>Home Page</b><br><br>
      <img src="https://i.ibb.co.com/dJj1gMS8/Screenshot-130.png" width="350">
    </td>
    <td align="center">
      <b>Overview Page</b><br><br>
      <img src="https://i.ibb.co.com/Lhq5Y7B2/Screenshot-131.png" width="350">
    </td>
    <td align="center">
      <b>Summary</b><br><br>
      <img src="https://i.ibb.co.com/twFPtbnt/Screenshot-132.png" width="350">
    </td>
  </tr>
</table>

## ✨ Features

### 🧠 AI Study Planner
- Create a **personalized study plan** by providing exam name, exam date, daily study time, current preparation level, subjects, weak topics, and study goal.
- Upload a **syllabus PDF** (or type it manually) — the AI extracts and analyzes it to build a structured plan.
- The plan includes:
  - **Summary** with exam overview and key metrics
  - **Strategy** with focus areas, weak-topic priorities, and recommendations
  - **Study Plan** broken into phases (Foundation → Learning → Practice → Revision → Mock Test)
  - **Weekly Schedule** with daily tasks and subject allocations
  - **Revision Plan** with scheduled review sessions
  - **Mock Test Plan** with practice exams
  - **Smart Tips** for effective preparation

### 📄 PDF Summarization
- **Drag & drop** or click to upload any PDF (up to 20 MB).
- Client-side PDF text extraction using `pdfjs-dist` for faster processing and to bypass serverless payload limits.
- AI generates a **structured Markdown summary** including:
  - Overview
  - Key Takeaways
  - Core Concepts
  - Recommended Next Steps
- Summaries are saved to the database and accessible in the **Summary** page.
- Supports **retry with exponential backoff** for transient network errors during Gemini file upload.

### 📊 Progress Tracking & History
- All generated summaries are stored per user and displayed in a **sidebar conversation list**.
- Click any summary to view its content in a **chat-style inbox**.
- Custom follow-up messages can be added and persisted in `localStorage`.
- Study plans are saved per user and exam, with **upsert** logic to update existing plans.

### 🔐 Authentication
- **Email/Password** login and registration with hashed passwords (`bcrypt`).
- **Google OAuth** sign-in.
- **GitHub OAuth** sign-in.
- User sessions managed via `next-auth` with Prisma-backed user storage.
- Protected routes via `proxy.ts` middleware — unauthenticated users are redirected to login.

### 🌙 Dark / Light Theme
- Theme toggle in the navbar with **system preference** detection.
- Theme persisted in `localStorage`.
- Smooth CSS transitions between themes.

### 📱 Responsive Design
- Fully responsive layout using **Tailwind CSS** with mobile-first breakpoints.
- Collapsible sidebar on smaller screens for the summary view.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + `class-variance-authority`, `clsx`, `tailwind-merge` |
| **UI Components** | Radix UI primitives + custom shadcn components |
| **Database** | PostgreSQL (via [Prisma](https://prisma.io) ORM) |
| **AI Engine** | Google Gemini API (`@google/genai` — `gemini-3.6-flash`) |
| **Auth** | `next-auth` v4 (Credentials, Google, GitHub providers) |
| **PDF Processing** | `pdfjs-dist` (client-side extraction), `pdf-parse` |
| **HTTP Client** | `axios` |
| **Notifications** | `react-hot-toast` |
| **Deployment** | [Netlify](https://netlify.com) |
| **Password Hashing** | `bcrypt` / `bcryptjs` |

---

## 📁 Project Structure

```
ai-study-plan/
├── app/
│   ├── layout.tsx          # Root layout with theme provider, navbar, auth provider
│   ├── page.tsx            # Home page (landing + upload zone)
│   ├── globals.css         # Global styles & Tailwind imports
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   ├── study_plan/route.ts           # Study plan CRUD (POST/GET)
│   │   └── summarize/route.ts            # PDF upload & summary generation (POST/GET)
│   ├── study_plan/
│   │   └── page.tsx        # Study plan creation form page
│   ├── summary/
│   │   └── page.tsx        # Summary viewer page (chat-style)
│   └── overview/
│       └── page.tsx        # Study plan overview/dashboard page
├── components/
│   ├── Home.tsx            # Landing page hero, features, upload zone
│   ├── Pdf.tsx             # PDF upload dropzone with client-side extraction
│   ├── Navbar.tsx          # Navigation bar with auth links & theme toggle
│   ├── NavbarWrapper.tsx   # Suspense wrapper for Navbar
│   ├── LoginForm.tsx       # Email/password login modal
│   ├── RegisterForm.tsx    # Email/password registration modal
│   ├── ThemeToggle.tsx     # Dark/light theme switcher
│   ├── ThemeProvider.tsx   # Next Themes provider wrapper
│   ├── Avatar.tsx          # User avatar dropdown
│   ├── StudyPlan/
│   │   ├── StudyInput.tsx  # Study plan creation form
│   │   └── PlanOverView.tsx # Study plan detail/overview display
│   └── Summary/
│       ├── SummaryWrapper.tsx # Main summary chat interface
│       ├── Sidebar.tsx       # Conversation history sidebar
│       └── ChatInbox.tsx     # Chat message display area
├── lib/
│   ├── authOptions.ts      # NextAuth configuration (providers, callbacks)
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts            # Utility functions (cn, etc.)
├── prisma/
│   ├── schema.prisma       # Database schema (User, Summary, StudyPlan)
│   └── migrations/         # Database migration files
├── netlify.toml            # Netlify build & deploy config
├── next.config.ts          # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Schema

### `User`
| Field | Type | Notes |
|-------|------|-------|
| `id` | Int | Auto-increment primary key |
| `email` | String | Unique |
| `name` | String? | |
| `password` | String? | Hashed with bcrypt |
| `image` | String? | OAuth profile image |
| `provider` | String? | "credentials", "google", "github" |
| `createdAt` | DateTime | Default: now |
| `updatedAt` | DateTime | Auto-updated |

### `Summary`
| Field | Type | Notes |
|-------|------|-------|
| `id` | Int | Auto-increment primary key |
| `userId` | Int? | Foreign key → User |
| `title` | String | PDF file name without extension |
| `fileName` | String | Original file name |
| `fileSize` | String | Human-readable size (e.g., "2.4 MB") |
| `summaryText` | String | AI-generated Markdown summary |
| `createdAt` | DateTime | Default: now |

### `StudyPlan`
| Field | Type | Notes |
|-------|------|-------|
| `id` | String | CUID primary key |
| `userId` | Int | Foreign key → User |
| `examName` | String | Case-insensitive (Citext) |
| `data` | Json | Full AI-generated plan JSON |
| `createdAt` | DateTime | Default: now |
| `updatedAt` | DateTime | Auto-updated |

Unique constraint: `(userId, examName)` — upserts on duplicate.

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** 20+
- **npm**, **yarn**, **pnpm**, or **bun**
- A **PostgreSQL** database (or Neon serverless Postgres)
- A **Google Gemini API key** (get one from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/ai-study-plan.git
cd ai-study-plan
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/studiai"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-string"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# OAuth Providers (optional, for Google/GitHub login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for production

```bash
npm run build
npm run start
```

The build command runs `prisma generate` before `next build` to ensure the Prisma client is always up to date.

---

## 🚀 Deployment (Netlify)

This project is configured for deployment on **Netlify**.

### Deploy to Netlify

1. Push your code to GitHub.
2. Go to [Netlify](https://app.netlify.com) and click **"Add new site" → "Import an existing project"**.
3. Connect your GitHub repository.
4. Set the following **Build settings**:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** `20`
5. Add the following **Environment Variables** in the Netlify dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GEMINI_API_KEY`
   - `GOOGLE_CLIENT_ID` (optional)
   - `GOOGLE_CLIENT_SECRET` (optional)
   - `GITHUB_ID` (optional)
   - `GITHUB_SECRET` (optional)
6. Click **"Deploy site"**.

The `netlify.toml` file handles the build configuration and the `@netlify/plugin-nextjs` plugin ensures proper Next.js routing on Netlify.

> **Note:** For database connectivity from Netlify, you may need to use a proxy or connect to a serverless-compatible database like Neon. The project includes `proxy-db.js` for local PostgreSQL proxying during development.

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build for production (runs `prisma generate` first) |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🧩 How It Works

### 1. Home Page
The landing page features a hero section, a live preview of the AI-generated study plan, a PDF upload zone, and a feature showcase.

### 2. Creating a Study Plan
- Navigate to **Study Plan** (or click "Create Study Plan" from the home page).
- Fill in your exam details, upload a syllabus PDF (or type it manually), and submit.
- The AI generates a complete study plan and saves it to the database.
- You're redirected to the **Overview** page to view your plan.

### 3. Summarizing PDFs
- Drag & drop a PDF onto the upload zone on the home page (or click to browse).
- The PDF text is extracted client-side using `pdfjs-dist`.
- The extracted text is sent to the Gemini API for summarization.
- The summary is saved and you're redirected to the **Summary** page to view it.

### 4. Viewing Summaries
- The **Summary** page shows a sidebar with all your saved summaries.
- Click any summary to view its content in the chat inbox.
- You can add custom follow-up messages that persist in `localStorage`.

### 5. Authentication
- Sign up or log in via email/password, Google, or GitHub.
- All AI features are tied to your user account.
- Protected routes (`/overview`, `/summary`, `/profile`) redirect unauthenticated users to the login page.

---

## 🐛 Problems This Project Solves

1. **Information Overload** — Students struggle to distill long PDFs and syllabus documents into actionable study material. StudyAI automatically generates structured summaries so you can focus on learning, not reading.

2. **Lack of Personalized Study Plans** — Generic study schedules don't account for individual strengths, weaknesses, and time constraints. StudyAI creates a **personalized plan** based on your exam date, current level, available study time, and weak topics.

3. **No Progress Tracking** — Students often lose track of what they've covered and what's left. The summary history and study plan overview provide a clear picture of your preparation progress.

4. **Fragmented Study Tools** — Students juggle multiple apps for notes, planning, and revision. StudyAI combines **PDF summarization, study planning, and progress tracking** in one unified platform.

5. **Burnout Prevention** — The AI-generated plans include built-in breaks, rest days, and balanced weekly schedules to prevent overstudying and burnout.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using [Next.js](https://nextjs.org), [Prisma](https://prisma.io), and [Google Gemini AI](https://ai.google.dev).

