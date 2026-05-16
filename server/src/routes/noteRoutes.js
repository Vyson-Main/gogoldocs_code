// ── Note Routes ───────────────────────────────────────────────────────────────
import { Router } from 'express';
import { noteController }   from '../controllers/noteController.js';
import { authenticate }     from '../middleware/authenticate.js';
import { validate }         from '../middleware/errorHandler.js';
import {
  createNoteValidator, updateNoteValidator,
  secureNoteValidator, unlockNoteValidator,
} from '../validators/noteValidators.js';

const router = Router();

// All note routes require auth
router.use(authenticate);

router.get   ('/',            noteController.list);
router.post  ('/',            validate(createNoteValidator), noteController.create);
router.get   ('/:id',         noteController.get);
router.patch ('/:id',         validate(updateNoteValidator), noteController.update);
router.delete('/:id',         noteController.delete);
router.post  ('/:id/secure',  validate(secureNoteValidator), noteController.secure);
router.post  ('/:id/lock',    validate(secureNoteValidator), noteController.removeSecurity);
router.post  ('/:id/unlock',  validate(unlockNoteValidator), noteController.unlock);

export default router;
