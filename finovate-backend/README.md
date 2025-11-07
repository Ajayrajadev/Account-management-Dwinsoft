# Finovate Backend API

A comprehensive backend API for Finovate — Smart Account & Invoice Manager built with Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Features

### 📊 **Complete Financial Management**
- **Transactions Module**: Full CRUD for credits/debits with filtering and pagination
- **Invoice Module**: Professional invoice management with status tracking
- **Dashboard Module**: Real-time analytics and financial summaries
- **User Authentication**: JWT-based secure authentication

### 🛡️ **Enterprise-Grade Security**
- JWT authentication with refresh tokens
- Rate limiting and request validation
- CORS protection and security headers
- Input validation with Zod schemas
- SQL injection protection via Prisma

### 📈 **Advanced Features**
- **Pagination**: Efficient data loading for large datasets
- **Filtering & Search**: Advanced query capabilities
- **Batch Operations**: Bulk transaction creation
- **Real-time Analytics**: Dashboard summaries and charts
- **Audit Logging**: Comprehensive request and error logging

## 🏗️ **Architecture**

### **Technology Stack**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware pipeline
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod for request/response validation
- **Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Winston for structured logging

### **Project Structure**
```
src/
├── config/           # Configuration files
│   ├── env.ts       # Environment validation
│   └── database.ts  # Prisma client setup
├── controllers/     # Route handlers
│   ├── transactions.controller.ts
│   ├── invoices.controller.ts
│   └── dashboard.controller.ts
├── middlewares/     # Express middlewares
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── routes/          # API route definitions
│   ├── transactions.routes.ts
│   ├── invoices.routes.ts
│   └── dashboard.routes.ts
├── types/           # TypeScript type definitions
│   └── index.ts     # Zod schemas and types
├── utils/           # Utility functions
│   └── logger.ts    # Winston logger setup
├── app.ts           # Express app configuration
└── server.ts        # Server startup and shutdown
```

## 🚦 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### **1. Installation**
```bash
cd finovate-backend
npm install
```

### **2. Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/finovate_db"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS (comma-separated origins)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### **3. Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR run migrations (for production)
npm run db:migrate

# Optional: Open Prisma Studio
npm run db:studio
```

### **4. Development**
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📚 **API Documentation**

### **Interactive Documentation**
- **Swagger UI**: `http://localhost:5000/api/docs`
- **Health Check**: `http://localhost:5000/health`

### **Core Endpoints**

#### **🔐 Authentication**
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/refresh     # Refresh JWT token
```

#### **💰 Transactions**
```http
GET    /api/transactions              # List transactions (with filters)
POST   /api/transactions              # Create transaction
POST   /api/transactions/batch        # Create multiple transactions
GET    /api/transactions/categories   # Get category summaries
GET    /api/transactions/:id          # Get specific transaction
PUT    /api/transactions/:id          # Update transaction
DELETE /api/transactions/:id          # Delete transaction
```

#### **🧾 Invoices**
```http
GET    /api/invoices              # List invoices (with filters)
POST   /api/invoices              # Create invoice
GET    /api/invoices/stats        # Get invoice statistics
GET    /api/invoices/:id          # Get specific invoice
PUT    /api/invoices/:id          # Update invoice
PATCH  /api/invoices/:id/status   # Update invoice status
POST   /api/invoices/:id/duplicate # Duplicate invoice
DELETE /api/invoices/:id          # Delete invoice
```

#### **📊 Dashboard**
```http
GET /api/dashboard/summary           # Complete dashboard summary
GET /api/dashboard/income-expense    # Income vs expense data
GET /api/dashboard/category-expenses # Category breakdown
GET /api/dashboard/goal             # Get monthly goal
PUT /api/dashboard/goal             # Update monthly goal
```

## 🔧 **API Usage Examples**

### **Create Transaction**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "DEBIT",
    "description": "Coffee meeting",
    "category": "Business",
    "amount": 25.50,
    "date": "2024-01-15T10:00:00Z"
  }'
```

### **Create Invoice**
```bash
curl -X POST http://localhost:5000/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "clientName": "Acme Corp",
    "clientEmail": "billing@acme.com",
    "items": [
      {
        "name": "Web Development",
        "description": "Frontend development",
        "quantity": 40,
        "rate": 75,
        "amount": 3000
      }
    ],
    "subtotal": 3000,
    "taxAmount": 240,
    "totalAmount": 3240,
    "dueDate": "2024-02-15T00:00:00Z"
  }'
```

### **Get Dashboard Summary**
```bash
curl -X GET http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔍 **Query Parameters**

### **Pagination**
```http
GET /api/transactions?page=1&limit=10
```

### **Filtering**
```http
GET /api/transactions?type=DEBIT&category=Food&dateFrom=2024-01-01&dateTo=2024-01-31
```

### **Search**
```http
GET /api/transactions?search=coffee
GET /api/invoices?search=acme&status=PENDING
```

## 🛠️ **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

### **Database Schema**

#### **Users**
```sql
- id (UUID, Primary Key)
- email (String, Unique)
- password (String, Hashed)
- name (String)
- role (Enum: USER, ADMIN, STAFF)
- createdAt, updatedAt (DateTime)
```

#### **Transactions**
```sql
- id (UUID, Primary Key)
- userId (UUID, Foreign Key)
- type (Enum: CREDIT, DEBIT)
- description (String)
- category (String, Optional)
- amount (Float)
- date (DateTime)
- recurring (Boolean)
- recurringType (Enum, Optional)
- recurringEndDate (DateTime, Optional)
- createdAt, updatedAt (DateTime)
```

#### **Invoices**
```sql
- id (UUID, Primary Key)
- userId (UUID, Foreign Key)
- invoiceNumber (String, Unique)
- clientName (String)
- clientEmail (String, Optional)
- clientPhone (String, Optional)
- clientAddress (String, Optional)
- items (JSON Array)
- subtotal (Float)
- taxAmount (Float)
- totalAmount (Float)
- status (Enum: PENDING, PAID, OVERDUE, CANCELLED)
- issueDate (DateTime)
- dueDate (DateTime, Optional)
- paidDate (DateTime, Optional)
- notes (String, Optional)
- createdAt, updatedAt (DateTime)
```

## 🔒 **Security**

### **Authentication Flow**
1. **Registration/Login**: User provides credentials
2. **JWT Generation**: Server returns access token
3. **Request Authorization**: Client includes `Bearer TOKEN` in headers
4. **Token Validation**: Server validates and extracts user info

### **Security Measures**
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Signed with secret key, configurable expiration
- **Rate Limiting**: Configurable request limits per IP
- **Input Validation**: Zod schemas for all endpoints
- **CORS Protection**: Configurable allowed origins
- **Security Headers**: Helmet.js for security headers

## 🚀 **Deployment**

### **Production Setup**
```bash
# Install dependencies
npm ci --only=production

# Build application
npm run build

# Run database migrations
npm run db:migrate

# Start production server
npm start
```

### **Environment Variables (Production)**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/finovate
JWT_SECRET=your-super-secure-production-secret
CORS_ORIGIN=https://yourdomain.com
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 **Monitoring & Logging**

### **Logging Levels**
- **Error**: Application errors and exceptions
- **Warn**: Warning conditions
- **Info**: General application flow
- **Debug**: Detailed debugging information (development only)

### **Log Files**
- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All log levels
- Console output in development

## 🧪 **Testing**

### **Test Structure**
```bash
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/           # End-to-end tests
```

### **Running Tests**
```bash
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Test coverage report
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

For support and questions:
- **Documentation**: [API Docs](http://localhost:5000/api/docs)
- **Issues**: [GitHub Issues](https://github.com/finovate/backend/issues)
- **Email**: support@finovate.com

---

**Finovate Backend API** - Professional financial management for modern applications.
