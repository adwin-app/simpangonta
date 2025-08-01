import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import CompetitionModel from '../../models/Competition';
import ScoreModel from '../../models/Score';
import { v4 as uuidv4 } from 'uuid';
import { Competition, Criterion } from '../../types';

const TAPAK_KEMAH_NAME = 'Tapak Kemah';

// Helper to convert DB document to a data transfer object (DTO) for the frontend
const toCompetitionDTO = (comp: any): Competition => ({
    id: comp._id.toString(),
    name: comp.name,
    criteria: comp.criteria.map((c: any) => ({ id: c.id, name: c.name, maxScore: c.maxScore })),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectMongo();

    switch (req.method) {
        case 'GET':
            try {
                const competitions = await CompetitionModel.find({}).lean();
                // Handle legacy data that might not have maxScore
                const competitionsWithDefaults = competitions.map(comp => ({
                    ...comp,
                    criteria: comp.criteria.map(crit => ({ ...crit, maxScore: crit.maxScore || 100 }))
                }))
                res.status(200).json(competitionsWithDefaults.map(toCompetitionDTO));
            } catch (error) {
                res.status(500).json({ error: 'Error fetching competitions' });
            }
            break;
        case 'POST':
            try {
                const { name, criteria } = req.body;
                if (!name || !criteria || !Array.isArray(criteria) || criteria.length === 0) {
                    return res.status(400).json({ error: 'Name and criteria are required.' });
                }
                const criteriaWithIds = criteria.map((c: { name: string, maxScore: number}) => ({
                    ...c, 
                    id: uuidv4(),
                    maxScore: c.maxScore || 100
                }));

                const newCompetition = new CompetitionModel({ name, criteria: criteriaWithIds });
                await newCompetition.save();
                res.status(201).json(toCompetitionDTO(newCompetition));
            } catch (error: any) {
                if (error.code === 11000) {
                    return res.status(409).json({ error: 'A competition with this name already exists.' });
                }
                res.status(500).json({ error: 'Error adding competition' });
            }
            break;
        case 'PUT':
            try {
                const { id, name, criteria } = req.body;
                if (!id || !name || !criteria || !Array.isArray(criteria)) {
                    return res.status(400).json({ error: 'ID, name and criteria are required.' });
                }

                const existingCompetition = await CompetitionModel.findById(id).lean();
                if (existingCompetition && existingCompetition.name.toLowerCase() === TAPAK_KEMAH_NAME.toLowerCase() && name.toLowerCase() !== TAPAK_KEMAH_NAME.toLowerCase()) {
                    return res.status(403).json({ error: 'Nama lomba "Tapak Kemah" tidak dapat diubah karena merupakan lomba inti.' });
                }

                const criteriaWithIds = criteria.map((c: Criterion) => ({
                    id: c.id.startsWith('new-') ? uuidv4() : c.id,
                    name: c.name,
                    maxScore: c.maxScore || 100,
                }));

                const updatedCompetition = await CompetitionModel.findByIdAndUpdate(
                    id,
                    { name, criteria: criteriaWithIds },
                    { new: true, runValidators: true }
                );

                if (!updatedCompetition) {
                    return res.status(404).json({ error: 'Competition not found' });
                }
                res.status(200).json(toCompetitionDTO(updatedCompetition));
            } catch (error: any) {
                 if (error.code === 11000) {
                    return res.status(409).json({ error: 'A competition with this name already exists.' });
                }
                res.status(500).json({ error: 'Error updating competition' });
            }
            break;
        case 'DELETE':
            try {
                const { id } = req.body;
                 if (!id) {
                    return res.status(400).json({ error: 'Competition ID is required' });
                }

                const competitionToDelete = await CompetitionModel.findById(id).lean();
                if (competitionToDelete && competitionToDelete.name.toLowerCase() === TAPAK_KEMAH_NAME.toLowerCase()) {
                    return res.status(403).json({ error: 'Lomba "Tapak Kemah" tidak dapat dihapus karena merupakan lomba inti sistem.' });
                }

                const deletedCompetition = await CompetitionModel.findByIdAndDelete(id);

                if (!deletedCompetition) {
                    return res.status(404).json({ error: 'Competition not found' });
                }
                
                // Also delete all scores associated with this competition
                await ScoreModel.deleteMany({ competitionId: id });

                res.status(200).json({ message: 'Competition and associated scores deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Error deleting competition' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}