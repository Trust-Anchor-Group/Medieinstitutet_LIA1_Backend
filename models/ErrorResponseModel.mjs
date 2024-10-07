/**
 * @desc This class is used to create an error response object
 * @param {string} statusCode - The status code of the error
 * @param {string} message - The error message
 * @param {string} source - If internal or external problems
 */
export default class ErrorResponse extends Error {
    constructor(statusCode, message, source) {
        super(message);
        this.source = source === "external" ? "External API" : "Internal";
        this.statusCode = statusCode;
    }
}