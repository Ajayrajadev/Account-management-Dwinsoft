import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // In production, update status in database
  return NextResponse.json({
    id: params.id,
    status: 'pending',
    updatedAt: new Date().toISOString(),
  });
}

