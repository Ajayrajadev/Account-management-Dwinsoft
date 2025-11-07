import { NextRequest, NextResponse } from 'next/server';

// Mock data store (in production, use a database)
let invoices: any[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    clientName: 'John Doe',
    clientPhone: '+1234567890',
    clientEmail: 'john@example.com',
    items: [
      { id: '1', name: 'Web Development', quantity: 10, rate: 100, total: 1000 },
    ],
    subtotal: 1000,
    tax: 100,
    taxRate: 10,
    discount: 0,
    discountType: 'percentage',
    total: 1100,
    status: 'pending',
    date: '2024-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const clientName = searchParams.get('clientName');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const search = searchParams.get('search');

  let filtered = [...invoices];

  if (status) {
    filtered = filtered.filter((inv) => inv.status === status);
  }
  if (clientName) {
    filtered = filtered.filter((inv) =>
      inv.clientName.toLowerCase().includes(clientName.toLowerCase())
    );
  }
  if (dateFrom) {
    filtered = filtered.filter((inv) => inv.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter((inv) => inv.date <= dateTo);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.clientName.toLowerCase().includes(searchLower)
    );
  }

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Calculate totals
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

  const invoiceNumber = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
  
  const newInvoice = {
    id: Date.now().toString(),
    invoiceNumber,
    ...body,
    items: body.items.map((item: any, index: number) => ({
      id: String(index + 1),
      ...item,
      total: item.quantity * item.rate,
    })),
    subtotal,
    tax,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  invoices.unshift(newInvoice);
  return NextResponse.json(newInvoice, { status: 201 });
}

