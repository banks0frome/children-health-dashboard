# Children's Health Dashboard

AI-powered community health request management platform, built at the **Intermountain Health GenAI Hackathon** (March 2025, University of Utah).

**Live Demo:** https://children-health-dashboard.benson-tracy06.workers.dev

## What It Does

Community health teams at Intermountain receive hundreds of requests for health education events, materials, and mailings. This dashboard uses AI to automate intake, classification, and routing — turning a manual review process into an intelligent triage system.

### Features

- **Smart intake** — four submission methods: guided form, document upload, paste, and conversational chat
- **AI classification** — automatic request categorization, priority scoring, and risk flagging via Claude
- **Decision support** — approval recommendations based on request context and similar past submissions
- **Staff matching** — AI-powered staff recommendations based on expertise, availability, and service area
- **Dashboard views** — kanban board, table view, calendar, analytics charts, and material demand tracking
- **Chatbot** — natural language queries against the live dashboard data

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router, Tailwind CSS v4, Recharts, Lucide Icons |
| Backend | Cloudflare Workers, Hono |
| Database | Cloudflare D1 (SQLite at the edge) |
| AI | Claude API (Anthropic) |
| Build | Vite 6, TypeScript 5 |

## Project Structure

```
src/
  app/                    # React frontend
    components/           # Reusable UI components
      form/               # Multi-step form components
    pages/                # Route pages
      form/               # Intake form pages (guided, upload, paste, chat)
    lib/                  # Types, API client, utilities
    styles/               # Global CSS / Tailwind
  worker/                 # Cloudflare Worker backend
    routes/
      ai.ts               # AI endpoints (classify, insights, chatbot, staff recs)
      form.ts             # Form submission handling
      submissions.ts      # CRUD for submissions
      stats.ts            # Dashboard statistics
    services/
      email.ts            # Email notifications (Resend)
migrations/
  001_init.sql            # Database schema
  002_seed.sql            # Sample data
```

## Setup

### Prerequisites

- Node.js 18+
- A [Cloudflare account](https://dash.cloudflare.com) (free tier works)
- A [Claude API key](https://console.anthropic.com) from Anthropic

### Local Development

```bash
# Install dependencies
npm install

# Set up local database
npm run db:migrate:local
npm run db:seed:local

# Create .dev.vars with your API key
echo 'CLAUDE_API_KEY=your-key-here' > .dev.vars

# Start dev server
npm run dev
```

### Deploy to Cloudflare

```bash
# Create a D1 database (first time only)
npx wrangler d1 create children-health-db
# Update the database_id in wrangler.toml with the ID from above

# Set secrets
npx wrangler secret put CLAUDE_API_KEY

# Deploy
npm run deploy
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/submissions` | List all submissions (with filters) |
| `GET` | `/api/submissions/:id` | Get submission details |
| `POST` | `/api/submissions` | Create submission |
| `PATCH` | `/api/submissions/:id` | Update submission |
| `POST` | `/api/ai/classify` | AI classification + priority scoring |
| `POST` | `/api/ai/insights` | AI insights for a submission |
| `POST` | `/api/ai/chat` | Dashboard chatbot |
| `POST` | `/api/ai/staff-recommend` | AI staff matching |
| `GET` | `/api/stats/overview` | Dashboard statistics |
| `POST` | `/api/form/submit` | Public form submission |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLAUDE_API_KEY` | Yes | Anthropic API key for AI features |
| `RESEND_API_KEY` | No | Resend API key for email notifications |

## Database

The app uses Cloudflare D1 with the following tables:

- `submissions` — core request records with status tracking
- `event_details` — event-specific info (date, attendance, topics)
- `location` — physical location details
- `materials_requested` — requested health education materials
- `shipping` — shipping address for mailed materials
- `virtual_details` — virtual event platform info
- `activity_log` — audit trail of all actions
- `staff_members` — staff directory with expertise and availability

---

Built by **Benson Tracy** — benson.tracy06@gmail.com

Interested in adapting this or building something similar? Reach out anytime.
