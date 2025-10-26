import mongoose, { Document, Schema } from 'mongoose';

export interface IHighlight extends Document {
  articleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  text: string;
  note?: string;
  timestamp: Date;
  position?: number;
}

const highlightSchema = new Schema<IHighlight>({
  articleId: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  position: {
    type: Number,
    default: 0
  }
});

highlightSchema.index({ studentId: 1, articleId: 1 });
highlightSchema.index({ timestamp: -1 });

export default mongoose.model<IHighlight>('Highlight', highlightSchema);
