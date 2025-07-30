import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ISchoolDocument extends Document {
  name: string;
  email: string;
  password?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const SchoolSchema = new Schema<ISchoolDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
}, {
  timestamps: true,
});

// Hash password before saving
SchoolSchema.pre('save', async function (next) {
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

// Method to compare password for login
SchoolSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
   if (!this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidatePassword, this.password);
};

const SchoolModel: Model<ISchoolDocument> = (mongoose.models.School as Model<ISchoolDocument>) || mongoose.model<ISchoolDocument>('School', SchoolSchema);

export default SchoolModel;
