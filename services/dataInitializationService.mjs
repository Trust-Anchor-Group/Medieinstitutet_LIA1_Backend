// services/dataInitializationService.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DataInitializationService {
    constructor(logger) {
        this.logger = logger;
        this.dataDir = path.join(dirname(__dirname), 'data');
        this.contractFile = path.join(this.dataDir, 'contractId.json');
    }

    async initialize() {
        try {
            await this.ensureDataDirectory();
            await this.ensureContractFile();
        } catch (error) {
            this.logger.error('Fatal error during data initialization:', error);
            throw error; // Let the calling code decide how to handle fatal errors
        }
    }

    async ensureDataDirectory() {
        try {
            await fs.access(this.dataDir);
            this.logger.info('Data directory exists');
        } catch {
            await fs.mkdir(this.dataDir);
            this.logger.info('Created data directory');
        }
    }

    async ensureContractFile() {
        try {
            await fs.access(this.contractFile);
            this.logger.info('Contract file exists');
        } catch {
            await fs.writeFile(
                this.contractFile,
                JSON.stringify({ contracts: [] }, null, 2),
                'utf8'
            );
            this.logger.info('Created contractId.json file');
        }
    }

    getDataDirectoryPath() {
        return this.dataDir;
    }

    getContractFilePath() {
        return this.contractFile;
    }
}

export default DataInitializationService;