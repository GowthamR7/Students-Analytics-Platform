import express from 'express';
import { auth } from '../middleware/auth';
import { 
  trackArticleView, 
  getArticleStats, 
  getStudentProgress 
} from '../controllers/trackingController';

const router = express.Router();

router.post('/', auth, trackArticleView);

router.get('/article/:articleId', auth, getArticleStats);

router.get('/student', auth, getStudentProgress);

export default router;
