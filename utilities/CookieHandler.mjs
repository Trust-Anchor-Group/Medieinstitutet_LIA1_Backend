import { jwtDecode } from "jwt-decode";

export default class CookieHandler {

    constructor(res) {
        this.res = res;
        this.httpOnly = true;
        this.secure = false; //todo: change to true for https
        this.sameSite = 'Lax'; //todo: change to 'Strict' for production
    }

    /**
     * @desc Set cookie data 
     * @param {String} cookieName 
     * @param {Object} data 
     * @param {Object} options 
     */
    setCookie(cookieName, data = {}, options = {}) {

        cookieName = cookieName !== undefined ? cookieName : `tag-cookie-${Math.floor(Date.now() / 1000)}`;
        let cookieData = { ...data };
        let decodedToken;

        if (data.jwt) {
            decodedToken = jwtDecode(data.jwt);
            const expiresTimestamp = options.expires || decodedToken.exp * 1000;
            options.expires = new Date(expiresTimestamp);
            cookieData.jwt = data.jwt;
        }

        // Secure cookie data
        options.httpOnly = options.httpOnly !== undefined ? options.httpOnly : this.httpOnly;
        options.secure = options.secure !== undefined ? options.secure : this.secure;
        options.sameSite = options.sameSite !== undefined ? options.sameSite : this.sameSite;

        this.res.cookie(cookieName, JSON.stringify(cookieData), options);
    }

    deleteCookie(cookieName, options = {}) {

        // Secure cookie data
        options.httpOnly = options.httpOnly !== undefined ? options.httpOnly : this.httpOnly;
        options.secure = options.secure !== undefined ? options.secure : this.secure;
        options.sameSite = options.sameSite !== undefined ? options.sameSite : this.sameSite;

        this.res.clearCookie(cookieName, options);
    }

}