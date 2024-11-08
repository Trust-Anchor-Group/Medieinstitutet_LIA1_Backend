import ErrorResponse from "../models/ErrorResponseModel.mjs";
import {sessionStore} from "../utilities/SessionStore.mjs";

export const validateSession = async (req, res, next) => {
    console.log('....Validating session.....');
    try {
        //Get session cookie
        const sessionCookie = req.cookies.session;
    console.log('session cookie received: ', sessionCookie);
        if (!sessionCookie) {
            return next (new ErrorResponse(401, 'No session cookie found', 'internal'));
        }

        let sessionData;

        try {
            sessionData = JSON.parse(sessionCookie);
        } catch (error) {
            return next(new ErrorResponse(401, 'Invalid session data', 'internal'));
        }
        
        const session = sessionStore.getSession(sessionData.id);
        console.log('This is the session', session );
        if(!session) {
            console.error('Session validation error:', error);
            return next(new ErrorResponse(401, 'Invalid session', 'internal'));
        }

        //Checking if the session has expired
        const timeNow = Date.now();
        const expiresAt = new Date(session.expiresAt).getTime();

        if(timeNow >= expiresAt) {
            sessionStore.deleteSession(sessionData.id);
            return next(new ErrorResponse(401, 'Session expired', 'internal'));
        }

        req.session = session;
        req.sessionId = sessionData.id;

        next();
    } catch (error) {
        next(error);
    }
}