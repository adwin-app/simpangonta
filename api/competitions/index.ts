import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import CompetitionModel from '../../models/Competition';
import ScoreModel from '../../models/Score';
import { v4 as uuidv4 } from 'uuid';
import { Competition, Criterion } from '../../types';

// Helper to convert DB document to a data transfer object (DTO) for the frontend
const toCompetitionDTO = (comp: any): Competition => ({
    id: comp._id.toString(),
    name: comp.name,
    criteria: comp.criteria.map((c: any) => ({ id: c.id, name: c.name })),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectMongo();

    switch (req.method) {
        case 'GET':
            try {
                const competitions = await CompetitionModel.find({}).lean();
                res.status(200).json(competitions.map(toCompetitionDTO));
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
                const criteriaWithIds = criteria.map((c: { name: string}) => ({...c, id: uuidv4()}));

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

                const criteriaWithIds = criteria.map((c: Criterion) => ({
                    id: c.id.startsWith('new-') ? uuidv4() : c.id,
                    name: c.name,
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