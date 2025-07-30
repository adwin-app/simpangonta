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
}, {
  timestamps: true,
});

ScoreSchema.index({ teamId: 1, competitionId: 1, judgeId: 1 }, { unique: true });


ScoreSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

ScoreSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  }
});

const ScoreModel: Model<IScoreDocument> = mongoose.models.Score || mongoose.model<IScoreDocument>('Score', ScoreSchema);

export default ScoreModel;
