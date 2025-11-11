# Finovate Mobile App

A React Native mobile application for financial management, built with Expo. This app connects to the same backend as the desktop application, providing a seamless cross-platform experience.

## Features

### 📱 Mobile-First Design
- **Native iOS & Android Support** - Built with React Native and Expo
- **Responsive UI** - Optimized for mobile screens
- **Touch-Friendly Interface** - Designed for mobile interaction patterns

### 🔐 Authentication
- **Secure Login** - JWT-based authentication
- **Auto-Login** - Demo credentials for easy testing
- **Session Management** - Automatic token handling

### 📊 Dashboard
- **Financial Overview** - Total balance, invoice amounts, monthly summaries
- **Visual Data** - Chart placeholders for income/expense visualization
- **Recent Activity** - Latest transactions and invoices

### 💰 Transaction Management
- **View Transactions** - List all income and expenses
- **Real-time Totals** - Income, expenses, and net balance calculations
- **Category Breakdown** - Organized by transaction categories
- **Pull-to-Refresh** - Easy data synchronization

### 🧾 Invoice Management
- **Invoice List** - View all invoices with status indicators
- **Status Updates** - Mark invoices as paid/unpaid
- **Client Information** - Complete invoice details
- **Payment Tracking** - Automatic transaction creation on payment

### ⚙️ Settings
- **Profile Management** - User account information
- **App Preferences** - Theme, language, currency settings (coming soon)
- **Data & Privacy** - Export options and privacy controls
- **Support** - Help and contact information

## Technology Stack

### Frontend (Mobile)
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and toolchain
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **Zustand** (via Context API) - State management
- **Axios** - HTTP client for API requests
- **AsyncStorage** - Local data persistence
- **Expo Vector Icons** - Icon library

### Backend Integration
- **Same Backend** - Uses the existing Express.js backend
- **RESTful APIs** - Standard HTTP API communication
- **JWT Authentication** - Secure token-based auth
- **Real-time Sync** - Automatic data synchronization

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. **Navigate to the mobile app directory:**
   ```bash
   cd finovate-mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npm start
   ```

4. **Run on specific platforms:**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web browser (for testing)
   npm run web
   ```

### Backend Setup

Make sure the backend server is running:

1. **Navigate to backend directory:**
   ```bash
   cd ../finovate-backend
   ```

2. **Start the backend server:**
   ```bash
   npm run dev
   ```

The mobile app expects the backend to be running on `http://localhost:5000`

### Demo Credentials

The app comes with demo credentials for easy testing:
- **Email:** demo@finovate.com
- **Password:** password123

## Project Structure

```
finovate-mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   │   └── AuthContext.tsx # Authentication context
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx # Main navigation setup
│   ├── screens/           # Screen components
│   │   ├── DashboardScreen.tsx
│   │   ├── TransactionsScreen.tsx
│   │   ├── InvoicesScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── LoadingScreen.tsx
│   ├── services/          # API services
│   │   └── api.ts         # API client configuration
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Shared types
│   └── utils/             # Utility functions
├── App.tsx                # Main app component
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## API Integration

The mobile app integrates with the same backend APIs:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Dashboard
- `GET /api/dashboard/summary` - Dashboard overview
- `GET /api/dashboard/income-expense` - Income/expense data
- `GET /api/dashboard/category-expenses` - Category breakdown

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `PATCH /api/invoices/:id/paid` - Mark as paid
- `PATCH /api/invoices/:id/unpaid` - Mark as unpaid
- `DELETE /api/invoices/:id` - Delete invoice

## Features in Development

### 🚧 Coming Soon
- **Charts & Visualizations** - Interactive charts for better data visualization
- **Transaction Forms** - Add/edit transactions from mobile
- **Invoice Creation** - Create new invoices on mobile
- **Push Notifications** - Real-time updates and reminders
- **Offline Support** - Work without internet connection
- **Dark Mode** - Theme switching
- **Multi-language** - Internationalization support
- **Biometric Auth** - Fingerprint/Face ID login

### 🎯 Future Enhancements
- **Camera Integration** - Receipt scanning
- **Export Features** - PDF generation and sharing
- **Backup & Sync** - Cloud data synchronization
- **Advanced Filters** - Enhanced search and filtering
- **Recurring Transactions** - Automated transaction creation
- **Budget Tracking** - Spending limits and alerts

## Development

### Running in Development
```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Building for Production
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### Testing
```bash
# Run tests (when implemented)
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## License

This project is part of the Finovate application suite and follows the same licensing terms.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Finovate Mobile** - Your finances, anywhere you go! 📱💰
