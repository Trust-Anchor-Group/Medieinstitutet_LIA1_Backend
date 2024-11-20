// sign-controller.mjs
import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ResponseModel from "../models/ResponseModel.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import { userInfo, getIds } from "../services/externalApiServices.mjs";
import generateHash from "../utilities/hashUtils.mjs";
import config from "../config/config.mjs";

export const getSigningCredentials = asyncHandler(async (req, res, next) => {
    const cookie = req.cookies.auth;
    if (!cookie) {
        return next(new ErrorResponse(401, 'Authentication required', 'internal'));
    }

    try {
        const cookieData = JSON.parse(cookie);
        const userData = await userInfo(cookieData.jwt);
        
        const credentials = generateKeyCredentials(userData.eMail, userData.userName);
        
        res.status(200).json(new ResponseModel(200, 'Signing credentials retrieved', {
            legalId: (await getIds(cookieData.jwt))?.Identities[0]?.id, 
            ...credentials
        }));
    } catch (error) {
        next(error);
    }
});

const generateKeyCredentials = (email, username) => {
    return {
        userKeyId: generateHash(config.keyIdSalt, email, username),
        userKeyPassword: generateHash(config.keyPasswordSalt, email, username)
    }
};