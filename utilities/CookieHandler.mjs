import { jwtDecode } from "jwt-decode";

export default class CookieHandler {

    constructor(res) {
        this.res = res;
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
            cookieData.jwt = `Bearer ${data.jwt}`;
        }

        // Secure cookie data
        options.httpOnly = options.httpOnly !== undefined ? options.httpOnly : true;
        options.secure = options.secure !== undefined ? options.secure : false; //todo: change to true for https
        options.sameSite = options.sameSite !== undefined ? options.sameSite : 'Lax'; //todo: change to 'Strict' for production

        this.res.cookie(cookieName.toLowerCase(), JSON.stringify(cookieData), options);
    }

}