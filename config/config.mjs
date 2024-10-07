import dotenv from 'dotenv';


// Load env variable
dotenv.config({ path: './.env' });

export default {
  port: process.env.PORT || 3000,
  clientUrl: process.env.CLIENT_URL,
  externalApi: {
    host: process.env.EXTERNAL_API_HOST,
    key: process.env.EXTERNAL_API_KEY,
    secret: process.env.EXTERNAL_API_SECRET,
  },
};