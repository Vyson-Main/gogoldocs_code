// ── Auth Routes ───────────────────────────────────────────────────────────────
import { Router } from 'express';
import { authController }   from '../controllers/authController.js';
import { authenticate }     from '../middleware/authenticate.js';
import { validate }         from '../middleware/errorHandler.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';

const router = Router();

router.post('/register', validate(registerValidator), authController.register);
router.post('/login',    validate(loginValidator),    authController.login);
router.get ('/me',       authenticate,                authController.me);

export default router;
