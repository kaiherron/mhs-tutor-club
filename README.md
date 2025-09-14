# Melrose Tutor Club

A modern tutoring appointment booking system built with Next.js, Prisma, Supabase, Resend, and Cloudflare Turnstile.

## Features

- 🎯 **Interactive Booking System**: Step-by-step wizard for easy appointment booking
- 👨‍🏫 **Tutor Management**: Comprehensive tutor profiles with subjects and availability
- 📧 **Email Notifications**: Automatic email notifications to tutors when booked
- 🤖 **Captcha Protection**: Cloudflare Turnstile integration for spam prevention
- 🗄️ **Database Integration**: Prisma ORM with Supabase PostgreSQL
- 📱 **Responsive Design**: Mobile-friendly interface
- 🎨 **Modern UI**: Clean, professional design with smooth animations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Email**: Resend
- **Captcha**: Cloudflare Turnstile
- **Styling**: Tailwind CSS
- **Animations**: Lenis smooth scrolling

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your-supabase-database-url-here"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url-here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here"

# Resend (Email)
RESEND_API_KEY="your-resend-api-key-here"

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-turnstile-site-key-here"
TURNSTILE_SECRET_KEY="your-turnstile-secret-key-here"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > Database and copy the connection string
3. Update the `DATABASE_URL` in your `.env.local` file
4. Copy the project URL and anon key to your environment variables

### 3. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Resend Setup

1. Create an account at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file
4. Verify your domain in Resend (use your school's domain)

### 5. Cloudflare Turnstile Setup

1. Go to [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
2. Create a new site
3. Copy the site key and secret key to your environment variables

### 6. Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── appointments/     # Appointment CRUD operations
│   │   ├── tutors/          # Tutor management
│   │   └── verify-captcha/  # Captcha verification
│   ├── components/
│   │   └── BookingForm.tsx  # Main booking component
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
└── .env.local              # Environment variables
```

## Database Schema

### Tutors
- `id`: Unique identifier
- `name`: Tutor's full name
- `email`: Contact email
- `subjects`: JSON object with subjects and levels
- `availability`: JSON object with weekly schedule
- `createdAt`/`updatedAt`: Timestamps

### Appointments
- `id`: Unique identifier
- `studentName`: Student's name
- `email`: Student's email
- `phone`: Contact phone (optional)
- `grade`: Student grade level
- `subject`: Subject being tutored
- `className`: Specific class (e.g., "Algebra 1")
- `level`: Difficulty level (CP, Honors, AP)
- `tutorId`: Reference to tutor
- `day`: Day of the week
- `time`: Time slot
- `date`: When appointment was created
- `status`: Appointment status
- `notes`: Additional notes

## API Routes

### GET/POST `/api/tutors`
- Manage tutor data

### GET/POST `/api/appointments`
- Handle appointment booking
- Includes captcha verification
- Sends email notifications

### POST `/api/verify-captcha`
- Verify Cloudflare Turnstile tokens

## Features Overview

### Booking Flow
1. **Subject Selection**: Choose from Mathematics, English, Science, History
2. **Class Selection**: Pick specific class (e.g., Algebra 1, English 1)
3. **Level Selection**: Choose CP, Honors, or AP
4. **Day Selection**: Monday through Friday
5. **Tutor Selection**: See available qualified tutors
6. **Time Selection**: Choose from available 30-minute slots
7. **Personal Details**: Enter contact information
8. **Confirmation**: Review and book with captcha verification

### Email Notifications
- Automatic emails sent to tutors when appointments are booked
- Includes all appointment details and student information
- Professional HTML email templates

### Security
- Cloudflare Turnstile captcha prevents spam
- Server-side captcha verification
- Input validation and sanitization

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Database Considerations
- Supabase provides managed PostgreSQL
- Automatic backups and scaling
- Real-time subscriptions available if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
