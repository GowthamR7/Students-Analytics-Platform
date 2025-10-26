import express from 'express';
import { getAllArticles, getArticleById, getTeacherArticles, createArticle, updateArticle, deleteArticle } from '../controllers/articleController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getAllArticles);
router.get('/my-articles', protect, authorize('teacher'), getTeacherArticles);
router.get('/:id', protect, getArticleById);
router.post('/', protect, authorize('teacher'), createArticle);
router.put('/:id', protect, authorize('teacher'), updateArticle);
router.delete('/:id', protect, authorize('teacher'), deleteArticle);

export default router;
