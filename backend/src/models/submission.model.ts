import mongoose, { Document, Schema } from 'mongoose';

export interface IMCQAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  points: number;
}

export interface IEssayAnswer {
  questionId: string;
  answer: string;
  wordCount: number;
  points?: number;
  feedback?: string;
}

export interface ISubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  mcqAnswers?: IMCQAnswer[];
  essayAnswers?: IEssayAnswer[];
  content?: string; // For backward compatibility with essay-only assignments
  attachmentUrl?: string;
  score?: number;
  maxScore: number;
  feedback?: string;
  autoGraded?: boolean;
  gradedAt?: Date;
  submittedAt: Date;
  updatedAt: Date;
}

const mcqAnswerSchema = new Schema<IMCQAnswer>({
  questionId: {
    type: String,
    required: true
  },
  selectedAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  }
});

const essayAnswerSchema = new Schema<IEssayAnswer>({
  questionId: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  wordCount: {
    type: Number,
    required: true,
    min: 0
  },
  points: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  }
});

const submissionSchema = new Schema<ISubmission>({
  assignment: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required'],
    index: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    index: true
  },
  mcqAnswers: [mcqAnswerSchema],
  essayAnswers: [essayAnswerSchema],
  content: {
    type: String,
    trim: true
  },
  attachmentUrl: {
    type: String
  },
  score: {
    type: Number,
    min: 0
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  autoGraded: {
    type: Boolean,
    default: false
  },
  gradedAt: {
    type: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1, submittedAt: -1 });
submissionSchema.index({ assignment: 1, submittedAt: -1 });

// Pre-save middleware to calculate word count for essay answers
submissionSchema.pre('save', function(next) {
  if (this.isModified('essayAnswers') && this.essayAnswers) {
    this.essayAnswers.forEach(answer => {
      answer.wordCount = answer.answer.split(/\s+/).filter(word => word.length > 0).length;
    });
  }
  
  // Set content field for backward compatibility
  if (this.essayAnswers && this.essayAnswers.length > 0) {
    this.content = this.essayAnswers.map(answer => answer.answer).join('\n\n');
  }
  
  next();
});

export default mongoose.model<ISubmission>('Submission', submissionSchema);
