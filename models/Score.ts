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

// For team-based competitions, this unique index is correct.
// For individual competitions, a judge can score multiple members from the same team.
// We remove the unique index and handle upserts programmatically.
// ScoreSchema.index({ teamId: 1, competitionId: 1, judgeId: 1 }, { unique: true });
ScoreSchema.index({ teamId: 1, competitionId: 1, judgeId: 1, memberName: 1 }, { unique: true, sparse: true });


const ScoreModel: Model<IScoreDocument> = (mongoose.models.Score as Model<IScoreDocument>) || mongoose.model<IScoreDocument>('Score', ScoreSchema);

export default ScoreModel;