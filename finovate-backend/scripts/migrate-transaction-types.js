const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateTransactionTypes() {
  try {
    console.log('Starting transaction type migration...');
    
    // Update lowercase 'credit' to uppercase 'CREDIT'
    const creditUpdated = await prisma.transaction.updateMany({
      where: {
        type: 'credit'
      },
      data: {
        type: 'CREDIT'
      }
    });
    
    // Update lowercase 'debit' to uppercase 'DEBIT'
    const debitUpdated = await prisma.transaction.updateMany({
      where: {
        type: 'debit'
      },
      data: {
        type: 'DEBIT'
      }
    });
    
    console.log(`Migration completed successfully!`);
    console.log(`- Updated ${creditUpdated.count} credit transactions`);
    console.log(`- Updated ${debitUpdated.count} debit transactions`);
    
    // Verify the migration
    const allTransactions = await prisma.transaction.findMany({
      select: {
        type: true
      }
    });
    
    const typeCounts = allTransactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nCurrent transaction type distribution:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`- ${type}: ${count} transactions`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateTransactionTypes();
