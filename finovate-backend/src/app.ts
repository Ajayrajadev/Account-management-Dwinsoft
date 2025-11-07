import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middlewares/error.middleware';

// Import routes
import transactionRoutes from '@/routes/transactions.routes';
import invoiceRoutes from '@/routes/invoices.routes';
import dashboardRoutes from '@/routes/dashboard.routes';
import authRoutes from '@/routes/auth.routes';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Rate limiting (disabled in development)
if (env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    query: req.query,
  });
  next();
});

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finovate API',
      version: '1.0.0',
      description: 'Smart Account & Invoice Manager API',
      contact: {
        name: 'Finovate Team',
        email: 'support@finovate.com',
      },
    },
    servers: [
      {
        url: env.NODE_ENV === 'production' ? 'https://api.finovate.com' : `http://localhost:${env.PORT}`,
        description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        TransactionInput: {
          type: 'object',
          required: ['type', 'description', 'amount'],
          properties: {
            type: {
              type: 'string',
              enum: ['CREDIT', 'DEBIT'],
            },
            description: {
              type: 'string',
            },
            category: {
              type: 'string',
            },
            amount: {
              type: 'number',
              minimum: 0,
            },
            date: {
              type: 'string',
              format: 'date-time',
            },
            recurring: {
              type: 'boolean',
            },
            recurringType: {
              type: 'string',
              enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
            },
            recurringEndDate: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        InvoiceInput: {
          type: 'object',
          required: ['clientName', 'items', 'subtotal', 'totalAmount'],
          properties: {
            invoiceNumber: {
              type: 'string',
            },
            clientName: {
              type: 'string',
            },
            clientEmail: {
              type: 'string',
              format: 'email',
            },
            clientPhone: {
              type: 'string',
            },
            clientAddress: {
              type: 'string',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  quantity: { type: 'number' },
                  rate: { type: 'number' },
                  amount: { type: 'number' },
                },
              },
            },
            subtotal: {
              type: 'number',
            },
            taxAmount: {
              type: 'number',
            },
            totalAmount: {
              type: 'number',
            },
            issueDate: {
              type: 'string',
              format: 'date-time',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
            },
            notes: {
              type: 'string',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
            },
            error: {
              type: 'string',
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finovate API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

// API documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Finovate API Documentation',
}));

// API routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// Catch-all for undefined routes
app.use('*', notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
