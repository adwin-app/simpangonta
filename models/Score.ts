

import mongoose, { Schema, Document, Model } from 'mongoose';
import { Score as IScore } from '../types';

export interface IScoreDocument extends Omit<IScore, 'id'>, Document {}

const ScoreSchema = new Schema<IScoreDocument>({
  teamId: { type: String, required: true, index: true },
  competitionId: { type: String, required: true, index: true },
  judgeId: { type: String, required: true, index: true },
  scoresByCriterion: { type: Map, of: Number, required: true },
  totalScore: { type: Number, required: true },
  notes: { type: String },
  memberName: { type: String, required: false },
}, {
  timestamps: true,
});


// The unique index has been removed. The application's `findOneAndUpdate` logic in the API
// is sufficient to handle the upsert behavior, preventing duplicate scores for the
// same team-competition-judge-participant combination. Removing the explicit index
// resolves conflicts when submitting multiple individual scores from the same team.

const ScoreModel: Model<IScoreDocument> = (mongoose.models.Score as Model<IScoreDocument>) || mongoose.model<IScoreDocument>('Score', ScoreSchema);

export default ScoreModel;