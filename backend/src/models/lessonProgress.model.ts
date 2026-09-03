import mongoose, { Document, Schema } from 'mongoose';

export interface ILessonAnswer {
  questionIndex: number;
  answer: string;
  correct: boolean;
}

export interface ILessonProgress extends Document {
  student: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  viewed: boolean;
  viewedAt: Date | null;
  score: number;
  maxScore: number;
  answers: ILessonAnswer[];
  submittedAt: Date | null;
}

const lessonAnswerSchema = new Schema<ILessonAnswer>({
  questionIndex: { type: Number, required: true },
  answer: { type: String, default: '' },
  correct: { type: Boolean, default: false },
});

const lessonProgressSchema = new Schema<ILessonProgress>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a student ID'],
  },
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Please provide a lesson ID'],
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide a course ID'],
  },
  viewed: {
    type: Boolean,
    default: false,
  },
  viewedAt: {
    type: Date,
    default: null,
  },
  score: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    default: 0,
  },
  answers: {
    type: [lessonAnswerSchema],
    default: [],
  },
  submittedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// One progress record per student per lesson
lessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

export default mongoose.model<ILessonProgress>('LessonProgress', lessonProgressSchema);
