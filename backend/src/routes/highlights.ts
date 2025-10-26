import express from 'express';
import { auth } from '../middleware/auth';
import {
  createHighlight,
  getHighlights,
  deleteHighlight,
  updateHighlight
} from '../controllers/highlightController'; 

const router = express.Router();

router.post('/', auth, createHighlight);
router.get('/', auth, getHighlights);
router.delete('/:id', auth, deleteHighlight);
router.put('/:id', auth, updateHighlight);

export default router;
