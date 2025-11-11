# 🚀 Finovate Production Deployment Guide

## 📋 Overview
This guide will help you deploy the Finovate application to a Linux server with the backend API hosted separately from the desktop/web client.

## 🏗️ Architecture
- **Backend**: Express.js API server with PostgreSQL database
- **Frontend**: Next.js application (can run as web app or desktop app)
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **API Communication**: RESTful API with CORS enabled

## 🖥️ Backend Deployment (Linux Server)

### Prerequisites
- Linux server (Ubuntu 20.04+ recommended)
- Node.js 18+ and npm
- PostgreSQL 14+
- PM2 (for process management)
- Nginx (for reverse proxy)

### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Database Setup
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE finovate_prod;
CREATE USER finovate_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE finovate_prod TO finovate_user;
\q
```

### Step 3: Deploy Backend Code
```bash
# Create application directory
sudo mkdir -p /var/www/finovate-backend
sudo chown $USER:$USER /var/www/finovate-backend

# Upload your backend code to /var/www/finovate-backend
# (Use scp, rsync, or git clone)

cd /var/www/finovate-backend

# Install dependencies
npm install --production

# Build the application
npm run build
```

### Step 4: Environment Configuration
Create `/var/www/finovate-backend/.env`:
```env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL="postgresql://finovate_user:your_secure_password@localhost:5432/finovate_prod"

# JWT
JWT_SECRET="your_super_secure_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="https://yourdomain.com,http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 5: Database Migration
```bash
cd /var/www/finovate-backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Seed with demo data
npm run db:seed
```

### Step 6: PM2 Process Management
```bash
cd /var/www/finovate-backend

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 7: Nginx Reverse Proxy
Create `/etc/nginx/sites-available/finovate-api`:
```nginx
server {
    listen 80;
    server_name your-api-domain.com;  # Replace with your API domain

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/finovate-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8: SSL Certificate (Optional but Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-api-domain.com
```

## 💻 Frontend Deployment Options

### Option 1: Web Application
Deploy the Next.js app to Vercel, Netlify, or your own server.

Update the API base URL in `/finovate-desktop/lib/api.ts`:
```typescript
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api'  // Your production API URL
  : 'http://localhost:5000/api';
```

### Option 2: Desktop Application
Users can run the desktop app locally and connect to your hosted API.

Update the API configuration and build the desktop app:
```bash
cd finovate-desktop
npm install
npm run build
npm start
```

## 🔧 Production Configuration

### Backend Security Checklist
- ✅ Environment variables properly set
- ✅ JWT secret is secure and unique
- ✅ Database credentials are secure
- ✅ CORS origins are restricted to your domains
- ✅ Rate limiting is enabled
- ✅ Helmet security headers are active
- ✅ Console logs cleaned up (debug logs removed)

### Frontend Configuration
Update `/finovate-desktop/lib/api.ts` with your production API URL:
```typescript
const api = axios.create({
  baseURL: 'https://your-api-domain.com/api',  // Your production API
  timeout: 10000,
});
```

## 📊 Monitoring & Maintenance

### PM2 Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs finovate-backend

# Restart application
pm2 restart finovate-backend

# Monitor resources
pm2 monit
```

### Database Backup
```bash
# Create backup
pg_dump -U finovate_user -h localhost finovate_prod > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U finovate_user -h localhost finovate_prod < backup_20231111.sql
```

## 🌐 API Endpoints
Your API will be available at: `https://your-api-domain.com/api/`

Key endpoints:
- `POST /auth/login` - User authentication
- `GET /dashboard/summary` - Dashboard data
- `GET /transactions` - Transaction list
- `GET /invoices` - Invoice list
- `POST /transactions` - Create transaction
- `POST /invoices` - Create invoice

## 🔍 Troubleshooting

### Common Issues
1. **Database connection errors**: Check DATABASE_URL and PostgreSQL service
2. **CORS errors**: Verify CORS_ORIGIN includes your frontend domain
3. **JWT errors**: Ensure JWT_SECRET is set and consistent
4. **Port conflicts**: Make sure port 5000 is available

### Log Locations
- **Application logs**: `pm2 logs finovate-backend`
- **Nginx logs**: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`
- **PostgreSQL logs**: `/var/log/postgresql/`

## 🎉 Success!
Your Finovate application is now deployed and ready for production use!

- **API**: https://your-api-domain.com/api
- **Documentation**: https://your-api-domain.com/api/docs (Swagger UI)
- **Health Check**: https://your-api-domain.com/api/health
