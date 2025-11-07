import { NextRequest, NextResponse } from 'next/server';

// Mock data - in production, calculate from actual transactions
export async function GET() {
  const data = [
    { month: 'Jan', income: 5000, expenses: 3000 },
    { month: 'Feb', income: 6000, expenses: 3500 },
    { month: 'Mar', income: 5500, expenses: 3200 },
    { month: 'Apr', income: 7000, expenses: 4000 },
  ];

  return NextResponse.json(data);
}

