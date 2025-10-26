import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  articleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  views: number;
  duration: number;
  lastViewed: Date;
  sessionData: Array<{
    startTime: Date;
    endTime: Date;
    duration: number;
  }>;
}

const sessionSchema = new Schema({
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 }
});

const analyticsSchema = new Schema<IAnalytics>({
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
  views: {
    type: Number,
    default: 1
  },
  duration: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date,
    default: Date.now
  },
  sessionData: [sessionSchema] 
});

analyticsSchema.index({ studentId: 1, articleId: 1 });

export default mongoose.model<IAnalytics>('Analytics', analyticsSchema);
