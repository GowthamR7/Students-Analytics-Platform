import { Response } from 'express';
import mongoose from 'mongoose';
import Highlight from '../models/Highlight';
import Article from '../models/Article'; 
import { AuthRequest } from '../middleware/auth';

export const createHighlight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleId, text, note } = req.body;
    const studentId = req.user?._id;

    console.log(' Creating highlight:', { articleId, textLength: text?.length, hasNote: !!note, studentId });

    if (!articleId || !text) {
      console.log(' Missing required fields');
      res.status(400).json({ success: false, message: 'Article ID and text are required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      console.log(' Invalid article ID format:', articleId);
      res.status(400).json({ success: false, message: 'Invalid article ID format' });
      return;
    }

    if (!studentId) {
      console.log(' No student ID from token');
      res.status(401).json({ success: false, message: 'Student authentication required' });
      return;
    }

   
    const article = await Article.findById(articleId);
    if (!article) {
      console.log(' Article not found:', articleId);
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    const highlight = await Highlight.create({
      articleId,
      studentId,
      text: text.trim(),
      note: note?.trim() || null,
      timestamp: new Date()
    });

    console.log(' Highlight created successfully:', highlight._id);
    res.status(201).json({ success: true, highlight });
  } catch (error: any) {
    console.error('Error creating highlight:', error);
    res.status(500).json({ success: false, message: 'Failed to create highlight', error: error.message });
  }
};

export const getHighlights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleId } = req.query;
    const studentId = req.user?._id;

    console.log(' Getting highlights:', { articleId, studentId });

    if (!studentId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const query: any = { studentId };
    
    if (articleId) {
      if (!mongoose.Types.ObjectId.isValid(articleId as string)) {
        res.status(400).json({ success: false, message: 'Invalid article ID' });
        return;
      }
      query.articleId = articleId;
    }

    const highlights = await Highlight.find(query)
      .sort({ timestamp: -1 })
      .limit(100);

    console.log('Found highlights:', highlights.length);
    res.json({ success: true, highlights });
  } catch (error: any) {
    console.error(' Error fetching highlights:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch highlights' });
  }
};

export const deleteHighlight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const studentId = req.user?._id;

    console.log(' Deleting highlight:', { id, studentId });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid highlight ID' });
      return;
    }

    if (!studentId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const highlight = await Highlight.findOne({ _id: id, studentId });

    if (!highlight) {
      console.log(' Highlight not found or not owned by student');
      res.status(404).json({ success: false, message: 'Highlight not found' });
      return;
    }

    await Highlight.findByIdAndDelete(id);
    console.log(' Highlight deleted successfully');
    res.json({ success: true, message: 'Highlight deleted successfully' });
  } catch (error: any) {
    console.error(' Error deleting highlight:', error);
    res.status(500).json({ success: false, message: 'Failed to delete highlight' });
  }
};

export const updateHighlight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const studentId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid highlight ID' });
      return;
    }

    if (!studentId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const highlight = await Highlight.findOne({ _id: id, studentId });

    if (!highlight) {
      res.status(404).json({ success: false, message: 'Highlight not found' });
      return;
    }

    highlight.note = note?.trim() || null;
    await highlight.save();

    res.json({ success: true, highlight });
  } catch (error: any) {
    console.error(' Error updating highlight:', error);
    res.status(500).json({ success: false, message: 'Failed to update highlight' });
  }
};
