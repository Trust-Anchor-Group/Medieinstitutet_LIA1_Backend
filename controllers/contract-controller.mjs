// controllers/contract-controller.mjs
import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ResponseModel from "../models/ResponseModel.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import { createContract, getContract } from "../services/externalApiServices.mjs";
import { getContractIds } from "../services/contractServices.mjs";

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

/**
 * @desc Get contract details
 * @route GET /api/v1/contracts/:contractId
 * @access Private
 */
export const getContractDetails = asyncHandler(async (req, res, next) => {
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
        const { contractId } = req.params;
        const { format } = req.query;

        if (!contractId) {
            throw new ErrorResponse(400, 'Contract ID is required', 'internal');
        }

        const contractResponse = await getContract(contractId, format, cookieData.jwt);
        res.status(200).json(new ResponseModel(200, 'Contract details retrieved successfully', contractResponse));
    } catch (error) {
        next(error);
    }
});

/**
 * @desc Get contract IDs
 * @route GET /api/v1/contracts
 * @access Private
 */
export const getAvailableContracts = asyncHandler(async (req, res, next) => {
    console.log('=== Starting getAvailableContracts ===');
    
    const cookie = req.cookies.auth;
    if (!cookie) {
        console.log('No auth cookie found');
        return next(new ErrorResponse(401, 'Authentication required', 'internal'));
    }

    try {
        const cookieData = JSON.parse(cookie);
        console.log('Successfully parsed auth cookie');

        // First get contract IDs
        console.log('Fetching contract IDs');
        const contractIds = await getContractIds();
        console.log('Retrieved contract IDs:', contractIds);

        // Fetch contract details for each ID
        console.log('Starting to fetch individual contract details');
        const contractPromises = contractIds.map(async contract => {
            try {
                return await getContract(contract.id, null, cookieData.jwt);
            } catch (error) {
                console.error(`Error fetching contract ${contract.id}:`, error);
                return null;
            }
        });
        
        const contracts = await Promise.all(contractPromises);
        const validContracts = contracts.filter(contract => contract !== null);
        
        console.log(`Successfully retrieved ${validContracts.length} contracts`);
        
        res.status(200).json(new ResponseModel(200, 'Contracts retrieved successfully', validContracts));
    } catch (error) {
        console.error('Error in getAvailableContracts:', error);
        next(error);
    }
});