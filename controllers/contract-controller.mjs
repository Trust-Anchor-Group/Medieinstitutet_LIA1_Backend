// controllers/contract-controller.mjs
import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ResponseModel from "../models/ResponseModel.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import { createContract, getContract } from "../services/externalApiServices.mjs";
import ContractServices from '../services/contractServices.mjs';
import winston from 'winston';

// Initialize logger for contract controller
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'contract-controller.log' })
    ]
});

const contractServices = new ContractServices(logger);

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
    logger.info("Starting contract creation");
    const cookie = req.cookies.auth;
    if (!cookie) {
        logger.error("No auth cookie found");
        return next(new ErrorResponse(401, 'Authentication required', 'internal'));
    }

    let cookieData;
    try {
        cookieData = JSON.parse(cookie);
        logger.info("Cookie data parsed successfully");
    } catch (error) {
        logger.error("Error parsing cookie data:", error);
        return next(new ErrorResponse(401, 'Invalid authentication data', 'internal'));
    }

    try {
        logger.info("Received request body:", JSON.stringify(req.body, null, 2));
        
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

        // Initialize Parts array based on roles
        const parts = [];
        const { roles } = req.body;

        // Check if any role is provided
        const hasAnyRole = Object.values(roles).some(role => role !== '');

        // If any role is provided, all must be provided
        if (hasAnyRole) {
            const requiredRoles = ['creator', 'borrower', 'lender', 'trustProvider'];
            const missingRoles = requiredRoles.filter(role => !roles[role]);

            if (missingRoles.length > 0) {
                throw new ErrorResponse(
                    400, 
                    `When providing roles, all roles are required. Missing: ${missingRoles.join(', ')}`,
                    'internal'
                );
            }

            // Add all roles to parts
            parts.push(
                { role: 'Creator', id: roles.creator },
                { role: 'Borrower', id: roles.borrower },
                { role: 'Lender', id: roles.lender },
                { role: 'TrustProvider', id: roles.trustProvider }
            );
        }

        // Format contract data according to the external API format
        const contractData = {
            templateId: "2eb3a4a6-2fd2-6080-dc11-7cf88434c612@legal.mateo.lab.tagroot.io",
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

        logger.info("Calling external API with data:", JSON.stringify(contractData, null, 2));
        const contractResponse = await createContract(contractData, cookieData.jwt);
        logger.info("Contract created successfully", contractResponse);

        // ! Debugger save to json
        logger.info("Contract response structure:", {
            hasData: !!contractResponse.data,
            hasDirectContract: !!contractResponse.Contract,
            contractId: contractResponse.Contract?.id,
            fullResponse: JSON.stringify(contractResponse, null, 2)
        });

        // Save the contract ID
        if (contractResponse.Contract?.id) { 
            try {
                await contractServices.addContractId(contractResponse.Contract.id);
                logger.info("Contract ID saved to local storage");
            } catch (error) {
                logger.error("Error saving contract ID:", error);
                // Error logging detail
                logger.error("Error details:", {
                    error: error.message,
                    contractId: contractResponse.Contract.id,
                    stack: error.stack
                });
            }
        }

        res.status(201).json(new ResponseModel(201, 'Micro loan contract created successfully', contractResponse));
    } catch (error) {
        logger.error("Error creating contract:", error);
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
    logger.info('Starting getAvailableContracts');
    
    const cookie = req.cookies.auth;
    if (!cookie) {
        logger.error('No auth cookie found');
        return next(new ErrorResponse(401, 'Authentication required', 'internal'));
    }

    try {
        const cookieData = JSON.parse(cookie);
        logger.info('Successfully parsed auth cookie');

        // Get contract IDs using the service
        logger.info('Fetching contract IDs');
        const contractIds = await contractServices.getContractIds();
        logger.info('Retrieved contract IDs:', contractIds);

        // Fetch contract details for each ID
        logger.info('Starting to fetch individual contract details');
        const contractPromises = contractIds.map(async contract => {
            try {
                return await getContract(contract.id, null, cookieData.jwt);
            } catch (error) {
                logger.error(`Error fetching contract ${contract.id}:`, error);
                return null;
            }
        });
        
        const contracts = await Promise.all(contractPromises);
        const validContracts = contracts.filter(contract => contract !== null);
        
        logger.info(`Successfully retrieved ${validContracts.length} contracts`);
        
        res.status(200).json(new ResponseModel(200, 'Contracts retrieved successfully', validContracts));
    } catch (error) {
        logger.error('Error in getAvailableContracts:', error);
        next(error);
    }
});