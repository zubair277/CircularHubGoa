import "dotenv/config";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

let db: any | undefined;
let driver: "mysql" | "neon" | undefined;

async function ensureMySqlTables(drizzleDb: any) {
  // Minimal bootstrap to auto-create required tables if missing
  // Note: Types and indexes are simplified for local MySQL usage
  await drizzleDb.execute(sql`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    phone TEXT NULL,
    avatar TEXT NULL,
    verified TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_users_email (email(191))
  );` as any);

  await drizzleDb.execute(sql`CREATE TABLE IF NOT EXISTS listings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    availability TEXT NOT NULL,
    listing_type TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    image_url TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_listings_user (user_id)
  );` as any);

  await drizzleDb.execute(sql`CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    keywords TEXT NOT NULL,
    category_id VARCHAR(36) NULL,
    radius_km INT NOT NULL,
    user_latitude DECIMAL(10,7) NULL,
    user_longitude DECIMAL(10,7) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alerts_user (user_id)
  );` as any);

  await drizzleDb.execute(sql`CREATE TABLE IF NOT EXISTS communities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NULL,
    category TEXT NULL,
    creator_id VARCHAR(36) NOT NULL
  );` as any);

  await drizzleDb.execute(sql`CREATE TABLE IF NOT EXISTS community_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    community_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_comm_msgs_comm (community_id)
  );` as any);

  // Claims table for tracking listing claims
  await drizzleDb.execute(sql`CREATE TABLE IF NOT EXISTS claims (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    listing_id VARCHAR(36) NOT NULL,
    claimer_id VARCHAR(36) NOT NULL,
    owner_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_claims_listing (listing_id),
    INDEX idx_claims_claimer (claimer_id),
    INDEX idx_claims_owner (owner_id)
  );` as any);

  // Pickups per spec (listing-linked)
  await drizzleDb.execute(sql`CREATE TABLE IF NOT EXISTS pickups (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    listing_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NULL,
    claim_id VARCHAR(36) NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    description TEXT NULL,
    amount_requested DECIMAL(10,2) NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT NULL,
    waste_weight DECIMAL(10,2) NULL,
    value_saved DECIMAL(10,2) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pickups_listing (listing_id),
    INDEX idx_pickups_user (user_id),
    INDEX idx_pickups_claim (claim_id)
  );` as any);

  // Conversations table for tracking chat sessions
  await drizzleDb.execute(sql`CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    listing_id VARCHAR(36) NOT NULL,
    buyer_id VARCHAR(36) NOT NULL,
    seller_id VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_conversations_listing (listing_id),
    INDEX idx_conversations_buyer (buyer_id),
    INDEX idx_conversations_seller (seller_id),
    UNIQUE KEY uniq_conversation_listing_buyer (listing_id, buyer_id)
  );` as any);

  // Messages table for storing chat messages
  await drizzleDb.execute(sql`CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_messages_conversation (conversation_id),
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_receiver (receiver_id),
    INDEX idx_messages_created (created_at)
  );` as any);
}

async function initDb() {
  console.log("Initializing database...");
  
  // Use your specific MySQL configuration
  const mysqlConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'dalerioluis',
    database: 'circulargoa',
    waitForConnections: true,
    connectionLimit: 10,
  };
  
  console.log("MySQL config:", { ...mysqlConfig, password: '***' });
  
  try {
    const pool = mysql.createPool(mysqlConfig);
    const mysqlDb = drizzleMysql(pool);
    
    console.log("Creating MySQL tables...");
    await ensureMySqlTables(mysqlDb);
    console.log("MySQL tables created successfully!");
    
    db = mysqlDb;
    driver = "mysql";
    return;
  } catch (error) {
    console.error("MySQL connection failed:", error);
    throw error;
  }
}

// Initialize DB and export
initDb().then(() => {
  console.log("Database initialized");
}).catch((err) => {
  console.error("Database initialization failed:", err);
});

export { db, driver };


