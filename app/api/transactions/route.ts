import { NextRequest, NextResponse } from 'next/server';

// Mock data store (in production, use a database)
let transactions: any[] = [
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const search = searchParams.get('search');

  let filtered = [...transactions];

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

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newTransaction = {
    id: Date.now().toString(),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  transactions.unshift(newTransaction);
  return NextResponse.json(newTransaction, { status: 201 });
}

