import mongoose, { Schema, Document, Model } from 'mongoose';
import { Team as ITeam } from '../types';

export interface ITeamDocument extends Omit<ITeam, 'id'>, Document {}

const TeamSchema = new Schema<ITeamDocument>({
  school: { type: String, required: true },
  schoolId: { type: String, required: false }, // Optional for backward compatibility, required for new school registrations
  teamName: { type: String, required: true },
  type: { type: String, required: true, enum: ['Putra', 'Putri'] },
  coachName: { type: String, required: true },
  coachPhone: { type: String, required: true },
  members: { type: [String], required: true },
  campNumber: { type: String, required: false, unique: true, sparse: true },
});

TeamSchema.index({ school: 1, type: 1, teamName: 1 }, { unique: true });

const TeamModel: Model<ITeamDocument> = (mongoose.models.Team as Model<ITeamDocument>) || mongoose.model<ITeamDocument>('Team', TeamSchema);

export default TeamModel;