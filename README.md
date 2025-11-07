# Dwinsoft — Smart Account & Invoice Manager

A responsive web application for managing finances, transactions, and invoices built with Next.js 14, TypeScript, Tailwind CSS, and modern UI components.

## Features

- 📊 **Dashboard**: Overview with stats, charts, and quick actions
- 💰 **Transactions**: Manage income and expenses with batch add support
- 📄 **Invoices**: Create, manage, and track invoices with client information
- 🎨 **Modern UI**: Built with ShadCN UI components and Framer Motion animations
- 🌓 **Theme Support**: Light/Dark mode with system preference detection
- 📱 **Responsive**: Mobile-first design that works down to 640px
- ✅ **Form Validation**: Zod schemas for type-safe form validation
- 🔄 **State Management**: Zustand for efficient client-side state
- 📈 **Charts**: Recharts for data visualization

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 🚀 Quick Start

### Automated Setup (Recommended)

**For Mac/Linux:**
```bash
git clone <repository-url>
cd "project 3"
./setup.sh
```

**For Windows:**
```bash
git clone <repository-url>
cd "project 3"
setup.bat
```

### Manual Setup

#### Prerequisites

- Node.js 18+ 
- npm or yarn

#### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "project 3"
```

2. **Quick Web App Setup:**
```bash
npm run setup:web
```

3. **Complete Setup Guide:**
See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions

4. Create a `.env.local` file (optional):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/              # API routes (placeholder endpoints)
│   ├── auth/             # Authentication page
│   ├── dashboard/        # Dashboard page
│   ├── invoices/         # Invoices page
│   ├── settings/         # Settings page
│   ├── transactions/     # Transactions page
│   ├── layout.tsx        # Root layout with sidebar and header
│   └── page.tsx          # Home page (redirects to dashboard)
├── components/
│   ├── charts/           # Chart components
│   ├── layout/            # Layout components (Sidebar, Header)
│   ├── modals/            # Modal components (Forms, Dialogs)
│   └── ui/                # ShadCN UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API client
├── store/                 # Zustand stores
└── types/                 # TypeScript type definitions
```

## API Integration

The application includes placeholder API endpoints in the `app/api` directory. To connect to a real backend:

1. Update the `NEXT_PUBLIC_API_URL` environment variable
2. Modify the API client in `lib/api.ts` if needed
3. Replace the placeholder API routes with actual backend calls

### Available API Endpoints

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a transaction
- `POST /api/transactions/batch` - Batch create transactions
- `PUT /api/transactions/[id]` - Update a transaction
- `DELETE /api/transactions/[id]` - Delete a transaction
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create an invoice
- `PUT /api/invoices/[id]` - Update an invoice
- `PATCH /api/invoices/[id]/paid` - Mark invoice as paid
- `PATCH /api/invoices/[id]/unpaid` - Mark invoice as unpaid
- `DELETE /api/invoices/[id]` - Delete an invoice
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/income-expense` - Get income/expense data
- `GET /api/dashboard/category-expenses` - Get category expenses

## Features in Detail

### Dashboard
- Financial overview cards (Balance, Income, Expenses, Profit)
- Income vs Expenses chart
- Top expense categories pie chart
- Recent transactions and invoices
- Monthly goal tracker
- Quick action buttons

### Transactions
- Table view with filtering and sorting
- Batch add multiple transactions
- Category-based filtering
- Date range filtering
- Search functionality
- Edit and delete actions

### Invoices
- Create invoices with dynamic item rows
- Auto-calculation of totals, tax, and discounts
- Invoice status management (Paid/Pending)
- Client information management
- Invoice duplication
- PDF download placeholder
- Email sending placeholder

### Settings
- Theme customization
- Account settings
- Data export placeholders
- API configuration

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Building for Production

```bash
npm run build
npm start
```

## Future Enhancements

- CSV/Excel export for transactions and invoices
- Client management page
- PDF generation for invoices
- Email integration for invoice sending
- Recurring transaction management
- Advanced reporting and analytics
- Multi-currency support
- User authentication and authorization

## License

MIT

## Support

For issues and questions, please open an issue on the repository.

# Account-management-Dwinsoft
