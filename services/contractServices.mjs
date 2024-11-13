// services/contractServices.mjs
import fs from 'fs/promises';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import DataInitializationService from './dataInitializationService.mjs';

class ContractServices {
    constructor(logger) {
        this.logger = logger;
        this.dataInit = new DataInitializationService(logger);
        this.contractFilePath = this.dataInit.getContractFilePath();
    }

    async getContractIds() {
        try {
            this.logger.info('Attempting to read file from:', this.contractFilePath);
            
            const data = await fs.readFile(this.contractFilePath, 'utf8');
            this.logger.info('Successfully read file, content:', data);
            
            const contractData = JSON.parse(data);
            return contractData.contracts;
        } catch (error) {
            this.logger.error('Error in getContractIds:', error);
            throw new ErrorResponse(500, 
                `Error reading contract IDs: ${error.message}`,
                'internal'
            );
        }
    }

    async addContractId(contractId) {
        try {
            this.logger.info('Adding new contract ID:', contractId);
            
            // Read existing data
            const data = await fs.readFile(this.contractFilePath, 'utf8');
            const contractData = JSON.parse(data);
            
            // Add new contract ID
            contractData.contracts.push({
                id: contractId
            });
            
            // Write updated data back to file
            await fs.writeFile(
                this.contractFilePath, 
                JSON.stringify(contractData, null, 2),
                'utf8'
            );
            
            this.logger.info('Successfully added new contract ID to file');
        } catch (error) {
            this.logger.error('Error in addContractId:', error);
            throw new ErrorResponse(500, 
                `Error adding contract ID: ${error.message}`,
                'internal'
            );
        }
    }
}

export default ContractServices;