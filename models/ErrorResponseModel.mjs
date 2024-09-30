/**
 * @desc This class is used to create an error response object
 * @param {string} statusCode - The status code of the error
 * @param {string} message - The error message
 */
export default class ErrorResponse extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}