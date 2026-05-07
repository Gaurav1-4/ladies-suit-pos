const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const password = await bcrypt.hash('admin123', 10);
    
    const shop = await prisma.shop.create({
      data: {
        name: 'Antra Creation',
        address: 'Your Shop Address',
        users: {
          create: {
            name: 'Manish',
            email: 'gauravgoyal2112007@gmail.com',
            passwordHash: password,
            role: 'OWNER'
          }
        }
      }
    });

    console.log('Shop restored:', shop.name);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
