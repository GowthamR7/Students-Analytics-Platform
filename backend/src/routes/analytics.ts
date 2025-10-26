import express from 'express';
import { auth } from '../middleware/auth';
import { 
  getTeacherAnalytics, 
  getStudentAnalytics, 
  trackAnalytics 
} from '../controllers/analyticsController';

const router = express.Router();


router.get('/', auth, getTeacherAnalytics);


router.get('/student', auth, getStudentAnalytics);


router.post('/track', auth, trackAnalytics);

export default router;
