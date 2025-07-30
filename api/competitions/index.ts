import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../lib/mongodb';
import CompetitionModel from '../../models/Competition';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectMongo();

    switch (req.method) {
        case 'GET':
            try {
                const competitions = await CompetitionModel.find({});
                res.status(200).json(competitions.map(c => c.toJSON()));
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
                const criteriaWithIds = criteria.map(c => ({...c, id: uuidv4()}));

                const newCompetition = new CompetitionModel({ name, criteria: criteriaWithIds });
                await newCompetition.save();
                res.status(201).json(newCompetition.toJSON());
            } catch (error) {
                if (error.code === 11000) {
                    return res.status(409).json({ error: 'A competition with this name already exists.' });
                }
                res.status(500).json({ error: 'Error adding competition' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
