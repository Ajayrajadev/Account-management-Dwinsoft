import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@finovate.com' },
    update: {},
    create: {
      email: 'demo@finovate.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'USER',
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create sample transactions
  const transactions = [
    {
      type: 'CREDIT',
      description: 'Salary Payment',
      category: 'Salary',
      amount: 5000,
      date: new Date('2024-01-01'),
      userId: user.id,
    },
    {
      type: 'DEBIT',
      description: 'Grocery Shopping',
      category: 'Food',
      amount: 150,
      date: new Date('2024-01-02'),
      userId: user.id,
    },
    {
      type: 'DEBIT',
      description: 'Gas Station',
      category: 'Transportation',
      amount: 60,
      date: new Date('2024-01-03'),
      userId: user.id,
    },
    {
      type: 'CREDIT',
      description: 'Freelance Project',
      category: 'Freelance',
      amount: 1200,
      date: new Date('2024-01-05'),
      userId: user.id,
    },
    {
      type: 'DEBIT',
      description: 'Coffee Shop',
      category: 'Food',
      amount: 25,
      date: new Date('2024-01-06'),
      userId: user.id,
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log('✅ Created sample transactions');

  // Create sample invoices
  const invoices = [
    {
      invoiceNumber: 'INV-0001',
      clientName: 'Acme Corporation',
      clientEmail: 'billing@acme.com',
      clientAddress: '123 Business St, City, State 12345',
      items: [
        {
          name: 'Web Development',
          description: 'Frontend development services',
          quantity: 40,
          rate: 75,
          amount: 3000,
        },
        {
          name: 'UI/UX Design',
          description: 'User interface design',
          quantity: 20,
          rate: 85,
          amount: 1700,
        },
      ],
      subtotal: 4700,
      taxAmount: 376,
      totalAmount: 5076,
      status: 'PAID',
      issueDate: new Date('2024-01-10'),
      dueDate: new Date('2024-02-10'),
      paidDate: new Date('2024-01-25'),
      notes: 'Thank you for your business!',
      userId: user.id,
    },
    {
      invoiceNumber: 'INV-0002',
      clientName: 'Tech Startup Inc',
      clientEmail: 'finance@techstartup.com',
      items: [
        {
          name: 'Mobile App Development',
          description: 'React Native app development',
          quantity: 60,
          rate: 80,
          amount: 4800,
        },
      ],
      subtotal: 4800,
      taxAmount: 384,
      totalAmount: 5184,
      status: 'PENDING',
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      notes: 'Payment terms: Net 30 days',
      userId: user.id,
    },
  ];

  for (const invoice of invoices) {
    await prisma.invoice.create({
      data: {
        ...invoice,
        items: JSON.stringify(invoice.items),
      },
    });
  }

  console.log('✅ Created sample invoices');

  // Create settings
  await prisma.settings.createMany({
    data: [
      {
        key: `monthly_goal_${user.id}`,
        value: '2000',
      },
      {
        key: 'app_version',
        value: '1.0.0',
      },
    ],
  });

  console.log('✅ Created settings');

  console.log('🎉 Database seeding completed!');
  console.log('📧 Demo login: demo@finovate.com');
  console.log('🔑 Demo password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
