import { v4 as uuidv4 } from 'uuid';

export default class SessionStore {
    constructor () {
        this.sessions = new Map(); // In-memory store data-structure
    } 

    //Create a new session
    createSession (jwt, expiresAt) {
        const sessionId = uuidv4().replaceAll('-', '');
        const session = {
            jwt,
            expiresAt,
            refreshTimer: null
        };

        this.sessions.set(sessionId, session);
        return sessionId;
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    //Update a session
    updateSession (sessionId, jwt, expiresAt) {
        const session = this.sessions.get(sessionId);
        if(session){
            if(session.refreshTimer) {
                clearTimeout(session.refreshTimer);
            }
            session.jwt = jwt;
            session.expiresAt = expiresAt;
            this.sessions.set(sessionId, session);
            return session;
        }
        return null;
    }

    //Delete a session
    deleteSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if(session && session.refreshTimer) {
            clearTimeout(session.refreshTimer);
        }

        return this.sessions.delete(sessionId);
    }

    //Refresh session
    refreshSessionTimer(sessionId, callback, timeBeforeExpiry = 30000) {
        const session = this.sessions.get(sessionId);
        if(session){
            if(session.refreshTimer) {
                clearTimeout(session.refreshTimer);
            }

            const timeNow = Date.now();
            const expiresAt = new Date(session.expiresAt).getTime();
            const timeUntilRefresh = Math.max(expiresAt - timeNow - timeBeforeExpiry);

              session.refreshTimer = setTimeout(() => {
                callback(sessionId);
              }, timeUntilRefresh);

              this.sessions.set(sessionId, session);

                return session;
        }
    } 
}