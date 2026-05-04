import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  description: string;
  videoUrl?: string;
  files: ILessonFile[];
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILessonFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

const lessonFileSchema = new Schema<ILessonFile>({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const lessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a lesson description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  videoUrl: {
    type: String,
  },
  files: {
    type: [lessonFileSchema],
    default: [],
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please add a course'],
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a teacher'],
  },
  order: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
lessonSchema.index({ course: 1, order: 1 });

export default mongoose.model<ILesson>('Lesson', lessonSchema);
