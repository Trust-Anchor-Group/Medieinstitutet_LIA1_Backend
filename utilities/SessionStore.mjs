import { v4 as uuidv4 } from 'uuid';

 class SessionStore {
   constructor() {
     this.sessions = new Map(); // In-memory store data-structure
   }

   //Create a new session
   createSession(jwt, expiresAt) {
     console.log('....Creating session.....');
     const sessionId = uuidv4().replaceAll('-', '');
     const session = {
       jwt,
       expiresAt: new Date(expiresAt).getTime(),
       createdAt: Date.now(),
       refreshTimer: null,
     };
     console.log('Session created: ', session);
     this.sessions.set(sessionId, session);
     return sessionId;
   }

   //Delete a session
   deleteSession(sessionId) {
     const session = this.sessions.get(sessionId);
     if (session && session.refreshTimer) {
       clearTimeout(session.refreshTimer);
     }

     return this.sessions.delete(sessionId);
   }

   getSession(sessionId) {
     return this.sessions.get(sessionId);
   }

   //Refresh session
   refreshSessionTimer(sessionId, callback, timeBeforeExpiry = 30000) {
     const session = this.sessions.get(sessionId);
     if (session) {
       if (session.refreshTimer) {
         clearTimeout(session.refreshTimer);
       }

       const timeNow = Date.now();
       const expiresAt = new Date(session.expiresAt).getTime();
       const timeUntilRefresh = Math.max(
         0,
         expiresAt - timeNow - timeBeforeExpiry
       );

       session.refreshTimer = setTimeout(() => {
         callback(sessionId);
       }, timeUntilRefresh);

       this.sessions.set(sessionId, session);

       return session;
     }
   }

   //Update a session
   updateSession(sessionId, jwt, expiresAt) {
     const session = this.sessions.get(sessionId);
     if (session) {
       if (session.refreshTimer) {
         clearTimeout(session.refreshTimer);
       }
       session.jwt = jwt;
       session.expiresAt = expiresAt;
       this.sessions.set(sessionId, session);
       return session;
     }
     return null;
   }

   //Validate session
   validateSession(sessionId) {
     if (!this.sessions.has(sessionId)) return false;
     const sessionData = this.sessions.get(sessionId);
     const timeNow = Date.now();
     console.log('Time now: ', timeNow);
     const expiresAt = sessionData.expiresAt;
     console.log('expiresat:', expiresAt); // Assuming sessionData.expiresAt is a Unix timestamp
     if (timeNow >= expiresAt) {
       this.deleteSession(sessionId);
       return false;
     }
     return true;
   }
 }

export const sessionStore = new SessionStore();