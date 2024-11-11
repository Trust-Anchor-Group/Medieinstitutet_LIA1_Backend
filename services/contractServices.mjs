// services/contractService.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @desc Reads contract IDs from JSON file
 * @returns {Promise<Array>} Array of contract IDs
 */
export const getContractIds = async () => {
    try {
        const filePath = path.join(__dirname, '..', 'data', 'contractId.json');
        const data = await fs.readFile(filePath, 'utf8');
        const contractData = JSON.parse(data);
        return contractData.contracts;
    } catch (error) {
        throw new Error('Error reading contract IDs');
    }
};