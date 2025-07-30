import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../lib/mongodb';
import TeamModel from '../../models/Team';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectMongo();

    switch (req.method) {
        case 'GET':
            try {
                const teams = await TeamModel.find({});
                res.status(200).json(teams.map(t => t.toJSON()));
            } catch (error) {
                res.status(500).json({ error: 'Error fetching teams' });
            }
            break;
        case 'POST':
            try {
                const newTeam = new TeamModel(req.body);
                await newTeam.save();
                res.status(201).json(newTeam.toJSON());
            } catch (error) {
                res.status(500).json({ error: 'Error adding team' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
