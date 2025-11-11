const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugTransactions() {
  try {
    console.log('Checking all transactions...');
    
    const transactions = await prisma.transaction.findMany({
      select: { 
        id: true, 
        type: true, 
        description: true, 
        amount: true, 
        category: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${transactions.length} transactions:`);
    transactions.forEach((t, index) => {
      console.log(`${index + 1}. ID: ${t.id.slice(0, 8)}..., Type: '${t.type}', Description: '${t.description}', Amount: ${t.amount}, Category: ${t.category}`);
    });
    
    // Check if there are any transactions with wrong types
    const wrongTypes = transactions.filter(t => t.type !== 'CREDIT' && t.type !== 'DEBIT');
    if (wrongTypes.length > 0) {
      console.log('\n⚠️  Found transactions with incorrect types:');
      wrongTypes.forEach(t => {
        console.log(`- ID: ${t.id}, Type: '${t.type}' (should be CREDIT or DEBIT)`);
      });
    } else {
      console.log('\n✅ All transactions have correct types (CREDIT/DEBIT)');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTransactions();
