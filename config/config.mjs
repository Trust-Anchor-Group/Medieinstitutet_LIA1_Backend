// config/config.mjs
import dotenv from 'dotenv';


// Load env variable
dotenv.config({ path: './.env' });

export default {
  port: process.env.PORT || 5001,
  clientUrl: process.env.CLIENT_URL,
  keyIdSalt: process.env.KEY_ID_SALT,
  keyPasswordSalt: process.env.KEY_PASSWORD_SALT,
  externalApi: {
    host: process.env.EXTERNAL_API_HOST,
    key: process.env.EXTERNAL_API_KEY,
    secret: process.env.EXTERNAL_API_SECRET,
  },
};