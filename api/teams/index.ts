import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import TeamModel from '../../models/Team';
import { Team } from '../../types';

// Helper to convert DB document to a data transfer object (DTO) for the frontend
const toTeamDTO = (team: any): Team => ({
    id: team._id.toString(),
    school: team.school,
    schoolId: team.schoolId,
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
                const { schoolId } = req.query;
                const query = schoolId ? { schoolId: schoolId as string } : {};
                const teams = await TeamModel.find(query).lean();
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
            } catch (error: any) {
                 if (error.code === 11000) {
                    const existingTeam = await TeamModel.findOne({ school: req.body.school, type: req.body.type, teamName: req.body.teamName });
                    if(existingTeam){
                       return res.status(409).json({ error: `Nama regu "${req.body.teamName}" sudah digunakan oleh sekolah Anda untuk kategori ${req.body.type}.` });
                    }
                    return res.status(409).json({ error: 'A team with this name for this school and type already exists.' });
                }
                res.status(500).json({ error: 'Error adding team' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}