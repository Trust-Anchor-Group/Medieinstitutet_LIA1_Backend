// src/controllers/legalController.mjs
import AgentAPI from '../agentApi/agentApi.mjs';

export const legalController = {
  async validatePNr(req, res) {
    try {
      const { countryCode, pNr } = req.body;
      const response = await AgentAPI.Legal.ValidatePNr(countryCode, pNr);
      res.json(response.body);
    } catch (error) {
      console.error('Error validating PNr:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while validating PNr',
        details: error.message,
      });
    }
  },

  async getApplicationAttributes(req, res) {
    try {
      const response = await AgentAPI.Legal.GetApplicationAttributes();
      res.json(response.body);
    } catch (error) {
      console.error('Error getting application attributes:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while getting application attributes',
        details: error.message,
      });
    }
  },

  async applyId(req, res) {
    try {
      const { localName, namespace, keyId, keyPassword, accountPassword, properties } = req.body;
      const response = await AgentAPI.Legal.ApplyId(localName, namespace, keyId, keyPassword, accountPassword, properties);
      res.json(response.body);
    } catch (error) {
      console.error('Error applying ID:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while applying ID',
        details: error.message,
      });
    }
  },

  async addIdAttachment(req, res) {
    try {
      const { localName, namespace, keyId, keyPassword, accountPassword, legalId, attachment, fileName, contentType } = req.body;
      const response = await AgentAPI.Legal.AddIdAttachment(localName, namespace, keyId, keyPassword, accountPassword, legalId, attachment, fileName, contentType);
      res.json(response.body);
    } catch (error) {
      console.error('Error adding ID attachment:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while adding ID attachment',
        details: error.message,
      });
    }
  },

  async readyForApproval(req, res) {
    try {
      const { legalId } = req.body;
      const response = await AgentAPI.Legal.ReadyForApproval(legalId);
      res.json(response.body);
    } catch (error) {
      console.error('Error setting ready for approval:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while setting ready for approval',
        details: error.message,
      });
    }
  },

  async getServiceProvidersForIdReview(req, res) {
    try {
      const { legalId } = req.query;
      const response = await AgentAPI.Legal.GetServiceProvidersForIdReview(legalId);
      res.json(response.body);
    } catch (error) {
      console.error('Error getting service providers for ID review:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while getting service providers for ID review',
        details: error.message,
      });
    }
  },

  async selectReviewService(req, res) {
    try {
      const { serviceId, serviceProvider } = req.body;
      const response = await AgentAPI.Legal.SelectReviewService(serviceId, serviceProvider);
      res.json(response.body);
    } catch (error) {
      console.error('Error selecting review service:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while selecting review service',
        details: error.message,
      });
    }
  },

  async authorizeAccessToId(req, res) {
    try {
      const { legalId, remoteId, authorize } = req.body;
      const response = await AgentAPI.Legal.AuthorizeAccessToId(legalId, remoteId, authorize);
      res.json(response.body);
    } catch (error) {
      console.error('Error authorizing access to ID:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while authorizing access to ID',
        details: error.message,
      });
    }
  },

  async petitionPeerReview(req, res) {
    try {
      const { localName, namespace, keyId, keyPassword, accountPassword, legalId, remoteId, petitionId, purpose } = req.body;
      const response = await AgentAPI.Legal.PetitionPeerReview(localName, namespace, keyId, keyPassword, accountPassword, legalId, remoteId, petitionId, purpose);
      res.json(response.body);
    } catch (error) {
      console.error('Error petitioning peer review:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while petitioning peer review',
        details: error.message,
      });
    }
  },

  async petitionId(req, res) {
    try {
      const { localName, namespace, keyId, keyPassword, accountPassword, legalId, remoteId, petitionId, purpose } = req.body;
      const response = await AgentAPI.Legal.PetitionId(localName, namespace, keyId, keyPassword, accountPassword, legalId, remoteId, petitionId, purpose);
      res.json(response.body);
    } catch (error) {
      console.error('Error petitioning ID:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while petitioning ID',
        details: error.message,
      });
    }
  },

  async petitionSignature(req, res) {
    try {
      const { localName, namespace, keyId, keyPassword, accountPassword, legalId, remoteId, petitionId, purpose, content } = req.body;
      const response = await AgentAPI.Legal.PetitionSignature(localName, namespace, keyId, keyPassword, accountPassword, legalId, remoteId, petitionId, purpose, content);
      res.json(response.body);
    } catch (error) {
      console.error('Error petitioning signature:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while petitioning signature',
        details: error.message,
      });
    }
  },

  async createContract(req, res) {
    try {
      const { templateId, visibility, parts, parameters } = req.body;
      const response = await AgentAPI.Legal.CreateContract(templateId, visibility, parts, parameters);
      res.json(response.body);
    } catch (error) {
      console.error('Error creating contract:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while creating contract',
        details: error.message,
      });
    }
  },

  async getIdentity(req, res) {
    try {
      const { legalId } = req.query;
      const response = await AgentAPI.Legal.GetIdentity(legalId);
      res.json(response.body);
    } catch (error) {
      console.error('Error getting identity:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while getting identity',
        details: error.message,
      });
    }
  },

  async getContract(req, res) {
    try {
      const { contractId } = req.query;
      const response = await AgentAPI.Legal.GetContract(contractId);
      res.json(response.body);
    } catch (error) {
      console.error('Error getting contract:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while getting contract',
        details: error.message,
      });
    }
  },

  async signContract(req, res) {
    try {
      const { localName, namespace, keyId, keyPassword, accountPassword, contractId, legalId, role } = req.body;
      const response = await AgentAPI.Legal.SignContract(localName, namespace, keyId, keyPassword, accountPassword, contractId, legalId, role);
      res.json(response.body);
    } catch (error) {
      console.error('Error signing contract:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while signing contract',
        details: error.message,
      });
    }
  },

  async signData(req, res) {
    try {
      const { localName, namespace, keyId, keyPassword, accountPassword, legalId, dataBase64 } = req.body;
      const response = await AgentAPI.Legal.SignData(localName, namespace, keyId, keyPassword, accountPassword, legalId, dataBase64);
      res.json(response.body);
    } catch (error) {
      console.error('Error signing data:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while signing data',
        details: error.message,
      });
    }
  },

  async getIdentities(req, res) {
    try {
      const { offset, maxCount } = req.query;
      const response = await AgentAPI.Legal.GetIdentities(offset, maxCount);
      res.json(response.body);
    } catch (error) {
      console.error('Error getting identities:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while getting identities',
        details: error.message,
      });
    }
  },

  async getCreatedContracts(req, res) {
    try {
      const { offset, maxCount } = req.query;
      const response = await AgentAPI.Legal.GetCreatedContracts(offset, maxCount);
      res.json(response.body);
    } catch (error) {
      console.error('Error getting created contracts:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while getting created contracts',
        details: error.message,
      });
    }
  },

  async authorizeAccessToContract(req, res) {
    try {
      const { contractId, remoteId, authorize } = req.body;
      const response = await AgentAPI.Legal.AuthorizeAccessToContract(contractId, remoteId, authorize);
      res.json(response.body);
    } catch (error) {
      console.error('Error authorizing access to contract:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while authorizing access to contract',
        details: error.message,
      });
    }
  }
};