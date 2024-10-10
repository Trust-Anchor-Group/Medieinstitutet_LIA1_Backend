import ErrorResponse from '../models/ErrorResponseModel.mjs';
import { authenticateJwt } from '../services/externalApiServices.mjs';

export const protect = async (req, res, next) => {

    const cookie = req.cookies.auth;
    let cookieData;

    if (cookie) {
        try {
            cookieData = JSON.parse(cookie);
        } catch (error) {
            throw new ErrorResponse(401, 'Invalid cookie data', 'internal');
        }
    }

    const [bearer, jwt] = cookieData.jwt.split(' ');

    if (bearer !== 'Bearer' || !jwt) {
        return next(new ErrorResponse(401, 'Invalid authorization format', 'internal'));
    }

    try {
        await authenticateJwt(jwt);
    } catch (error) {
        next(error);
    }

    next();
};