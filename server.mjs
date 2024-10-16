// ============================================================
// = IMPORTS
// ============================================================
import chalk from 'chalk';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import { generalLimiter } from './middleware/limitHandler.mjs';
import authRouter from './routes/auth-routes.mjs';
import config from './config/config.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';
import cookieParser from 'cookie-parser';

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
    console.log(chalk.magenta.bold('Server is up and running - CALL WORKS!'));
});

// Endpoints
app.use('/api/v1/auth', authRouter)

// ============================================================
// = ERROR HANDLING
// ============================================================
app.use(errorHandler);

// ============================================================
// = SERVER INITIALIZATION
// ============================================================
const PORT = process.env.PORT || 3000;
const SERVER = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ============================================================
// = UNHANDLED REJECTION HANDLER
// ============================================================
process.on('unhandledRejection', (err, promise) => {
    console.log(`Unhandled error: ${err.message}`);
    //SERVER.close(() => process.exit(1));
});