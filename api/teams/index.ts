import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import TeamModel from '../../models/Team';
import ScoreModel from '../../models/Score';
import { Team, TeamMember } from '../../types';

// Helper to convert DB document to a data transfer object (DTO) for the frontend
const toTeamDTO = (team: any): Team => ({
    id: team._id.toString(),
    school: team.school,
    schoolId: team.schoolId,
    teamName: team.teamName,
    type: team.type,
    coachName: team.coachName,
    coachPhone: team.coachPhone,
    members: (team.members || []).map((m: any) => {
        // Handle both old string-based members and new object-based members for backward compatibility
        if (typeof m === 'string') {
            return { name: m, participatedCompetitions: [] };
        }
        return {
            name: m.name,
            participatedCompetitions: m.participatedCompetitions || [],
        };
    }),
    campNumber: team.campNumber,
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
                const teamData = req.body;
                // if campNumber is an empty string, treat it as not provided.
                if (!teamData.campNumber) {
                    delete teamData.campNumber;
                }
                if (teamData.members) {
                    teamData.members = teamData.members
                        .filter((m: TeamMember) => m && m.name && m.name.trim())
                        .map((m: TeamMember) => {
                            return {
                                name: m.name.trim(),
                                participatedCompetitions: m.participatedCompetitions || []
                            };
                        });
                }

                const newTeam = new TeamModel(teamData);
                await newTeam.save();
                res.status(201).json(toTeamDTO(newTeam));
            } catch (error: any) {
                 if (error.code === 11000) {
                    if (error.keyPattern?.campNumber) {
                        return res.status(409).json({ error: `Nomor tapak kemah "${error.keyValue.campNumber}" sudah digunakan.` });
                    }
                    const existingTeam = await TeamModel.findOne({ school: req.body.school, type: req.body.type, teamName: req.body.teamName });
                    if(existingTeam){
                       return res.status(409).json({ error: `Nama regu "${req.body.teamName}" sudah digunakan oleh sekolah Anda untuk kategori ${req.body.type}.` });
                    }
                    return res.status(409).json({ error: 'A team with this name for this school and type already exists.' });
                }
                res.status(500).json({ error: 'Error adding team' });
            }
            break;
        case 'PUT':
            try {
                const { id, ...teamData } = req.body;
                if (!id) {
                    return res.status(400).json({ error: 'Team ID is required.' });
                }
                
                // If campNumber is empty string, convert it to null so it's not indexed by sparse unique index
                if (teamData.campNumber === '') {
                    teamData.campNumber = null;
                }
                 if (teamData.members) {
                    teamData.members = teamData.members
                        .filter((m: TeamMember) => m && m.name && m.name.trim())
                        .map((m: TeamMember) => {
                            return {
                                name: m.name.trim(),
                                participatedCompetitions: m.participatedCompetitions || []
                            };
                        });
                }
                
                const updatedTeam = await TeamModel.findByIdAndUpdate(id, teamData, { new: true });
                
                if (!updatedTeam) {
                    return res.status(404).json({ error: 'Team not found.' });
                }
                
                res.status(200).json(toTeamDTO(updatedTeam));
            } catch (error: any) {
                if (error.code === 11000) {
                     if (error.keyPattern?.campNumber) {
                        return res.status(409).json({ error: `Nomor tapak kemah "${error.keyValue.campNumber}" sudah digunakan.` });
                    }
                    return res.status(409).json({ error: `Kombinasi nama regu, sekolah, dan jenis yang Anda masukkan sudah ada.` });
                }
                res.status(500).json({ error: 'Error updating team' });
            }
            break;
        case 'DELETE':
            try {
                const { id } = req.body;
                if (!id) {
                    return res.status(400).json({ error: 'Team ID is required.' });
                }
                
                const deletedTeam = await TeamModel.findByIdAndDelete(id);
                
                if (!deletedTeam) {
                    return res.status(404).json({ error: 'Team not found.' });
                }

                await ScoreModel.deleteMany({ teamId: id });
                
                res.status(200).json({ message: 'Regu dan semua skor terkait berhasil dihapus.' });
            } catch (error) {
                res.status(500).json({ error: 'Error deleting team' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}