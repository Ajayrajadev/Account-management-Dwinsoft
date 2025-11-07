import { NextRequest, NextResponse } from 'next/server';

// Mock data - in production, store in database
let monthlyGoal = 5000;

export async function PUT(request: NextRequest) {
  const body = await request.json();
  monthlyGoal = body.goal;
  return NextResponse.json({ goal: monthlyGoal });
}

export async function GET() {
  return NextResponse.json({ goal: monthlyGoal });
}

