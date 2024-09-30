// src/controllers/cryptoController.mjs
import AgentAPI from '../agentApi/agentApi.mjs';

export const cryptoController = {
  async getAlgorithms(req, res) {
    try {
      const response = await AgentAPI.Crypto.GetAlgorithms();
      res.json(response.body);
    } catch (error) {
      console.error('Error getting algorithms:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while getting algorithms',
        details: error.message,
      });
    }
  },

  async createKey(req, res) {
    try {
      const { localName, namespace, id, keyPassword, accountPassword } = req.body;
      const response = await AgentAPI.Crypto.CreateKey(localName, namespace, id, keyPassword, accountPassword);
      res.json(response.body);
    } catch (error) {
      console.error('Error creating key:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while creating key',
        details: error.message,
      });
    }
  },

  async getPublicKey(req, res) {
    try {
      const { keyId } = req.query;
      const response = await AgentAPI.Crypto.GetPublicKey(keyId);
      res.json(response.body);
    } catch (error) {
      console.error('Error getting public key:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while getting public key',
        details: error.message,
      });
    }
  }
};