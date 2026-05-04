import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  level: 'preparatory' | 'secondary';
  duration: number;
  status: 'draft' | 'published' | 'archived';
  requirements: string[];
  learningOutcomes: string[];
  thumbnail?: string;
  videoUrl?: string;
  files: ICourseFile[];
  teacher: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

const courseFileSchema = new Schema<ICourseFile>({
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

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a course description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Please add a course category'],
    enum: [
      'Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education',
      'للغة العربية', 'اللغة الإنجليزية', 'الرياضيات', 'العلوم', 'الدراسات الاجتماعية', 'التربية الدينية الإسلامية', 
      'التربية الدينية المسيحية', 'التربية الرياضية', 'التربية الفنية', 'الكمبيوتر وتكنولوجيا المعلومات',
      'اللغة الأجنبية الثانية (فرنساوي / ألماني / إيطالي / إسباني)', 'الفيزياء', 'الكيمياء', 'الأحياء', 
      'الجيولوجيا وعلوم البيئة', 'الفلسفة والمنطق', 'علم النفس والاجتماع', 'الرياضيات البحتة', 'الرياضيات التطبيقية'
    ],
  },
  level: {
    type: String,
    required: [true, 'Please add a course level'],
    enum: ['preparatory', 'secondary'],
  },
  duration: {
    type: Number,
    required: [true, 'Please add course duration in weeks'],
    min: [1, 'Duration must be at least 1 week'],
  },
  status: {
    type: String,
    required: [true, 'Please add a course status'],
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  requirements: {
    type: [String],
    default: [],
  },
  learningOutcomes: {
    type: [String],
    default: [],
  },
  thumbnail: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  files: {
    type: [courseFileSchema],
    default: [],
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a teacher'],
  },
}, {
  timestamps: true,
});

// Virtual for student count
courseSchema.virtual('studentsCount', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  count: true,
});

// Cascade delete sections when a course is deleted
courseSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Sections being removed from course ${this._id}`);
  await this.model('Section').deleteMany({ course: this._id });
  next();
});

export default mongoose.model<ICourse>('Course', courseSchema);
