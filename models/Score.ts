

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

// Define correct unique indexes using partial filters to resolve the saving conflict.
// This allows a judge to score multiple individuals from the same team in one competition.

// 1. Unique index for individual scores (where memberName is a string).
// A judge can only submit one score for a specific participant in a competition.
ScoreSchema.index(
    { teamId: 1, competitionId: 1, judgeId: 1, memberName: 1 },
    {
        unique: true,
        partialFilterExpression: { memberName: { $type: "string" } }
    }
);

// 2. Unique index for team scores (where memberName is null).
// A judge can only submit one score for a specific team in a competition.
ScoreSchema.index(
    { teamId: 1, competitionId: 1, judgeId: 1 },
    {
        unique: true,
        partialFilterExpression: { memberName: null }
    }
);


const ScoreModel: Model<IScoreDocument> = (mongoose.models.Score as Model<IScoreDocument>) || mongoose.model<IScoreDocument>('Score', ScoreSchema);

export default ScoreModel;
