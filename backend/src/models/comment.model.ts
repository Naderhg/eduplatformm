import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  course: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  isReply: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, 'Please provide comment content'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters'],
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide a course'],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide an author'],
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  isReply: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
commentSchema.index({ course: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });

// Pre-save middleware to set isReply based on parentComment
commentSchema.pre('save', function(next) {
  if (this.parentComment) {
    this.isReply = true;
  } else {
    this.isReply = false;
  }
  next();
});

export default mongoose.model<IComment>('Comment', commentSchema);
