// src/server.mjs
import chalk from 'chalk';
import express from 'express';
import dotenv from 'dotenv';
import AgentAPI from './agentApi/agentApi.mjs';
import routes from './routes/index.mjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Configure AgentAPI
AgentAPI.Host = process.env.EXTERNAL_API_HOST;
AgentAPI.Domain = `https://${process.env.EXTERNAL_API_HOST}`;

// Define root route
app.get('/', (req, res) => {
  res.send('Server is up and running - CALL WORKS!');
  console.log(chalk.magenta.bold('Server is up and running - CALL WORKS!'));
});

// Use the combined routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});