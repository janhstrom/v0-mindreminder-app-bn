# MindReMinder

A mindfulness and productivity app built with Next.js and Supabase.

## Features

- **Daily Reminders**: Set personalized reminders for mindfulness practices
- **Micro Actions**: Small, achievable tasks to build positive habits
- **Motivational Quotes**: Daily inspiration to keep you motivated
- **Progress Tracking**: Monitor your mindfulness journey
- **User Authentication**: Secure login and registration

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/janhstrom/v0-mindreminder-app.git
cd v0-mindreminder-app
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

4. **Set up the database**
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Copy and run the SQL from `scripts/complete-database-setup.sql`

5. **Run the development server**
\`\`\`bash
npm run dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

The app uses the following main tables:

- **profiles**: User profile information
- **reminders**: User's mindfulness reminders
- **micro_actions**: Small daily actions/habits
- **quotes**: Motivational quotes database

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add your environment variables
- Deploy!

3. **Add Supabase Integration**
- During deployment, Vercel will detect Supabase usage
- Add the Supabase integration for automatic setup

## Environment Variables

Required environment variables:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
