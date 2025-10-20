import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Starting seed...')

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'maria@freshbites.goa' },
      update: {},
      create: {
        email: 'maria@freshbites.goa',
        password: hashedPassword,
        businessName: 'Fresh Bites Restaurant',
        businessType: 'Restaurant',
        location: 'Panaji, Goa',
        latitude: 15.4909,
        longitude: 73.8278,
        phone: '+91 9876543210',
        verified: true
      }
    }),
    
    prisma.user.upsert({
      where: { email: 'raj@goaorganic.com' },
      update: {},
      create: {
        email: 'raj@goaorganic.com',
        password: hashedPassword,
        businessName: 'Goa Organic Farm',
        businessType: 'Farm',
        location: 'Margao, Goa',
        latitude: 15.2993,
        longitude: 74.1240,
        phone: '+91 9876543211',
        verified: true
      }
    }),

    prisma.user.upsert({
      where: { email: 'priya@ecocraft.goa' },
      update: {},
      create: {
        email: 'priya@ecocraft.goa',
        password: hashedPassword,
        businessName: 'Eco Craft Studio',
        businessType: 'Handicrafts',
        location: 'Mapusa, Goa',
        latitude: 15.5909,
        longitude: 73.8158,
        phone: '+91 9876543212',
        verified: false
      }
    }),

    prisma.user.upsert({
      where: { email: 'admin@circularhub.goa' },
      update: {},
      create: {
        email: 'admin@circularhub.goa',
        password: hashedPassword,
        businessName: 'CircularHub Admin',
        businessType: 'Platform',
        location: 'Goa, India',
        latitude: 15.2993,
        longitude: 74.1240,
        verified: true
      }
    })
  ])

  console.log(`✅ Created ${users.length} users`)

  // Create sample listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        userId: users[0].id, // Fresh Bites Restaurant
        title: 'Fresh Vegetable Scraps - Perfect for Composting',
        description: 'Daily fresh vegetable scraps from our kitchen. Great for composting or animal feed. Available every evening.',
        category: 'Organic',
        quantity: 5.5,
        unit: 'kg',
        location: 'Panaji, Goa',
        latitude: 15.4909,
        longitude: 73.8278,
        availability: 'recurring',
        listingType: 'offer'
      }
    }),

    prisma.listing.create({
      data: {
        userId: users[1].id, // Goa Organic Farm
        title: 'Organic Fertilizer - Nutrient Rich Compost',
        description: 'Premium organic fertilizer made from farm waste. Rich in nutrients, perfect for gardens and farms.',
        category: 'Organic',
        quantity: 20,
        unit: 'kg',
        location: 'Margao, Goa',
        latitude: 15.2993,
        longitude: 74.1240,
        availability: 'one-time',
        listingType: 'offer'
      }
    }),

    prisma.listing.create({
      data: {
        userId: users[2].id, // Eco Craft Studio
        title: 'Looking for Glass Bottles for Upcycling',
        description: 'Need various glass bottles for our upcycling projects. Wine bottles, jam jars, any clean glass containers welcome!',
        category: 'Glass',
        quantity: 50,
        unit: 'units',
        location: 'Mapusa, Goa',
        latitude: 15.5909,
        longitude: 73.8158,
        availability: 'recurring',
        listingType: 'request'
      }
    }),

    prisma.listing.create({
      data: {
        userId: users[0].id, // Fresh Bites Restaurant
        title: 'Clean Plastic Containers - Food Grade',
        description: 'Clean food-grade plastic containers from our takeaway service. Various sizes available.',
        category: 'Plastic',
        quantity: 30,
        unit: 'units',
        location: 'Panaji, Goa',
        latitude: 15.4909,
        longitude: 73.8278,
        availability: 'recurring',
        listingType: 'offer'
      }
    })
  ])

  console.log(`✅ Created ${listings.length} listings`)

  // Create sample communities
  const communities = await Promise.all([
    prisma.community.create({
      data: {
        name: 'Goa Composting Community',
        description: 'A community dedicated to promoting composting and organic waste management in Goa. Share tips, success stories, and collaborate on sustainable practices.',
        category: 'Environment',
        creatorId: users[1].id, // Goa Organic Farm
        memberships: {
          create: [
            { userId: users[1].id, role: 'admin' },
            { userId: users[0].id, role: 'member' },
            { userId: users[2].id, role: 'member' }
          ]
        }
      }
    }),

    prisma.community.create({
      data: {
        name: 'Upcycling Artists Goa',
        description: 'Creative minds transforming waste into wonderful art. Join us to share projects, find materials, and inspire each other.',
        category: 'Arts & Crafts',
        creatorId: users[2].id, // Eco Craft Studio
        memberships: {
          create: [
            { userId: users[2].id, role: 'admin' },
            { userId: users[0].id, role: 'member' }
          ]
        }
      }
    }),

    prisma.community.create({
      data: {
        name: 'Restaurant Waste Managers',
        description: 'Restaurant owners and managers collaborating to minimize food waste and share resources efficiently.',
        category: 'Business',
        creatorId: users[0].id, // Fresh Bites Restaurant
        memberships: {
          create: [
            { userId: users[0].id, role: 'admin' }
          ]
        }
      }
    })
  ])

  console.log(`✅ Created ${communities.length} communities`)

  // Create sample community messages
  const messages = await Promise.all([
    prisma.communityMessage.create({
      data: {
        communityId: communities[0].id,
        authorId: users[1].id,
        content: 'Welcome to the Goa Composting Community! Let\'s share our experiences and build a greener Goa together. 🌱'
      }
    }),

    prisma.communityMessage.create({
      data: {
        communityId: communities[0].id,
        authorId: users[0].id,
        content: 'Excited to be here! We generate about 5kg of vegetable scraps daily at our restaurant. Looking forward to learning the best composting practices.'
      }
    }),

    prisma.communityMessage.create({
      data: {
        communityId: communities[1].id,
        authorId: users[2].id,
        content: 'Hello fellow upcyclers! I just finished a beautiful lamp made from old wine bottles. Will share photos soon! 💡'
      }
    })
  ])

  console.log(`✅ Created ${messages.length} community messages`)

  // Create sample alerts
  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        userId: users[2].id, // Eco Craft Studio
        keywords: 'glass bottles wine jars containers',
        categoryId: 'Glass',
        radiusKm: 25,
        userLatitude: 15.5909,
        userLongitude: 73.8158
      }
    }),

    prisma.alert.create({
      data: {
        userId: users[1].id, // Goa Organic Farm
        keywords: 'organic waste vegetable scraps compost',
        categoryId: 'Organic',
        radiusKm: 30,
        userLatitude: 15.2993,
        userLongitude: 74.1240
      }
    })
  ])

  console.log(`✅ Created ${alerts.length} alerts`)

  // Create sample claims
  const claims = await Promise.all([
    prisma.claim.create({
      data: {
        listingId: listings[0].id, // Vegetable scraps
        buyerId: users[1].id, // Goa Organic Farm wants scraps
        sellerId: users[0].id, // Fresh Bites offering scraps
        message: 'Hi! I run an organic farm and would love to collect your vegetable scraps for composting. I can pick up daily in the evenings.',
        status: 'accepted'
      }
    })
  ])

  console.log(`✅ Created ${claims.length} claims`)

  // Create sample notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'new_claim',
        title: 'New Interest in Your Listing!',
        message: 'Goa Organic Farm is interested in your vegetable scraps listing.',
        relatedId: claims[0].id
      }
    }),

    prisma.notification.create({
      data: {
        userId: users[2].id,
        type: 'listing_match',
        title: 'New Glass Bottles Available!',
        message: 'A new listing matches your glass bottles alert.',
        relatedId: listings[3].id
      }
    })
  ])

  console.log(`✅ Created ${notifications.length} notifications`)

  console.log('🎉 Seed completed successfully!')
  console.log('\n📋 Summary:')
  console.log(`👥 Users: ${users.length}`)
  console.log(`📝 Listings: ${listings.length}`)
  console.log(`👥 Communities: ${communities.length}`)
  console.log(`💬 Messages: ${messages.length}`)
  console.log(`🚨 Alerts: ${alerts.length}`)
  console.log(`📋 Claims: ${claims.length}`)
  console.log(`🔔 Notifications: ${notifications.length}`)
  console.log('\n🔑 Test Login:')
  console.log('Email: maria@freshbites.goa')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })