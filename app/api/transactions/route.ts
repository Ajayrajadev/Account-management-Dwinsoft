import { NextRequest, NextResponse } from 'next/server';

// Mock data store (in production, use a database)
// Using a Map to persist across requests in development
const transactionsMap = new Map<string, any>();

// Initialize with sample data if empty
if (transactionsMap.size === 0) {
  const initialTransactions = [
    {
      id: '1',
      type: 'credit',
      description: 'Salary',
      category: 'Salary',
      amount: 5000,
      date: '2024-01-15',
      recurring: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'debit',
      description: 'Groceries',
      category: 'Food',
      amount: 150,
      date: '2024-01-16',
      recurring: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  initialTransactions.forEach((t) => transactionsMap.set(t.id, t));
}

function getTransactionsArray() {
  return Array.from(transactionsMap.values());
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const search = searchParams.get('search');

  let filtered = getTransactionsArray();

  if (type) {
    filtered = filtered.filter((t) => t.type === type);
  }
  if (category) {
    filtered = filtered.filter((t) => t.category === category);
  }
  if (dateFrom) {
    filtered = filtered.filter((t) => t.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter((t) => t.date <= dateTo);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
    );
  }

  // Sort by date descending (newest first)
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate and ensure type is preserved correctly
  if (!body.type || (body.type !== 'credit' && body.type !== 'debit')) {
    return NextResponse.json(
      { error: 'Invalid transaction type. Must be "credit" or "debit"' },
      { status: 400 }
    );
  }

  const newTransaction = {
    id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
    type: body.type, // Explicitly preserve type
    description: body.description || '',
    category: body.category || '',
    amount: Number(body.amount) || 0,
    date: body.date || new Date().toISOString().split('T')[0],
    recurring: Boolean(body.recurring) || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  transactionsMap.set(newTransaction.id, newTransaction);
  
  return NextResponse.json(newTransaction, { status: 201 });
}

