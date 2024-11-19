// server.mjs
// ============================================================
// = IMPORTS
// ============================================================
import chalk from 'chalk';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import { generalLimiter } from './middleware/limitHandler.mjs';
import authRouter from './routes/auth-routes.mjs';
import contractRouter from './routes/contract-routes.mjs';
import config from './config/config.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';
import cookieParser from 'cookie-parser';
import winston from 'winston';
import './listeners/index.mjs';
import DataInitializationService from './services/dataInitializationService.mjs';
import signRouter from './routes/sign-routes.mjs';

// ============================================================
// = LOGGER CONFIGURATION
// ============================================================
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Initialize services
const dataInitService = new DataInitializationService(logger);

const app = express();

// ============================================================
// = MIDDLEWARE
// ============================================================
// Body parser
app.use(express.json());
app.use(cookieParser());

// Enable CORS for specified origin
const corsOptions = {
  origin: config.clientUrl,
  optionsSuccessStatus: 200,
  credentials: true, // Allow credentials (cookies) to be sent
};
app.use(cors(corsOptions));

// Secure app with HTTP headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting (DDOS protection)
app.use(generalLimiter);

// Prevent HPP attacks (http parameter pollution)
app.use(hpp());

// ============================================================
// = ROUTES
// ============================================================
// Define root route
app.get('/', (req, res) => {
  res.send('Server is up and running - CALL WORKS!');
  logger.info('Root route accessed');
});

// Endpoints
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/contracts', contractRouter);
app.use('/api/v1/sign', signRouter);

// ============================================================
// = ERROR HANDLING
// ============================================================
app.use((err, req, res, next) => {
    errorHandler(err, req, res, next, logger);
});

// ============================================================
// = SERVER INITIALIZATION
// ============================================================
const startServer = async () => {
    try {
        // Initialize data directory and required files
        await dataInitService.initialize();

        const PORT = process.env.PORT || 5001;
        const SERVER = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

        // Periodic server status logging
        setInterval(() => {
            logger.info('Server is still running');
        }, 300000);

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

// ============================================================
// = UNHANDLED REJECTION HANDLER
// ============================================================
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Keep the server running, don't exit
});

// ============================================================
// = UNCAUGHT EXCEPTION HANDLER
// ============================================================
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  // Keep the server running, don't exit
});