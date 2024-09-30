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

// Load env variables
dotenv.config({ path: './config/.env' });

const app = express();

// Body parser
app.use(express.json());

// Enable CORS for specified origin
const corsOptions = {
    origin: config.CLIENT_URL,
    optionsSuccessStatus: 200,
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


// Define root route
app.get('/', (req, res) => {
    res.send('Server is up and running - CALL WORKS!');
    console.log(chalk.magenta.bold('Server is up and running - CALL WORKS!'));
  });
  
// Endpoints
app.use('/api/v1/auth', authRouter)

const PORT = process.env.PORT || 3000;
const SERVER = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle problems (Rejections) that are not being handled elsewhere in the application...
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    SERVER.close(() => process.exit(1));
});