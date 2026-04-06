# PawAlert

A comprehensive web application for tracking abandoned and injured pets, featuring real-time reporting, NGO coordination, and admin management.

## Features

### User Features
- **Report Injured Animals**: Submit detailed reports with location, animal type, description, and photos
- **Real-time Tracking**: Monitor report status from submission to rescue
- **NGO Coordination**: Automatic assignment to nearest animal welfare organizations
- **User Authentication**: OTP-based login system for Indian phone numbers
- **Profile Management**: View and edit user profiles, track personal reports

### Admin Features
- **Admin Dashboard**: Comprehensive panel for managing all reports
- **Bulk Actions**: Handle multiple reports simultaneously
- **Search & Filter**: Find reports by city, animal type, or reporter
- **Status Management**: Update report statuses (pending → notified → rescued)
- **CRUD Operations**: Full create, read, update, delete capabilities

### Technical Features
- **Real-time Updates**: Live status tracking using modern web technologies
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Database**: Supabase for backend and real-time subscriptions
- **UI Components**: Radix UI for accessible, customizable components

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project and configure environment variables
4. Run database migrations from `scripts/` directory
5. Start development server: `npm run dev`
6. Open http://localhost:3000

## Environment Variables

Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The application uses several tables:
- `reports`: Animal rescue reports
- `users`: User authentication and profiles
- `ngos`: Animal welfare organizations
- Additional tables for routing and notifications

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
