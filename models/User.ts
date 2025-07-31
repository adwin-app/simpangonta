import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser, UserRole } from '../types';

export interface IUserDocument extends Document {
  username: string;
  password?: string; // Password is not always sent, e.g., in DTOs
  role: UserRole;
  assignedCompetitionId?: string;
  assignedTeamType?: 'Putra' | 'Putri';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, select: true }, // select: true to fetch it for comparison
  role: { type: String, required: true, enum: Object.values(UserRole) },
  assignedCompetitionId: { type: String, default: null },
  assignedTeamType: { type: String, enum: ['Putra', 'Putri'], default: null },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidatePassword, this.password);
};


const UserModel: Model<IUserDocument> = (mongoose.models.User as Model<IUserDocument>) || mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;