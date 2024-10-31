// controllers/contract-controller.mjs
import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ResponseModel from "../models/ResponseModel.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import { createContract } from "../services/externalApiServices.mjs";

/**
 * @desc Create a new micro loan contract
 * @route POST /api/v1/contracts/microloan
 * @access Private
 * @param {Object} req.body - Contract data
 * @param {number} req.body.amount - The loan amount
 * @param {string} req.body.currency - Three-letter currency code (e.g. USD)
 * @param {string} req.body.installmentInterval - Payment interval in ISO 8601 duration format (e.g. P1M)
 * @param {number} req.body.interestPerInstallment - Interest rate per installment (%)
 * @param {number} req.body.installmentAmount - Amount per installment
 * @param {number} req.body.debtLimit - Maximum allowed debt
 * @param {number} req.body.commissionPercent - Commission percentage
 * @param {Object} req.body.roles - Contract role assignments
 * @returns {Promise<Object>} Response containing contract creation status and details
 */
export const createMicroLoanContract = asyncHandler(async (req, res, next) => {
    const cookie = req.cookies.auth;
    if (!cookie) {
        return next(new ErrorResponse(401, 'Authentication required', 'internal'));
    }

    let cookieData;
    try {
        cookieData = JSON.parse(cookie);
    } catch (error) {
        return next(new ErrorResponse(401, 'Invalid authentication data', 'internal'));
    }

    try {
        // Validate required fields
        const requiredFields = [
            'amount', 'currency', 'installmentInterval', 
            'interestPerInstallment', 'installmentAmount', 
            'debtLimit', 'commissionPercent', 'roles'
        ];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new ErrorResponse(400, `Missing required field: ${field}`, 'internal');
            }
        }

        // Format of contract data according to the external API requirements
        const contractData = {
            templateId: "CreateStateMachineMicroloan", // ! Replace with Id from christian when deliverd
            visibility: "Public",
            Parts: [
                { 
                    role: "Creator", 
                    legalId: req.body.roles.creator 
                },
                { 
                    role: "Lender", 
                    legalId: req.body.roles.lender 
                },
                { 
                    role: "Borrower", 
                    legalId: req.body.roles.borrower 
                },
                { 
                    role: "TrustProvider", 
                    legalId: req.body.roles.trustProvider 
                }
            ],
            Parameters: [
                { name: "Amount", value: req.body.amount.toString() },
                { name: "Currency", value: req.body.currency },
                { name: "InstallmentInterval", value: req.body.installmentInterval },
                { name: "InterestPerInstallment", value: req.body.interestPerInstallment.toString() },
                { name: "InstallmentAmount", value: req.body.installmentAmount.toString() },
                { name: "DebtLimit", value: req.body.debtLimit.toString() },
                { name: "CommissionPercent", value: req.body.commissionPercent.toString() }
            ]
        };

        const contractResponse = await createContract(contractData, cookieData.jwt);
        res.status(201).json(new ResponseModel(201, 'Micro loan contract created successfully', contractResponse));
    } catch (error) {
        next(error);
    }
});