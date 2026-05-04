import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    deviceId: string;
  };
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    deviceInfo: {
      userAgent: {
        type: String,
        required: true,
      },
      ip: {
        type: String,
        required: true,
      },
      deviceId: {
        type: String,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1 });

// Method to update last activity
sessionSchema.methods.updateLastActivity = function () {
  this.lastActivity = new Date();
  return this.save();
};

const Session = mongoose.model<ISession>('Session', sessionSchema);

export default Session;
