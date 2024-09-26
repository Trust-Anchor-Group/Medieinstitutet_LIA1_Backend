// src/controllers/accountController.mjs
import { createAccount } from '../services/externalApiServices.mjs';

export async function createAccountController(req, res) {
  try {
    // Attempt to create an account with the provided request body
    const accountData = await createAccount(req.body);
    res.json(accountData);
  } catch (error) {
    // Log error for debugging
    console.error('Error creating account:', error);
    // Send error response with status from the API or 500 if undefined
    res.status(error.response?.status || 500).json({
      error: 'An error occurred while creating the account',
      details: error.response?.data || error.message,
    });
  }
}