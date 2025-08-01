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
  participants: { type: [String], default: [] },
}, {
  timestamps: true,
});

ScoreSchema.index({ teamId: 1, competitionId: 1, judgeId: 1 }, { unique: true });

const ScoreModel: Model<IScoreDocument> = (mongoose.models.Score as Model<IScoreDocument>) || mongoose.model<IScoreDocument>('Score', ScoreSchema);

export default ScoreModel;