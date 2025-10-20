# 🎉 CircularHub Goa - Setup & Running Guide

## 🚀 Quick Start (5 minutes to fully working app!)

### 1. Set up Supabase Database

1. **Go to [supabase.com](https://supabase.com)** and create a free account
2. **Create a new project**:
   - Name: `circularhub-goa`
   - Choose a strong database password (SAVE IT!)
   - Region: Singapore (closest to India)
3. **Wait 2-3 minutes** for project setup to complete

### 2. Get Your Database Credentials

Once your Supabase project is ready:

1. Go to **Settings** → **API**
2. Copy these values and update your `.env` file:

```bash
# Replace the placeholder values in your .env file:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

**Where to find these:**
- `[YOUR-PASSWORD]`: The password you set when creating the project
- `[YOUR-PROJECT-REF]`: Settings → General → Reference ID
- `[YOUR-ANON-KEY]`: Settings → API → anon public key
- `[YOUR-SERVICE-ROLE-KEY]`: Settings → API → service_role key

### 3. Create and Populate Your Database

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:migrate

# Add sample data (restaurants, farms, communities, etc.)
npm run db:seed
```

### 4. Start Your CircularHub App

```bash
# Start both backend and frontend
npm run dev:full

# Or start separately:
npm run dev          # Backend only (port 5000)
npm run dev:frontend # Frontend only (port 5173)
```

### 5. Test Your App! 🎯

**Open your browser:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Database Admin: `npm run db:studio`

**Test Login Credentials:**
```
Email: maria@freshbites.goa
Password: password123
```

## 📊 What You Get Out of the Box

### ✅ **Sample Data Loaded:**
- **4 Users**: Restaurant, Farm, Craft Studio, Admin
- **4 Listings**: Vegetable scraps, compost, glass bottles request, plastic containers
- **3 Communities**: Composting, Upcycling, Restaurant Waste
- **Sample Messages**: Community chat messages
- **2 Alerts**: Automated notifications for new listings
- **1 Claim**: Example transaction between restaurant and farm
- **Notifications**: Alert and claim notifications

### ✅ **Full API Functionality:**
- **Authentication**: Register, login, logout
- **Users**: Profile management, business verification
- **Listings**: Create, read, update, delete with search/filters
- **Claims**: Buyer-seller transaction management
- **Communities**: Create communities, join, chat
- **Alerts**: Automated notifications for matching listings  
- **Messages**: Real-time chat via WebSocket
- **Notifications**: System notifications for all activities

### ✅ **Real-time Features:**
- **WebSocket Chat**: Community and direct messaging
- **Live Notifications**: Instant alerts for new listings
- **Auto-matching**: Alerts automatically match new listings
- **Location-based**: Distance calculations for nearby items

## 🛠️ Development Tools

```bash
# View and edit your database visually
npm run db:studio

# Reset database (careful - deletes all data!)
npm run db:reset

# Check TypeScript errors
npm run check

# Build for production
npm run build
```

## 📱 Key Features Working

### 🏪 **Marketplace**
- Businesses list surplus materials (food waste, containers, etc.)
- Other businesses can claim items they need
- Location-based matching within configurable radius
- Category filtering (Organic, Glass, Plastic, Metal, Textile)

### 👥 **Community Hub**
- Join communities by interest (Composting, Upcycling, etc.)
- Real-time chat in community groups
- Share projects, tips, and success stories
- Connect with like-minded businesses

### 🚨 **Smart Alerts**
- Set keywords and location preferences
- Get notified when matching items are listed
- Automatic matching based on distance and categories
- Email-style notifications in-app

### 📊 **Business Features**
- Business profiles with verification badges
- Track your listings and claims
- Rating system for trust building
- Transaction history

## 🌐 Production Deployment

Your app is ready for production! Options:

### **Recommended: Vercel + Supabase**
```bash
# Deploy frontend to Vercel
npm install -g vercel
vercel

# Backend is already on Supabase!
```

### **Alternative: Railway**
- Deploy full-stack app with database
- One-click deployment from GitHub

### **Self-hosted**
- Any VPS with Node.js
- Supabase handles the database

## 🎯 Next Steps

1. **Customize the UI** in `client/src/` folder
2. **Add your branding** and Goa-specific content  
3. **Configure Google Maps** with your API key
4. **Add image uploads** using Supabase Storage
5. **Set up email notifications** via Supabase Edge Functions
6. **Add payment integration** for premium features

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check your .env file has correct Supabase credentials
# Regenerate Prisma client if needed
npm run db:generate
```

### Port Already in Use
```bash
# Kill processes on ports 5000/5173
npx kill-port 5000 5173
```

### Prisma Issues
```bash
# Reset and recreate everything
npm run db:reset
npm run db:seed
```

## 🎉 You're All Set!

Your CircularHub Goa is now a fully functional marketplace for sustainable business resource sharing! 

**What's working:**
- ✅ User authentication and profiles
- ✅ Listing creation and management
- ✅ Real-time community chat
- ✅ Smart alerts and notifications
- ✅ Business-to-business claiming system
- ✅ Location-based matching
- ✅ Scalable cloud database

**Ready for production with:**
- 🌍 Global Supabase infrastructure  
- 🔒 Built-in security and auth
- 📈 Auto-scaling as your community grows
- 💰 Free tier covers initial users

Welcome to the circular economy! 🌱♻️