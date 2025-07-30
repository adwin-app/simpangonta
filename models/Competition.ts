import mongoose, { Schema, Document, Model } from 'mongoose';
import { Competition as ICompetition, Criterion } from '../types';

const CriterionSchema = new Schema<Criterion>({
  id: { type: String, required: true },
  name: { type: String, required: true },
}, { _id: false });

export interface ICompetitionDocument extends Document {
  name: string;
  criteria: Criterion[];
}

const CompetitionSchema = new Schema({
  name: { type: String, required: true, unique: true },
  criteria: { type: [CriterionSchema], required: true },
});

const CompetitionModel: Model<ICompetitionDocument> = (mongoose.models.Competition as Model<ICompetitionDocument>) || mongoose.model<ICompetitionDocument>('Competition', CompetitionSchema);

export default CompetitionModel;
