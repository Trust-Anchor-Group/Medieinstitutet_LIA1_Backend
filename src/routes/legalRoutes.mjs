// src/routes/legalRoutes.mjs
import express from 'express';
import { legalController } from '../controllers/legalController.mjs';

const router = express.Router();

router.post('/validate-pnr', legalController.validatePNr);
router.get('/application-attributes', legalController.getApplicationAttributes);
router.post('/apply-id', legalController.applyId);
router.post('/add-id-attachment', legalController.addIdAttachment);
router.post('/ready-for-approval', legalController.readyForApproval);
router.get('/service-providers-for-id-review', legalController.getServiceProvidersForIdReview);
router.post('/select-review-service', legalController.selectReviewService);
router.post('/authorize-access-to-id', legalController.authorizeAccessToId);
router.post('/petition-peer-review', legalController.petitionPeerReview);
router.post('/petition-id', legalController.petitionId);
router.post('/petition-signature', legalController.petitionSignature);
router.post('/create-contract', legalController.createContract);
router.get('/identity', legalController.getIdentity);
router.get('/contract', legalController.getContract);
router.post('/sign-contract', legalController.signContract);
router.post('/sign-data', legalController.signData);
router.get('/identities', legalController.getIdentities);
router.get('/created-contracts', legalController.getCreatedContracts);
router.post('/authorize-access-to-contract', legalController.authorizeAccessToContract);

export default router;