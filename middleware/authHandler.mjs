import ErrorResponse from '../models/ErrorResponseModel.mjs';
import { sessionStore } from '../utilities/SessionStore.mjs';
import CookieHandler from '../utilities/CookieHandler.mjs';

// Main protection middleware that chains session and JWT validation
export const protect = async (req, res, next) => {
  console.log("......Protecting route activated.....");
  const cookie = req.cookies.session;

  if(!cookie) {
    return next(new ErrorResponse(401, 'Not authorized', 'internal'));
  }

  const cookieData = JSON.parse(cookie);

  if(!cookieData) {
    return next(new ErrorResponse(401, 'Invalid cookie data session', 'internal'));
  }
  
  console.log("Cookie data: ", cookieData);

  if (!sessionStore.validateSession(cookieData.sessionId)) {
    console.log("Session is invalid");
    const newCookie = new CookieHandler(res);

    newCookie.deleteCookie('session');
    
  } 
  next();
};



