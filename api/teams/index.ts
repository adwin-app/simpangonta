import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import TeamModel from '../../models/Team';
import { Team } from '../../types';

// Helper to convert DB document to a data transfer object (DTO) for the frontend
const toTeamDTO = (team: any): Team => ({
    id: team._id.toString(),
    school: team.school,
    teamName: team.teamName,
    type: team.type,
    coachName: team.coachName,
    coachPhone: team.coachPhone,
    members: team.members,
});


export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectMongo();

    switch (req.method) {
        case 'GET':
            try {
                const teams = await TeamModel.find({}).lean();
                res.status(200).json(teams.map(toTeamDTO));
            } catch (error) {
                res.status(500).json({ error: 'Error fetching teams' });
            }
            break;
        case 'POST':
            try {
                const newTeam = new TeamModel(req.body);
                await newTeam.save();
                res.status(201).json(toTeamDTO(newTeam));
            } catch (error) {
                res.status(500).json({ error: 'Error adding team' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}