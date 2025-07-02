# MindReMinder - Your Personal Wellness Companion

A comprehensive wellness application built with Next.js 14 and Supabase that helps users build healthy habits through personalized reminders, micro-actions, and motivational content.

## 🚀 Features

- **Smart Reminders**: Personalized reminders that adapt to your schedule
- **Micro-Actions**: Small, achievable actions that compound over time
- **Daily Inspiration**: Curated motivational quotes and affirmations
- **Progress Tracking**: Detailed analytics and insights
- **Community Support**: Connect with like-minded individuals
- **Goal Setting**: Guided goal-setting tools

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Database, Auth, Real-time)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/janhstrom/v0-mindreminder-app.git
cd v0-mindreminder-app
\`\`\`

### 2. Install dependencies
\`\`\`bash
pnpm install
\`\`\`

### 3. Set up environment variables
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 4. Set up the database
Copy and run the SQL from `scripts/complete-database-setup.sql` in your Supabase SQL Editor.

This will create:
- **profiles** table for user information
- **reminders** table for user reminders
- **micro_actions** table for small daily actions
- **quotes** table with inspirational content
- All necessary RLS policies for security
- Triggers for user creation and timestamps

### 5. Run the development server
\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment

### Deploy to Vercel with Supabase Integration

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. During deployment, add the Supabase integration
4. Vercel will automatically set up environment variables
5. Deploy!

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── login/             # Authentication pages
│   ├── register/
│   └── dashboard/         # Protected dashboard
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── theme-provider.tsx # Theme provider
├── lib/                  # Utility functions
│   ├── supabase/         # Supabase clients
│   ├── auth/             # Authentication utilities
│   └── utils.ts          # Utility functions
├── scripts/              # Database setup scripts
├── middleware.ts         # Next.js middleware for auth
└── README.md            # This file
\`\`\`

## 🔧 Environment Variables

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

## 🗄️ Database Schema

### Tables Created:
- **profiles**: User profile information
- **reminders**: User reminders with scheduling
- **micro_actions**: Small daily actions for habit building
- **quotes**: Inspirational quotes and affirmations

### Security:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Proper authentication policies in place

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database and auth by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

## 🆘 Troubleshooting

### Common Issues:

1. **Database setup fails**: Make sure you're running the SQL in the correct order
2. **Environment variables not working**: Check that your `.env.local` file is in the root directory
3. **Authentication issues**: Verify your Supabase URL and keys are correct
4. **Build errors**: Make sure all dependencies are installed with `pnpm install`

### Getting Help:

- Check the [Issues](https://github.com/janhstrom/v0-mindreminder-app/issues) page
- Review the [Supabase documentation](https://supabase.com/docs)
- Check [Next.js documentation](https://nextjs.org/docs)
