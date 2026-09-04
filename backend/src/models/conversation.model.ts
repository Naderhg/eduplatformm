import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  _id?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]; // [teacher, student]
  teacher: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCountTeacher: number;
  unreadCountStudent: number;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  read: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
}, { _id: true, timestamps: { createdAt: true, updatedAt: false } });

const conversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  unreadCountTeacher: { type: Number, default: 0 },
  unreadCountStudent: { type: Number, default: 0 },
  messages: { type: [messageSchema], default: [] },
}, {
  timestamps: true,
});

// Ensure one conversation per teacher-student pair
conversationSchema.index({ teacher: 1, student: 1 }, { unique: true });

export default mongoose.model<IConversation>('Conversation', conversationSchema);
