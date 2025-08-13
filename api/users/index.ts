import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import UserModel from '../../models/User';
import CompetitionModel from '../../models/Competition';
import { User, UserRole } from '../../types';

// Helper to convert DB document to a data transfer object (DTO)
const toUserDTO = (user: any, competitionName?: string): User => ({
    id: (user._id || user.id).toString(),
    username: user.username,
    role: user.role,
    assignedCompetitionId: user.assignedCompetitionId == null ? undefined : String(user.assignedCompetitionId),
    assignedCompetitionName: competitionName || '',
    assignedTeamType: user.assignedTeamType,
    assignedCriteriaIds: user.assignedCriteriaIds || [],
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectMongo();

    switch (req.method) {
        case 'GET':
            try {
                const users = await UserModel.find({ role: UserRole.JURI }).lean();
                const competitions = await CompetitionModel.find({}).lean();
                
                const competitionMap = new Map(competitions.map(c => [c._id.toString(), String(c.name)]));

                const usersWithCompetitionNames = users.map(user => {
                    const compId = user.assignedCompetitionId;
                    const competitionName = compId == null ? undefined : competitionMap.get(String(compId));
                    return toUserDTO(user, competitionName);
                });
                
                res.status(200).json(usersWithCompetitionNames);
            } catch (error) {
                res.status(500).json({ error: 'Error fetching users' });
            }
            break;

        case 'POST':
            try {
                const { username, password } = req.body;
                if (!username || !password) {
                    return res.status(400).json({ error: 'Username and password are required.' });
                }

                const newUser = new UserModel({
                    username,
                    password, // Password will be hashed by the pre-save hook in the model
                    role: UserRole.JURI,
                });
                await newUser.save();
                
                const userObject = newUser.toObject();
                const { password: _, ...userWithoutPassword } = userObject;

                res.status(201).json(toUserDTO(userWithoutPassword));
            } catch (error: any) {
                if (error.code === 11000) {
                    return res.status(409).json({ error: 'A user with this username already exists.' });
                }
                res.status(500).json({ error: 'Error adding user' });
            }
            break;

        case 'PUT':
            try {
                const { id, assignedCompetitionId, assignedTeamType, assignedCriteriaIds } = req.body;
                if (!id) return res.status(400).json({ error: 'User ID is required' });

                const updateData: any = {
                    assignedCompetitionId: assignedCompetitionId || null,
                    assignedTeamType: assignedTeamType || null,
                };

                if (assignedCompetitionId) {
                    updateData.assignedCriteriaIds = Array.isArray(assignedCriteriaIds) ? assignedCriteriaIds : [];
                } else {
                    updateData.assignedCriteriaIds = [];
                }

                const updatedUser = await UserModel.findByIdAndUpdate(
                    id,
                    updateData,
                    { new: true }
                );

                if (!updatedUser) return res.status(404).json({ error: 'User not found' });
                
                res.status(200).json(toUserDTO(updatedUser.toObject()));
            } catch (error: any) {
                res.status(500).json({ error: 'Error updating user' });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.body;
                if (!id) return res.status(400).json({ error: 'User ID is required' });

                const deletedUser = await UserModel.findByIdAndDelete(id);

                if (!deletedUser) return res.status(404).json({ error: 'User not found' });
                
                res.status(200).json({ message: 'User deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Error deleting user' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}