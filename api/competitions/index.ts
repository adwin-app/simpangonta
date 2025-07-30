import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import CompetitionModel, { ICompetitionDocument } from '../../models/Competition';
import { v4 as uuidv4 } from 'uuid';
import { Competition } from '../../types';

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
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}