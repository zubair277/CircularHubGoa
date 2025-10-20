# 🚀 Supabase Setup Guide for CircularHub Goa

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `circularhub-goa`
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to India (Singapore/Mumbai)

## Step 2: Get Your Credentials

After project creation (2-3 minutes):

1. Go to **Settings** → **API**
2. Copy these values to your `.env` file:

```bash
# Replace in your .env file:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

**Where to find:**
- `[YOUR-PASSWORD]`: The password you set when creating the project
- `[YOUR-PROJECT-REF]`: Found in Project Settings → General → Reference ID
- `[YOUR-ANON-KEY]`: Settings → API → anon public key
- `[YOUR-SERVICE-ROLE-KEY]`: Settings → API → service_role key

## Step 3: Run Migration

Once you've updated `.env`:

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Open Prisma Studio to view your database
npm run db:studio
```

## Step 4: Enable Required Extensions (Optional)

In Supabase SQL Editor, run:

```sql
-- Enable PostGIS for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

## 🎯 Next Steps After Setup

1. **Authentication**: Use Supabase Auth for user management
2. **Real-time**: Enable real-time subscriptions for chat
3. **Storage**: Use Supabase Storage for images
4. **Edge Functions**: Deploy serverless functions

## 🔧 Development Workflow

```bash
# Start development
npm run dev:full

# View database
npm run db:studio

# Reset database (careful!)
npm run db:reset
```

## 🚨 Important Security Notes

- Never commit `.env` file to git
- Use environment variables in production
- Rotate keys regularly
- Enable Row Level Security (RLS) in Supabase

Ready to go live? Your CircularHub will scale automatically with Supabase! 🌱