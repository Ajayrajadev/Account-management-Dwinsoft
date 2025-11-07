import { NextRequest, NextResponse } from 'next/server';

// Mock data - in production, calculate from actual transactions and invoices
export async function GET() {
  const summary = {
    totalBalance: 15000,
    totalInvoiceAmount: 5500,
    monthlyIncome: 5000,
    monthlyExpenses: 3000,
    monthlyProfit: 2000,
    monthlyGoal: 5000,
  };

  return NextResponse.json(summary);
}

