import { v4 as uuidv4 } from 'uuid';
import { authenticateJwt, refresh } from '../services/externalApiServices.mjs';
import config from '../config/config.mjs';
import { sseConnectionStore } from './SSEConnectionStore.mjs';

 class SessionStore {
   constructor() {
     this.sessions = new Map(); // In-memory store data-structure
   }

   //Create a new session
   createSession(jwt, expiresAt) {
     const sessionId = uuidv4().replaceAll('-', '');
     const session = {
       jwt,
       expiresAt,
       createdAt: Math.floor(Date.now() / 1000),
       refreshTimer: null,
     };

     this.setupRefreshTimer(sessionId, session)  // Here we track the timer for session creation for later tracking time update
  
     this.sessions.set(sessionId, session);
     return sessionId;
   }

   //Delete a session
   deleteSession(sessionId) {
     const session = this.sessions.get(sessionId);
     
     if (session && session.refreshTimer) {
       clearTimeout(session.refreshTimer);
       
      }
      console.log("delete session fired", session);

     return this.sessions.delete(sessionId);
   }

   getSession(sessionId) {
     return this.sessions.get(sessionId);
   }

   refreshSession(oldSessionId, newJwt, newExpireAt ) {
      const newSessionId = uuidv4().replaceAll('-','');

      const session = {
        jwt: newJwt,
        expiresAt: newExpireAt,
        refreshTimer: null
      };

      console.log("new session", session);
      

      this.setupRefreshTimer(newSessionId, session);
      this.sessions.delete(oldSessionId);
      this.sessions.set(newSessionId, session )

      sseConnectionStore.notifyClient(oldSessionId, {
        type:"session-refresh",
        sessionId: newSessionId
      });
   
      return newSessionId;
   }

   async setupRefreshTimer(sessionId, session) {
      const timeRefreshSpan = 20;
      const timeUntilRefresh = (session.expiresAt - Math.floor(Date.now() / 1000) - timeRefreshSpan) * 1000; 

      if(timeUntilRefresh <= 0) return;

      session.refreshTimer = setTimeout(async () => {
        try {
          const response = await refresh(session.jwt, config.jwtSeconds); 
          const newSession = this.refreshSession(sessionId, response.jwt, response.expires);
          console.log("Session refreshed", newSession);
          
        } catch (error) {
          console.error('Failed to refresh session:', error);
          this.deleteSession(sessionId);
        }
      }, timeUntilRefresh);
   }

   //Validate session
   async validateSession(sessionId) {
     if (!this.sessions.has(sessionId)) return false;

     const sessionData = this.sessions.get(sessionId);
     const timeNow = Math.floor(Date.now() / 1000);

     if (timeNow >= sessionData.expiresAt) {
       this.deleteSession(sessionId);
        return false;
     }

       try {
         await authenticateJwt(sessionData.jwt);
         return true;
       } catch (error) {
         this.deleteSession(sessionId);
         return false;
       }
     
   }
 }

export const sessionStore = new SessionStore();