// services/contractService.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ErrorResponse from '../models/ErrorResponseModel.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @desc Reads contract IDs from JSON file
 * @returns {Promise<Array>} Array of contract IDs
 */
export const getContractIds = async () => {
    try {
        const filePath = path.join(__dirname, '..', 'data', 'contractId.json'); 
        console.log('Attempting to read file from:', filePath);
        
        const data = await fs.readFile(filePath, 'utf8');
        console.log('Successfully read file, content:', data);
        
        const contractData = JSON.parse(data);
        return contractData.contracts;
    } catch (error) {
        console.error('Error in getContractIds:', error);
        throw new ErrorResponse(500, 
            `Error reading contract IDs: ${error.message}`,
            'internal'
        );
    }
};