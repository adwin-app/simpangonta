
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


// 1. Indeks unik untuk skor tim (di mana memberName adalah null atau tidak ada)
ScoreSchema.index(
    { teamId: 1, competitionId: 1, judgeId: 1 }, 
    { 
      unique: true,
      // Indeks ini hanya berlaku untuk dokumen di mana memberName adalah null atau tidak ada.
      partialFilterExpression: { memberName: null } 
    }
);

// 2. Indeks unik untuk skor individu (di mana memberName adalah string non-null)
ScoreSchema.index(
    { teamId: 1, competitionId: 1, judgeId: 1, memberName: 1 },
    { 
      unique: true, 
      // Indeks ini hanya berlaku untuk dokumen di mana memberName ada dan bukan null.
      partialFilterExpression: { memberName: { $exists: true, $ne: null } } 
    }
);


const ScoreModel: Model<IScoreDocument> = (mongoose.models.Score as Model<IScoreDocument>) || mongoose.model<IScoreDocument>('Score', ScoreSchema);

export default ScoreModel;
