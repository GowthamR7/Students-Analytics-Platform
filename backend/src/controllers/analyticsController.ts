import { Response } from 'express';
import mongoose from 'mongoose';
import Analytics from '../models/Analytics';
import Article from '../models/Article';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getTeacherAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?._id;
    
    console.log('📊 Fetching teacher analytics for:', teacherId);

    if (!teacherId) {
      res.status(401).json({ success: false, message: 'Teacher authentication required' });
      return;
    }

  
    const articles = await Article.find({ createdBy: teacherId });
    console.log(`📚 Found ${articles.length} articles by teacher`);
    
    const articleIds = articles.map(a => a._id);
    const totalArticles = articles.length;


    const analyticsData = await Analytics.find({ 
      articleId: { $in: articleIds } 
    }).populate('studentId', 'name email');
    
    console.log(`📈 Found ${analyticsData.length} analytics records`);

  
    const totalViews = analyticsData.reduce((sum, a) => sum + (a.views || 0), 0);
    const uniqueStudentIds = new Set();
    analyticsData.forEach(a => {
      if (a.studentId) uniqueStudentIds.add(a.studentId.toString());
    });
    const totalStudents = uniqueStudentIds.size;

  
    const articleViewMap = new Map();
    analyticsData.forEach(a => {
      const articleId = a.articleId.toString();
      articleViewMap.set(articleId, (articleViewMap.get(articleId) || 0) + a.views);
    });

    const articlesVsViews = articles.map(article => ({
      title: article.title,
      views: articleViewMap.get((article._id as any).toString()) || 0 
    })).sort((a, b) => b.views - a.views);

   
    const categoryCount = new Map();
    articles.forEach(article => {
      const category = article.category;
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    const categoryDistribution = Array.from(categoryCount.entries()).map(([category, count]) => ({
      category,
      count
    }));

 
    const categoryViewMap = new Map();
    articles.forEach(article => {
      const category = article.category;
      const views = articleViewMap.get((article._id as any).toString()) || 0; 
      categoryViewMap.set(category, (categoryViewMap.get(category) || 0) + views);
    });

    const mostViewedCategories = Array.from(categoryViewMap.entries())
      .map(([category, views]) => ({ category, views }))
      .sort((a, b) => b.views - a.views);

    const top3Categories = mostViewedCategories.slice(0, 3);

  
    const studentProgressMap = new Map();
    analyticsData.forEach(a => {
      const studentId = a.studentId?._id?.toString();
      if (!studentId) return;

      if (!studentProgressMap.has(studentId)) {
        studentProgressMap.set(studentId, {
          studentId,
          studentName: (a.studentId as any)?.name || 'Unknown',
          studentEmail: (a.studentId as any)?.email || 'Unknown',
          totalArticlesRead: 0,
          totalViews: 0,
          totalTimeSpent: 0,
          lastActivity: new Date(0)
        });
      }

      const progress = studentProgressMap.get(studentId);
      progress.totalArticlesRead += 1;
      progress.totalViews += a.views || 0;
      progress.totalTimeSpent += Math.round((a.duration || 0) / 60); 
      
      if (a.lastViewed && new Date(a.lastViewed) > progress.lastActivity) {
        progress.lastActivity = a.lastViewed;
      }
    });

    const studentWiseProgress = Array.from(studentProgressMap.values())
      .sort((a, b) => b.totalViews - a.totalViews);

  
    const dailyEngagement = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayViews = analyticsData.filter(a => {
        if (!a.lastViewed) return false;
        const viewDate = new Date(a.lastViewed).toISOString().split('T')[0];
        return viewDate === dateString;
      }).reduce((sum, a) => sum + (a.views || 0), 0);

      dailyEngagement.push({
        date: dateString,
        views: dayViews
      });
    }

    const analytics = {
      overview: {
        totalArticles,
        totalViews,
        totalStudents
      },
      articlesVsViews,
      categoryDistribution,
      mostViewedCategories,
      top3Categories,
      studentWiseProgress,
      dailyEngagement
    };

    console.log(' Teacher analytics calculated:', {
      totalArticles,
      totalViews,
      totalStudents,
      categoriesCount: categoryDistribution.length
    });

    res.json({
      success: true,
      analytics
    });

  } catch (error: any) {
    console.error(' Error fetching teacher analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics',
      error: error.message 
    });
  }
};

export const getStudentAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?._id;
    
    console.log('📊 Fetching student analytics for:', studentId);

    if (!studentId) {
      res.status(401).json({ success: false, message: 'Student authentication required' });
      return;
    }

 
    const analyticsData = await Analytics.find({ studentId })
      .populate('articleId', 'title category');

    console.log(`📈 Found ${analyticsData.length} analytics records for student`);

    const totalArticlesRead = analyticsData.length;
    const totalTimeSpent = Math.round(analyticsData.reduce((sum, a) => sum + (a.duration || 0), 0) / 60); // minutes

   
    const categoryTimeMap: { [key: string]: number } = {};
    analyticsData.forEach(a => {
      const category = (a.articleId as any)?.category || 'Other';
      if (!categoryTimeMap[category]) {
        categoryTimeMap[category] = 0;
      }
      categoryTimeMap[category] += a.duration || 0; 
    });

    const timePerCategory = Object.entries(categoryTimeMap).map(([category, time]) => ({
      category,
      time: time
    }));

   
    const recentArticles = analyticsData
      .filter(a => a.articleId) 
      .sort((a, b) => {
        const dateA = a.lastViewed ? new Date(a.lastViewed).getTime() : 0;
        const dateB = b.lastViewed ? new Date(b.lastViewed).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10)
      .map(a => ({
        articleId: {
          title: (a.articleId as any)?.title || 'Unknown Article',
          category: (a.articleId as any)?.category || 'Other'
        },
        views: a.views || 0,
        timeSpent: Math.round((a.duration || 0) / 60), 
        lastViewed: a.lastViewed || new Date()
      }));

    const analytics = {
      overview: {
        totalArticlesRead,
        totalTimeSpent
      },
      timePerCategory,
      recentArticles
    };

    console.log(' Student analytics calculated:', {
      totalArticlesRead,
      totalTimeSpent,
      categoriesCount: timePerCategory.length,
      recentArticlesCount: recentArticles.length
    });

    res.json({
      success: true,
      analytics
    });

  } catch (error: any) {
    console.error(' Error fetching student analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics',
      error: error.message 
    });
  }
};


export const trackAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleId, duration } = req.body;
    const studentId = req.user?._id;

    console.log('📊 Tracking analytics:', { articleId, duration, studentId });

    if (!articleId || !studentId) {
      res.status(400).json({ success: false, message: 'Article ID and student ID required' });
      return;
    }

    let analytics = await Analytics.findOne({ articleId, studentId });

    if (analytics) {
      analytics.views += 1;
      analytics.duration += duration || 0;
      analytics.lastViewed = new Date();
      await analytics.save();
      console.log(' Updated existing analytics record');
    } else {
      analytics = await Analytics.create({
        articleId,
        studentId,
        views: 1,
        duration: duration || 0,
        lastViewed: new Date()
      });
      console.log(' Created new analytics record');
    }

    res.json({ success: true, analytics });
  } catch (error: any) {
    console.error(' Error tracking analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
