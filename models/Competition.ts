import mongoose, { Schema, Document, Model } from 'mongoose';
import { Competition as ICompetition, Criterion } from '../types';

const CriterionSchema = new Schema<Criterion>({
  id: { type: String, required: true },
  name: { type: String, required: true },
}, { _id: false });

export interface ICompetitionDocument extends Omit<ICompetition, 'id'>, Document {}

const CompetitionSchema = new Schema<ICompetitionDocument>({
  name: { type: String, required: true, unique: true },
  criteria: { type: [CriterionSchema], required: true },
});

CompetitionSchema.virtual('id').get(function(this: ICompetitionDocument) {
  return this._id.toString();
});

CompetitionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_doc: Document, ret: Record<string, any>) {
    delete ret._id;
  }
});

const CompetitionModel: Model<ICompetitionDocument> = (mongoose.models.Competition as Model<ICompetitionDocument>) || mongoose.model<ICompetitionDocument>('Competition', CompetitionSchema);

export default CompetitionModel;
