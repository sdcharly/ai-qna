# AI Quiz Application

An interactive quiz application powered by AI, built with Next.js and Supabase.

## Features

- AI-powered quiz generation
- User authentication and profiles
- Quiz history and progress tracking
- Admin dashboard for quiz management
- Real-time scoring and feedback

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **AI**: OpenAI API
- **Deployment**: Render

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Database
POSTGRES_HOST=your_db_host
POSTGRES_PORT=your_db_port
POSTGRES_DATABASE=your_db_name
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AI-QA.git
   cd AI-QA
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx ts-node --project scripts/tsconfig.json scripts/run-setup.ts
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Render Setup

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure the following:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: Add all variables from `.env.local`

### Supabase Setup

1. Create a new Supabase project
2. Set up authentication:
   - Enable Email provider
   - Configure email templates
   - Set site URL to your Render deployment URL
3. Get your API keys from the project settings

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Database Setup Scripts

Located in the `scripts` directory:

- `setup-supabase.sql` - Main database setup
- `enable-auth.sql` - Authentication setup
- `run-setup.ts` - Run database setup
- `create-user.ts` - Create test user

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
