# Norf Cre8ions - Portfolio Website

A modern portfolio website for Norf Cre8ions, a content-driven creative studio in Musanze, Rwanda.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Routing**: React Router

## Features

- ✅ Dynamic Work Projects Management (CRUD)
- ✅ Team Members Management (CRUD)
- ✅ Admin Dashboard
- ✅ Responsive Design
- ✅ Image & Video Gallery
- ✅ Contact Modal
- ✅ Authentication & Authorization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd norf_new_web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**
   
   Run the migrations in your Supabase SQL Editor (see `apply_migration.sql`)

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## Project Structure

```
src/
├── components/          # React components
│   ├── admin/          # Admin management components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── integrations/       # Supabase client setup
├── pages/             # Page components
├── lib/               # Utility functions
└── data/              # Static data files
```

## Admin Access

1. Log in via `/auth`
2. Ensure your user has admin role in `user_roles` table
3. Access admin dashboard at `/admin`

## Database Schema

### work_projects
- id, title, description, category
- image_url, thumbnail, media_type
- credits (JSONB), images (JSONB)
- youtube_url, slug, year
- display_order

### team_members
- id, name, role, bio
- image_url, display_order

## Deployment

### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Option 2: Netlify
1. Push your code to GitHub
2. Create new site in Netlify
3. Connect repository
4. Add environment variables
5. Deploy

### Option 3: Self-hosted
```bash
npm run build
# Serve the dist/ folder with any static hosting
```

## Environment Variables

Required:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

© 2024 Norf Cre8ions. All rights reserved.
