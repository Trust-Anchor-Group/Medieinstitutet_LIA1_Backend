/**
 * @desc Wrapper to handle asynchronous functions to automatically handle error
 * @param {*} fn 
 * @returns 
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};