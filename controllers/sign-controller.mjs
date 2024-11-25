// controllers/sign-controller.mjs

import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ResponseModel from "../models/ResponseModel.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import { userInfo, getIds } from "../services/externalApiServices.mjs";
import generateHash from "../utilities/hashUtils.mjs";
import config from "../config/config.mjs";

// Controller endpoint for retrieving user signing credentials
// Requires authentication and generates secure signing keys
export const getSigningCredentials = asyncHandler(async (req, res, next) => {
   // Verify authentication cookie exists
   const cookie = req.cookies.auth;
   if (!cookie) {
       return next(new ErrorResponse(401, 'Authentication required', 'internal'));
   }

   try {
       // Extract and validate user data from auth cookie
       const cookieData = JSON.parse(cookie);
       
       // Fetch user details from external service using JWT
       const userData = await userInfo(cookieData.jwt);
       
       // Generate secure signing credentials based on user data
       const credentials = generateKeyCredentials(userData.eMail, userData.userName);

       // Return combined response with legal ID and generated credentials
       res.status(200).json(new ResponseModel(200, 'Signing credentials retrieved', {
           // Optional chain to safely access nested identity ID
           legalId: (await getIds(cookieData.jwt))?.Identities[0]?.id,
           ...credentials
       }));
   } catch (error) {
       // Forward any errors to error handling middleware
       next(error);
   }
});

// Generates secure key credentials using user information
// Uses salted hashing for both key ID and password generation
const generateKeyCredentials = (email, username) => {
   return {
       // Create unique but reproducible key ID from user data
       userKeyId: generateHash(config.keyIdSalt, email, username),
       // Generate secure key password with different salt
       userKeyPassword: generateHash(config.keyPasswordSalt, email, username)
   }
};