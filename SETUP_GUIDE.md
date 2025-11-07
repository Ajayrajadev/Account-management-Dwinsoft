# 🚀 Finovate Application - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Quick Start (Recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "project 3"
```

### 2. Install Dependencies & Run Web App
```bash
# Install main web app dependencies
npm install

# Start the web application
npm run dev
```

The web app will be available at: **http://localhost:3000**

## 🖥️ Complete Setup (All Components)

### 📱 Web Application Setup

```bash
# 1. Navigate to project root
cd "project 3"

# 2. Install dependencies
npm install

# 3. Create environment file (optional)
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Run development server
npm run dev

# 5. Build for production (optional)
npm run build
npm start
```

**Access:** http://localhost:3000

### 🖥️ Desktop Application Setup

```bash
# 1. Navigate to desktop app directory
cd finovate-desktop

# 2. Install desktop app dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit with desktop-specific configuration

# 4. Run desktop app in development
npm run dev

# 5. Build desktop app (creates executable)
npm run build
npm run electron

# 6. Package for distribution
npm run dist
```

**Note:** Desktop app will open as an Electron window

### 🔧 Backend API Setup (Optional)

```bash
# 1. Navigate to backend directory
cd finovate-backend

# 2. Install backend dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database and API configuration

# 4. Set up database
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. Start backend server
npm run dev
```

**Access:** http://localhost:8000 (or configured port)

## 📁 Project Structure

```
project 3/
├── 📱 Web App (Next.js)          # Main web application
├── 🖥️ finovate-desktop/          # Electron desktop app
├── 🔧 finovate-backend/          # Backend API (Node.js)
├── 📦 components/                # Shared UI components
├── 🗂️ store/                     # State management
└── 📋 Documentation files
```

## ⚡ Available Scripts

### Web Application
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
```

### Desktop Application
```bash
cd finovate-desktop
npm run dev          # Start Electron in development
npm run build        # Build the app
npm run electron     # Run built Electron app
npm run dist         # Package for distribution
npm run pack         # Create installer packages
```

### Backend API
```bash
cd finovate-backend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## 🌐 Environment Variables

### Web App (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_ENV=development
```

### Desktop App (finovate-desktop/.env.local)
```env
ELECTRON_IS_DEV=true
DATABASE_PATH=./data/app.db
```

### Backend (finovate-backend/.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=8000
NODE_ENV=development
```

## 🚀 Deployment Options

### Web App Deployment
- **Vercel**: `npm run build` → Deploy to Vercel
- **Netlify**: `npm run build` → Deploy build folder
- **Docker**: Use provided Dockerfile

### Desktop App Distribution
```bash
cd finovate-desktop
npm run dist         # Creates installers for your platform
```

### Backend Deployment
- **Railway/Render**: Connect Git repository
- **Docker**: Use provided Dockerfile
- **VPS**: `npm run build` → `npm start`

## 🔧 Development Workflow

### 1. Web-Only Development
```bash
npm install
npm run dev
```

### 2. Full-Stack Development
```bash
# Terminal 1: Web App
npm run dev

# Terminal 2: Backend
cd finovate-backend
npm install
npm run dev

# Terminal 3: Desktop App (optional)
cd finovate-desktop
npm install
npm run dev
```

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

**2. Node Modules Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**3. TypeScript Errors**
```bash
# Check types
npm run typecheck

# Clear Next.js cache
rm -rf .next
npm run dev
```

**4. Database Issues (Backend)**
```bash
cd finovate-backend
rm -f prisma/dev.db
npm run db:migrate
npm run db:seed
```

**5. Electron Issues (Desktop)**
```bash
cd finovate-desktop
rm -rf dist node_modules
npm install
npm run build
```

## 📱 Features Available

### ✅ Web Application
- 📊 Dashboard with financial overview
- 💰 Transaction management
- 📄 Invoice creation and management
- ⚙️ Settings and preferences
- 🌓 Dark/Light theme support
- 📱 Responsive design

### ✅ Desktop Application
- 🖥️ Native desktop experience
- 💾 Local SQLite database
- 🔄 Data sync capabilities
- 📤 Export/Import functionality
- 🔒 Offline operation

### ✅ Backend API
- 🔐 JWT Authentication
- 📊 RESTful API endpoints
- 🗄️ PostgreSQL/SQLite support
- 📝 API documentation (Swagger)
- 🛡️ Input validation and security

## 🆘 Support

If you encounter any issues:

1. Check this setup guide
2. Review the error logs
3. Ensure all prerequisites are installed
4. Try the troubleshooting steps above
5. Check the individual README files in each directory

## 📚 Additional Documentation

- **Web App**: `/README.md`
- **Desktop App**: `/finovate-desktop/README.md`
- **Backend**: `/finovate-backend/README.md`
- **API Docs**: Available at `/api/docs` when backend is running

---

**🎉 You're all set! Your Finovate application should now be running successfully.**

For questions or issues, please refer to the documentation or create an issue in the repository.
