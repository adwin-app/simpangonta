import mongoose, { Schema, Document, Model } from 'mongoose';
import { Criterion } from '../types';

const CriterionSchema = new Schema<Criterion>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  maxScore: { type: Number, required: true, default: 100 },
}, { _id: false });

// This interface defines the data properties of a competition.
// It helps create a clear type for lean objects.
export interface ICompetition {
    name: string;
    criteria: Criterion[];
    participantsPerTeam: number;
}

// The full Mongoose document interface now extends the data interface and Document.
// This is a more robust pattern for TypeScript with Mongoose.
export interface ICompetitionDocument extends ICompetition, Document {}

const CompetitionSchema = new Schema<ICompetitionDocument>({
  name: { type: String, required: true, unique: true },
  criteria: { type: [CriterionSchema], required: true },
  participantsPerTeam: { type: Number, required: true, default: 1 }, // 0 means all
});

const CompetitionModel: Model<ICompetitionDocument> = (mongoose.models.Competition as Model<ICompetitionDocument>) || mongoose.model<ICompetitionDocument>('Competition', CompetitionSchema);

export default CompetitionModel;