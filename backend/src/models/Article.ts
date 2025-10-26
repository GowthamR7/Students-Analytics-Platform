import mongoose, { Document, Schema } from 'mongoose';

interface IContentBlock {
  type: 'text' | '3d' | 'image' | 'video';
  content: string;
  order: number;
}

export interface IArticle extends Document {
  title: string;
  category: string;
  contentBlocks: IContentBlock[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contentBlockSchema = new Schema({
  type: {
    type: String,
    enum: ['text', '3d', 'image', 'video'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
});

const articleSchema = new Schema<IArticle>({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Science', 'Math', 'English', 'History', 'Geography', 'Computer Science', 'Arts', 'Other']
  },
  contentBlocks: [contentBlockSchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


articleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IArticle>('Article', articleSchema);