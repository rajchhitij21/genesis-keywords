# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick Commands

```bash
# Development
npm run dev              # Start dev server (port 8080)

# Building
npm run build            # Production build
npm run build:dev        # Development build

# Linting
npm lint                 # Run ESLint

# Preview
npm run preview          # Preview production build locally
```

## Architecture Overview

**genesis-keywords** is an AI-powered keyword generation pipeline built with React, TypeScript, Vite, and Supabase.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **APIs**: Google Trends, Anthropic Claude

### Project Structure

```
src/
├── pages/                    # Route pages
│   ├── Index.tsx            # Home page
│   ├── Dashboard.tsx        # Keyword pipeline dashboard
│   └── NotFound.tsx         # 404 page
├── components/
│   └── ui/                  # shadcn/ui components (auto-generated)
├── App.tsx                  # Router setup & providers
├── main.tsx                 # Entry point
└── index.css                # Global Tailwind styles
```

### Key Features

1. **Dashboard** (`/dashboard`): 
   - Real-time keyword statistics cards
   - Interactive keyword table with filtering
   - Pipeline run tracking
   - Category-based organization (6 categories: builder_stories, ai_automation, etc.)

2. **Pipeline System**: 
   - Fetches from 5 external sources (GitHub, Reddit, HackerNews, Twitter*, ProductHunt*)
   - Uses Claude API to generate 60-150 keyword variations
   - Google Trends validation
   - Social signals enrichment
   - Database persistence

3. **Database Schema**:
   - `keyword_variations`: stores keywords with metadata (source, trend_score, category, status)
   - `pipeline_runs`: tracks execution history and metrics

*Twitter and ProductHunt require optional API keys

### Configuration Files

- **vite.config.ts**: Vite config with React SWC plugin; path alias `@/` → `src/`
- **tailwind.config.ts**: Tailwind CSS configuration
- **tsconfig.json**: TypeScript config with relaxed strictness (via Lovable)
- **eslint.config.js**: ESLint rules with React hooks/refresh plugins
- **components.json**: shadcn/ui component configuration

## Development Notes

- Uses **bun** as package manager (bun.lockb present)
- Path alias `@` resolves to `src/` directory
- Provider stack: React Query, Tooltip Provider, and toast notifications (shadcn & Sonner)
- Lovable-tagged components for design system integration
- Development mode includes component tagging via `lovable-tagger`

## Next Steps for Pipeline Activation

The pipeline framework is ready but requires Lovable Cloud connection to fully function. See `PIPELINE_SETUP.md` for detailed setup instructions including:
- Connecting Lovable Cloud backend
- Adding required secrets (ANTHROPIC_API_KEY is critical)
- Creating the `keyword-pipeline` edge function
- Setting up cron job (every 12 hours)
