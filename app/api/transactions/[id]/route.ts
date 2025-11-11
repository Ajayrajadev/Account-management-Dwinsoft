import { NextRequest, NextResponse } from 'next/server';

// Import the shared transactions map from the main route
// In production, use a database
const transactionsMap = new Map<string, any>();

// This would be shared with the main route in a real app
// For now, we'll use a simple approach - in production, use a database
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // In production, fetch from database
  // For now, return a placeholder
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  
  // Ensure type is preserved correctly
  if (body.type && body.type !== 'credit' && body.type !== 'debit') {
    return NextResponse.json(
      { error: 'Invalid transaction type. Must be "credit" or "debit"' },
      { status: 400 }
    );
  }
  
  // In production, update in database
  const updated = {
    id: params.id,
    ...body,
    // Explicitly preserve type if provided
    type: body.type || undefined,
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // In production, delete from database
  return NextResponse.json({ success: true });
}

