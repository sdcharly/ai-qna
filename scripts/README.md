# Supabase Setup Scripts

This directory contains scripts for setting up and managing the Supabase authentication system.

## Main Scripts

1. `setup-supabase.sql`
   - Main SQL script for setting up Supabase authentication
   - Creates necessary tables, functions, and triggers
   - Sets up Row Level Security (RLS)
   - Creates an admin user

2. `run-setup.ts`
   - TypeScript script to run the setup SQL
   - Handles database connection and transaction
   - Provides feedback on setup progress

3. `test-auth.ts`
   - Tests the authentication system
   - Verifies user creation and login
   - Checks session management

## Usage

1. Initial Setup:
   ```bash
   npx ts-node --project scripts/tsconfig.json scripts/run-setup.ts
   ```

2. Test Authentication:
   ```bash
   npx ts-node --project scripts/tsconfig.json scripts/test-auth.ts
   ```

## Default Admin Credentials

- Email: admin@example.com
- Password: admin123

## Notes

- The setup script is idempotent (can be run multiple times safely)
- All tables use UUIDs for primary keys
- Row Level Security is enabled by default
- Triggers automatically create user profiles
