import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { communities } from "@shared/schema";

const defaults = [
  {
    name: "Composting & Organics",
    description: "Collaborate on food waste management, composting, and biogas innovations.",
    imageUrl: "/images/community/composting.jpg",
    category: "Composting & Organics",
  },
  {
    name: "Glass & Plastic Reuse",
    description: "For artists, recyclers, and businesses reusing glass and plastic materials.",
    imageUrl: "/images/community/glass-reuse.jpg",
    category: "Glass & Plastic Reuse",
  },
  {
    name: "Hospitality Waste Management",
    description: "Hotels, cafés, and caterers working to reduce and repurpose waste.",
    imageUrl: "/images/community/hospitality.jpg",
    category: "Hospitality Waste Management",
  },
  {
    name: "Textile & Fabric Recycling",
    description: "Fashion, tailoring, and textile businesses innovating in recycling fabrics.",
    imageUrl: "/images/community/textile.jpg",
    category: "Textile & Fabric Recycling",
  },
  {
    name: "Repair & Refurbishment Hub",
    description: "Businesses focused on repair, reuse, and extending product life.",
    imageUrl: "/images/community/repair.jpg",
    category: "Repair & Refurbishment Hub",
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Seed requires a configured database.");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  for (const c of defaults) {
    // Upsert-like behavior: try insert; ignore if name already exists
    await db
      .insert(communities)
      .values({ ...c, creatorId: "seed" })
      .onConflictDoNothing({ target: communities.name as any });
  }
  console.log("Seeded communities (if missing).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




