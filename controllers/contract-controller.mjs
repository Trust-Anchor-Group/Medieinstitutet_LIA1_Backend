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
// controllers/contract-controller.mjs

export const createMicroLoanContract = asyncHandler(async (req, res, next) => {
    console.log("Backend: Starting contract creation");
    const cookie = req.cookies.auth;
    if (!cookie) {
        console.log("Backend: No auth cookie found");
        return next(new ErrorResponse(401, 'Authentication required', 'internal'));
    }

    let cookieData;
    try {
        cookieData = JSON.parse(cookie);
        console.log("Backend: Cookie data parsed successfully", cookieData);
    } catch (error) {
        console.log("Backend: Error parsing cookie data", error);
        return next(new ErrorResponse(401, 'Invalid authentication data', 'internal'));
    }

    try {
        console.log("Backend: Received request body:",JSON.stringify(req.body, null, 2));
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

        const parts = [
        ];

        // Format contract data according to the simplified API format
        const contractData = {
            templateId: "2eb3a4a6-2fd2-6080-dc11-7cf88434c612@legal.mateo.lab.tagroot.io",  // TemplateId CreateStateMachineMicroloan contract
            visibility: "Public",
            Parts: parts,
            Parameters: [
                {
                    name: "Amount",
                    value: req.body.amount.toString()
                },
                {
                    name: "Currency",
                    value: req.body.currency
                },
                {
                    name: "InstallmentInterval",
                    value: req.body.installmentInterval
                },
                {
                    name: "InterestPerInstallment",
                    value: req.body.interestPerInstallment.toString()
                },
                {
                    name: "InstallmentAmount",
                    value: req.body.installmentAmount.toString()
                },
                {
                    name: "DebtLimit",
                    value: req.body.debtLimit.toString()
                },
                {
                    name: "CommissionPercent",
                    value: req.body.commissionPercent.toString()
                }
            ]
        };

        console.log("Backend: Calling external API with data:", JSON.stringify(contractData, null, 2));
        const contractResponse = await createContract(contractData, cookieData.jwt);
        console.log("Backend: Contract created successfully", contractResponse);
        console.log('Complete Contract Response from External API:', {
            fullResponse: contractResponse,
            stringify: JSON.stringify(contractResponse, null, 2)
        });

        res.status(201).json(new ResponseModel(201, 'Micro loan contract created successfully', contractResponse));
    } catch (error) {
        console.log("Backend: Error creating contract", error);
        next(error);
    }
});