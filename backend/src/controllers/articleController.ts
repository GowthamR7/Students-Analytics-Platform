import { Response } from 'express';
import mongoose from 'mongoose';
import Article from '../models/Article';
import { AuthRequest } from '../middleware/auth';

export const getAllArticles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const articles = await Article.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: articles.length, articles });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getArticleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid article ID' });
      return;
    }

    const article = await Article.findById(id).populate('createdBy', 'name email');

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    res.json({ success: true, article });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTeacherArticles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?._id;

    const articles = await Article.find({ createdBy: teacherId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: articles.length, articles });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, category, contentBlocks } = req.body;

    if (!title || !category || !contentBlocks) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const article = await Article.create({
      title,
      category,
      contentBlocks,
      createdBy: req.user?._id
    });

    const populatedArticle = await Article.findById(article._id).populate('createdBy', 'name email');

    res.status(201).json({ success: true, article: populatedArticle });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid article ID' });
      return;
    }

    const article = await Article.findById(id);

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    if (article.createdBy.toString() !== String(req.user?._id)) {
      res.status(403).json({ success: false, message: 'Not authorized to update this article' });
      return;
    }

    const updatedArticle = await Article.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name email');

    res.json({ success: true, article: updatedArticle });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid article ID' });
      return;
    }

    const article = await Article.findById(id);

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    if (article.createdBy.toString() !== String(req.user?._id)) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this article' });
      return;
    }

    await Article.findByIdAndDelete(id);

    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
