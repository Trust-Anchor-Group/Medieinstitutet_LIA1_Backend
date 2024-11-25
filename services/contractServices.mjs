// services/contractServices.mjs

import fs from 'fs/promises';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import DataInitializationService from './dataInitializationService.mjs';

// Service handling contract ID persistence and retrieval
// Uses file system storage with error handling and logging
class ContractServices {
   constructor(logger) {
       this.logger = logger;
       // Initialize data service and get contract file location
       this.dataInit = new DataInitializationService(logger);
       this.contractFilePath = this.dataInit.getContractFilePath();
   }

   // Retrieves all stored contract IDs from persistence
   // Returns array of contract objects with IDs
   async getContractIds() {
       try {
           // Log file access for debugging and monitoring
           this.logger.info('Attempting to read file from:', this.contractFilePath);
           
           // Read and parse contract data from storage
           const data = await fs.readFile(this.contractFilePath, 'utf8');
           this.logger.info('Successfully read file, content:', data);
           const contractData = JSON.parse(data);
           
           return contractData.contracts;
       } catch (error) {
           // Log error and wrap in application-specific error type
           this.logger.error('Error in getContractIds:', error);
           throw new ErrorResponse(
               500,
               `Error reading contract IDs: ${error.message}`,
               'internal'
           );
       }
   }

   // Persists new contract ID to storage
   // Maintains array structure in storage file
   async addContractId(contractId) {
       try {
           this.logger.info('Adding new contract ID:', contractId);
           
           // Load existing contract data
           const data = await fs.readFile(this.contractFilePath, 'utf8');
           const contractData = JSON.parse(data);
           
           // Append new contract to existing array
           contractData.contracts.push({
               id: contractId
           });
           
           // Write updated data with formatting for readability
           await fs.writeFile(
               this.contractFilePath,
               JSON.stringify(contractData, null, 2),
               'utf8'
           );
           
           this.logger.info('Successfully added new contract ID to file');
       } catch (error) {
           // Log error and wrap in application-specific error type
           this.logger.error('Error in addContractId:', error);
           throw new ErrorResponse(
               500,
               `Error adding contract ID: ${error.message}`,
               'internal'
           );
       }
   }
}

export default ContractServices;