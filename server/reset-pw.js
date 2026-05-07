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
    await prisma.user.update({
      where: { email: 'gauravgoyal2112007@gmail.com' },
      data: { passwordHash: password }
    });
    console.log('Password reset for gauravgoyal2112007@gmail.com');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
