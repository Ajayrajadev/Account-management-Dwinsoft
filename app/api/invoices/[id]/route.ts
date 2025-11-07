import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // In production, fetch from database
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  
  // Recalculate totals if items changed
  let updated = { ...body };
  if (body.items) {
    const subtotal = body.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.rate,
      0
    );
    const discountAmount =
      body.discountType === 'percentage'
        ? (subtotal * body.discount) / 100
        : body.discount;
    const afterDiscount = subtotal - discountAmount;
    const tax = (afterDiscount * body.taxRate) / 100;
    const total = afterDiscount + tax;
    
    updated = {
      ...body,
      items: body.items.map((item: any, idx: number) => ({
        id: String(idx + 1),
        ...item,
        total: item.quantity * item.rate,
      })),
      subtotal,
      tax,
      total,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updated = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
  }
  
  // In production, update in database
  return NextResponse.json({ id: params.id, ...updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // In production, delete from database
  return NextResponse.json({ success: true });
}

