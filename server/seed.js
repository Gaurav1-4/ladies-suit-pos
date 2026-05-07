const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Cleaning database...');
    // Order matters due to foreign keys
    await prisma.transactionItem.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.purchaseItem.deleteMany({});
    await prisma.purchase.deleteMany({});
    await prisma.stockMovement.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.shop.deleteMany({});

    console.log('Seeding Shop...');
    const shop = await prisma.shop.create({
      data: {
        name: 'Gaurav Ladies Suit Collection',
        address: 'Main Market, Delhi',
        phone: '9876543210'
      }
    });

    console.log('Seeding Users...');
    const ownerPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);

    const owner = await prisma.user.create({
      data: {
        shopId: shop.id,
        name: 'Gaurav Owner',
        email: 'owner@store.com',
        passwordHash: ownerPassword,
        role: 'OWNER'
      }
    });

    await prisma.user.create({
      data: {
        shopId: shop.id,
        name: 'Amit Staff',
        email: 'staff@store.com',
        passwordHash: staffPassword,
        role: 'STAFF'
      }
    });

    console.log('Seeding Categories...');
    const categories = ['Suits', 'Salwar Kameez', 'Lehenga', 'Dupatta', 'Accessories'];
    const categoryMap = {};

    for (const name of categories) {
      const cat = await prisma.category.create({
        data: { shopId: shop.id, name }
      });
      categoryMap[name] = cat.id;
    }

    console.log('Seeding Products...');
    const products = [
      { name: 'Embroidered Silk Suit', category: 'Suits', cost: 1200, sell: 2500, stock: 20 },
      { name: 'Cotton Salwar Set', category: 'Salwar Kameez', cost: 500, sell: 1200, stock: 50 },
      { name: 'Bridal Red Lehenga', category: 'Lehenga', cost: 15000, sell: 35000, stock: 5 },
      { name: 'Chiffon Dupatta Blue', category: 'Dupatta', cost: 150, sell: 450, stock: 100 },
      { name: 'Designer Anarkali', category: 'Suits', cost: 2500, sell: 5500, stock: 15 },
      { name: 'Bangle Set (12pcs)', category: 'Accessories', cost: 100, sell: 300, stock: 200 },
      { name: 'Party Wear Gharara', category: 'Suits', cost: 3500, sell: 7500, stock: 10 },
      { name: 'Velvet Suit Piece', category: 'Suits', cost: 1800, sell: 4200, stock: 25 },
      { name: 'Gold Border Lehenga', category: 'Lehenga', cost: 8000, sell: 18000, stock: 8 },
      { name: 'Zari Work Dupatta', category: 'Dupatta', cost: 400, sell: 950, stock: 40 }
    ];

    for (const p of products) {
      await prisma.product.create({
        data: {
          shopId: shop.id,
          categoryId: categoryMap[p.category],
          name: p.name,
          costPrice: p.cost,
          sellPrice: p.sell,
          stockQty: p.stock,
          sku: `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        }
      });
    }

    console.log('Seeding complete! 🌱');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
