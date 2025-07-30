import mongoose, { Schema, Document, Model } from 'mongoose';
import { Team as ITeam } from '../types';

export interface ITeamDocument extends Omit<ITeam, 'id'>, Document {}

const TeamSchema = new Schema<ITeamDocument>({
  school: { type: String, required: true },
  teamName: { type: String, required: true },
  type: { type: String, required: true, enum: ['Putra', 'Putri'] },
  coachName: { type: String, required: true },
  coachPhone: { type: String, required: true },
  members: { type: [String], required: true },
});

TeamSchema.virtual('id').get(function(this: ITeamDocument) {
  return this._id.toString();
});

TeamSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
  }
});


const TeamModel: Model<ITeamDocument> = (mongoose.models.Team as Model<ITeamDocument>) || mongoose.model<ITeamDocument>('Team', TeamSchema);

export default TeamModel;