import mongoose, { Document, Schema } from 'mongoose';

export interface IMCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface IEssayQuestion {
  question: string;
  maxWords?: number;
  points: number;
}

export interface IAssignment extends Document {
  title: string;
  description: string;
  course?: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  availableFrom?: Date;
  dueDate: Date;
  maxScore: number;
  type: 'mcq' | 'essay' | 'mixed';
  questions: {
    mcq?: IMCQQuestion[];
    essay?: IEssayQuestion[];
  };
  autoCorrect: boolean;
  status: 'draft' | 'published' | 'closed';
  teacher: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mcqQuestionSchema = new Schema<IMCQQuestion>({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function(options: string[]) {
        return options.length === 4;
      },
      message: 'Exactly 4 options are required for MCQ questions'
    }
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer is required'],
    min: 0,
    max: 3,
    validate: {
      validator: function(this: IMCQQuestion, value: number) {
        return value >= 0 && value < this.options.length;
      },
      message: 'Correct answer must be a valid option index (0-3)'
    }
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1']
  }
});

const essayQuestionSchema = new Schema<IEssayQuestion>({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  maxWords: {
    type: Number,
    min: [50, 'Maximum words must be at least 50'],
    max: [5000, 'Maximum words cannot exceed 5000']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1']
  }
});

const assignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: [true, 'Please add an assignment title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add an assignment description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
    index: true
  },
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  availableFrom: {
    type: Date,
    validate: {
      validator: function(this: IAssignment, value: Date) {
        return !value || value <= new Date(this.dueDate);
      },
      message: 'Available date must be before due date'
    }
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(this: IAssignment, value: Date) {
        // Due date must be at least 30 minutes from now
        return value > new Date(Date.now() + 30 * 60 * 1000);
      },
      message: 'Due date must be at least 30 minutes in the future'
    }
  },
  maxScore: {
    type: Number,
    min: [1, 'Maximum score must be at least 1']
  },
  type: {
    type: String,
    required: [true, 'Assignment type is required'],
    enum: {
      values: ['mcq', 'essay', 'mixed'],
      message: 'Assignment type must be mcq, essay, or mixed'
    }
  },
  questions: {
    mcq: [mcqQuestionSchema],
    essay: [essayQuestionSchema]
  },
  autoCorrect: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['draft', 'published', 'closed'],
      message: 'Status must be draft, published, or closed'
    },
    default: 'draft'
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
assignmentSchema.index({ course: 1, status: 1 });
assignmentSchema.index({ teacher: 1 });
assignmentSchema.index({ dueDate: 1 });

// Virtual for submissions count
assignmentSchema.virtual('submissionsCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignment',
  count: true
});

// Virtual for submissions array
assignmentSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignment'
});

// Pre-save middleware to calculate maxScore if not provided
assignmentSchema.pre('save', function(next) {
  if (this.isModified('questions') || this.isNew) {
    let totalPoints = 0;
    
    if (this.questions.mcq) {
      totalPoints += this.questions.mcq.reduce((sum, q) => sum + q.points, 0);
    }
    
    if (this.questions.essay) {
      totalPoints += this.questions.essay.reduce((sum, q) => sum + q.points, 0);
    }
    
    this.maxScore = totalPoints;
  }
  
  // Set autoCorrect based on assignment type
  if (this.type === 'mcq' || this.type === 'mixed') {
    this.autoCorrect = true;
  }
  
  next();
});

// Pre-remove middleware to delete related submissions
assignmentSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    await this.model('Submission').deleteMany({ assignment: this._id });
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<IAssignment>('Assignment', assignmentSchema);
