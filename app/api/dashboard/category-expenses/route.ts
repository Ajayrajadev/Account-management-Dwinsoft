import { NextRequest, NextResponse } from 'next/server';

// Mock data - in production, calculate from actual transactions
export async function GET() {
  const data = [
    { category: 'Food', amount: 1200, percentage: 30 },
    { category: 'Transport', amount: 800, percentage: 20 },
    { category: 'Utilities', amount: 600, percentage: 15 },
    { category: 'Entertainment', amount: 400, percentage: 10 },
    { category: 'Shopping', amount: 300, percentage: 7.5 },
  ];

  return NextResponse.json(data);
}

