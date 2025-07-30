import mongoose, { Schema, Document, Model } from 'mongoose';
import { User as IUser, UserRole } from '../types';

export interface IUserDocument extends Document {
  username: string;
  password?: string; // Password is not always sent, e.g., in DTOs
  role: UserRole;
  assignedCompetitionId?: string;
}

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, select: false }, // 'select: false' prevents password from being returned by default
  role: { type: String, required: true, enum: Object.values(UserRole) },
  assignedCompetitionId: { type: String, default: null },
}, {
  timestamps: true,
});


const UserModel: Model<IUserDocument> = (mongoose.models.User as Model<IUserDocument>) || mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;