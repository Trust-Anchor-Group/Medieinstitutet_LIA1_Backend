// services/dataInitializationService.mjs

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Convert ESM module URL to filesystem path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Service responsible for initializing data storage structures
// Ensures required directories and files exist before app startup
class DataInitializationService {
   constructor(logger) {
       this.logger = logger;
       // Set up paths relative to project root
       this.dataDir = path.join(dirname(__dirname), 'data');
       this.contractFile = path.join(this.dataDir, 'contractId.json');
   }

   // Primary initialization method that runs all setup tasks
   // Throws errors up to caller for fatal initialization failures
   async initialize() {
       try {
           await this.ensureDataDirectory();
           await this.ensureContractFile();
       } catch (error) {
           this.logger.error('Fatal error during data initialization:', error);
           throw error; // Let the calling code decide how to handle fatal errors
       }
   }

   // Ensures data directory exists, creates it if missing
   // Critical for application data persistence
   async ensureDataDirectory() {
       try {
           await fs.access(this.dataDir);
           this.logger.info('Data directory exists');
       } catch {
           // Directory doesn't exist, create it
           await fs.mkdir(this.dataDir);
           this.logger.info('Created data directory');
       }
   }

   // Ensures contract storage file exists with valid initial structure
   // Creates file with empty contracts array if missing
   async ensureContractFile() {
       try {
           await fs.access(this.contractFile);
           this.logger.info('Contract file exists');
       } catch {
           // File doesn't exist, create with initial structure
           await fs.writeFile(
               this.contractFile,
               JSON.stringify({ contracts: [] }, null, 2), // Pretty print JSON for readability
               'utf8'
           );
           this.logger.info('Created contractId.json file');
       }
   }

   // Getter methods for external services to access paths
   // Encapsulates path logic within this service
   getDataDirectoryPath() {
       return this.dataDir;
   }

   getContractFilePath() {
       return this.contractFile;
   }
}

export default DataInitializationService;