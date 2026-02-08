
const { db } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function seed() {
    const client = await db.connect();

    console.log('🌱 Starting Database Seeding...');

    try {
        // 1. Create Tables
        console.log('Creating tables...');
        await client.sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        domain TEXT UNIQUE NOT NULL,
        brand_color TEXT DEFAULT '#38003c',
        ai_model_preference TEXT DEFAULT 'gemini-2.5-flash',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await client.sql`
      CREATE TABLE IF NOT EXISTS scouting_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id),
        prompt TEXT NOT NULL,
        report_text TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await client.sql`
      CREATE TABLE IF NOT EXISTS player_cache (
        fpl_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        team TEXT NOT NULL,
        position TEXT NOT NULL,
        data JSONB NOT NULL,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        // 2. Seed Default Tenant (First Client)
        console.log('Seeding initial tenant...');
        await client.sql`
      INSERT INTO tenants (name, domain, brand_color)
      VALUES ('Scout First Client', 'localhost', '#00ff87')
      ON CONFLICT (domain) DO NOTHING;
    `;

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await client.release();
    }
}

seed();
