// src/controllers/accountController.mjs
import AgentAPI from '../agentApi/agentApi.mjs';

export const accountController = {
  async domainInfo(req, res) {
    try {
      const { language } = req.query;
      const response = await AgentAPI.Account.DomainInfo(language);
      res.json(response.body);
    } catch (error) {
      console.error('Error getting domain info:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while getting domain info',
        details: error.message,
      });
    }
  },

async createAccount(req, res) {
  try {
    const { UserName, EMail, Password } = req.body;
    const apiKey = process.env.EXTERNAL_API_KEY;
    const secret = process.env.EXTERNAL_API_SECRET;
    const seconds = 3600;

    console.log('Request body:', req.body);
    console.log('API Key:', apiKey);
    console.log('Secret:', secret);

    const response = await AgentAPI.Account.Create(UserName, EMail, Password, apiKey, secret, seconds);
    res.json(response);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(error.status || 500).json({
      error: 'An error occurred while creating the account',
      details: error.message,
    });
  }
},

  async getSessionToken(req, res) {
    try {
      const response = await AgentAPI.Account.GetSessionToken();
      res.json(response.body);
    } catch (error) {
      console.error('Error getting session token:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while getting session token',
        details: error.message,
      });
    }
  },

  async verifyEmail(req, res) {
    try {
      const { eMail, code } = req.body;
      const response = await AgentAPI.Account.VerifyEMail(eMail, code);
      res.json(response.body);
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while verifying email',
        details: error.message,
      });
    }
  },

  async login(req, res) {
    try {
      const { userName, password } = req.body;
      const seconds = 3600;
      const response = await AgentAPI.Account.Login(userName, password, seconds);
      res.json(response.body);
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while logging in',
        details: error.message,
      });
    }
  },

  async quickLogin(req, res) {
    try {
      const seconds = 3600;
      const response = await AgentAPI.Account.QuickLogin(seconds);
      res.json(response.body);
    } catch (error) {
      console.error('Error quick logging in:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while quick logging in',
        details: error.message,
      });
    }
  },

  async refresh(req, res) {
    try {
      const seconds = 3600;
      const response = await AgentAPI.Account.Refresh(seconds);
      res.json(response.body);
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while refreshing token',
        details: error.message,
      });
    }
  },

  async logout(req, res) {
    try {
      const response = await AgentAPI.Account.Logout();
      res.json(response.body);
    } catch (error) {
      console.error('Error logging out:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while logging out',
        details: error.message,
      });
    }
  },

  async recover(req, res) {
    try {
      const { userName, personalNr, country, eMail, phoneNr } = req.body;
      const response = await AgentAPI.Account.Recover(userName, personalNr, country, eMail, phoneNr);
      res.json(response.body);
    } catch (error) {
      console.error('Error recovering account:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while recovering account',
        details: error.message,
      });
    }
  },

  async authenticateJwt(req, res) {
    try {
      const { token } = req.body;
      const response = await AgentAPI.Account.AuthenticateJwt(token);
      res.json(response.body);
    } catch (error) {
      console.error('Error authenticating JWT:', error);
      res.status(error.status || 500).json({
        error: 'An error occurred while authenticating JWT',
        details: error.message,
      });
    }
  }
};