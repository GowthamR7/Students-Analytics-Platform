import { Response } from 'express';
import mongoose from 'mongoose';
import Analytics from '../models/Analytics';
import Article from '../models/Article';
import { AuthRequest } from '../middleware/auth';


interface CategoryStats {
  [key: string]: {
    articlesRead: number;
    timeSpent: number;
    views: number;
  };
}

export const trackArticleView = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleId, duration, sessionStart, sessionEnd } = req.body;
    const studentId = req.user?._id;

    console.log(' Tracking article view:', { 
      articleId, 
      duration, 
      studentId,
      sessionStart,
      sessionEnd 
    });

   
    if (!articleId) {
      res.status(400).json({ success: false, message: 'Article ID is required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      res.status(400).json({ success: false, message: 'Invalid article ID' });
      return;
    }

    if (!studentId) {
      res.status(401).json({ success: false, message: 'Student authentication required' });
      return;
    }

   
    const article = await Article.findById(articleId);
    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

  
    let analytics = await Analytics.findOne({ 
      articleId: new mongoose.Types.ObjectId(articleId), 
      studentId: new mongoose.Types.ObjectId(studentId.toString())
    });

    const sessionDuration = duration || 0;
    const startTime = sessionStart ? new Date(sessionStart) : new Date();
    const endTime = sessionEnd ? new Date(sessionEnd) : new Date();

    if (analytics) {
     
      analytics.views += 1;
      analytics.duration += sessionDuration;
      analytics.lastViewed = new Date();
      
    
      analytics.sessionData.push({
        startTime,
        endTime,
        duration: sessionDuration
      });

      await analytics.save();
      console.log(' Updated existing analytics record');
    } else {
     
      analytics = await Analytics.create({
        articleId: new mongoose.Types.ObjectId(articleId),
        studentId: new mongoose.Types.ObjectId(studentId.toString()), 
        views: 1,
        duration: sessionDuration,
        lastViewed: new Date(),
        sessionData: [{
          startTime,
          endTime,
          duration: sessionDuration
        }]
      });
      console.log(' Created new analytics record');
    }

    res.json({ 
      success: true, 
      message: 'View tracked successfully',
      analytics: {
        totalViews: analytics.views,
        totalDuration: analytics.duration,
        lastViewed: analytics.lastViewed
      }
    });
  } catch (error: any) {
    console.error(' Error tracking article view:', error);
    res.status(500).json({ success: false, message: 'Failed to track view' });
  }
};

export const getArticleStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleId } = req.params;
    const teacherId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      res.status(400).json({ success: false, message: 'Invalid article ID' });
      return;
    }

    if (!teacherId) {
      res.status(401).json({ success: false, message: 'Teacher authentication required' });
      return;
    }

 
    const article = await Article.findOne({ 
      _id: new mongoose.Types.ObjectId(articleId), 
      createdBy: new mongoose.Types.ObjectId(teacherId.toString()) 
    });

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

 
    const analytics = await Analytics.find({ 
      articleId: new mongoose.Types.ObjectId(articleId) 
    }).populate('studentId', 'name email');

    const stats = {
      articleTitle: article.title,
      totalViews: analytics.reduce((sum, a) => sum + a.views, 0),
      totalDuration: analytics.reduce((sum, a) => sum + a.duration, 0),
      uniqueStudents: analytics.length,
      studentStats: analytics.map(a => ({
        studentName: (a.studentId as any).name,
        studentEmail: (a.studentId as any).email,
        views: a.views,
        duration: Math.round(a.duration / 60), 
        lastViewed: a.lastViewed,
        sessions: a.sessionData.length
      }))
    };

    res.json({ success: true, stats });
  } catch (error: any) {
    console.error(' Error getting article stats:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
};

export const getStudentProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?._id;

    if (!studentId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

  
    const analytics = await Analytics.find({ 
      studentId: new mongoose.Types.ObjectId(studentId.toString()) 
    }).populate('articleId', 'title category createdBy');

    
    const categoryStats: CategoryStats = {};

    const progress = {
      totalArticlesRead: analytics.length,
      totalTimeSpent: Math.round(analytics.reduce((sum, a) => sum + a.duration, 0) / 60), 
      totalViews: analytics.reduce((sum, a) => sum + a.views, 0),
      categoryStats,
      recentActivity: analytics
        .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
        .slice(0, 10)
        .map(a => ({
          articleTitle: (a.articleId as any).title,
          category: (a.articleId as any).category,
          views: a.views,
          duration: Math.round(a.duration / 60),
          lastViewed: a.lastViewed
        }))
    };

   
    analytics.forEach(a => {
      const category = (a.articleId as any).category;
      if (category && typeof category === 'string') { 
        if (!categoryStats[category]) {
          categoryStats[category] = {
            articlesRead: 0,
            timeSpent: 0,
            views: 0
          };
        }
        categoryStats[category].articlesRead += 1;
        categoryStats[category].timeSpent += Math.round(a.duration / 60);
        categoryStats[category].views += a.views;
      }
    });

    res.json({ success: true, progress });
  } catch (error: any) {
    console.error(' Error getting student progress:', error);
    res.status(500).json({ success: false, message: 'Failed to get progress' });
  }
};
