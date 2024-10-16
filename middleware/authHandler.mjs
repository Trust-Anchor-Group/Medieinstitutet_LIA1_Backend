import ErrorResponse from '../models/ErrorResponseModel.mjs';
import { authenticateJwt } from '../services/externalApiServices.mjs';
import CookieHandler from '../utilities/CookieHandler.mjs';

export const protect = async (req, res, next) => {

    const cookie = req.cookies.auth;

    if (!cookie) {
        return next(new ErrorResponse(401, 'No authentication cookie found', 'internal'));
    }

    let cookieData;

    try {
        cookieData = JSON.parse(cookie);
    } catch (error) {
        return next(new ErrorResponse(401, 'Invalid cookie data', 'internal'));
    }

    try {
        await authenticateJwt(cookieData.jwt);
    } catch (error) {
        const cookie = new CookieHandler(res);
        cookie.deleteCookie('auth');
        next(error);
    }

    next();
};