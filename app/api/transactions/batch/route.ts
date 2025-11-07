import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // In production, save to database
  const newTransactions = body.map((t: any) => ({
    id: `${Date.now()}-${Math.random()}`,
    ...t,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  return NextResponse.json(newTransactions, { status: 201 });
}

