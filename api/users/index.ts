import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import UserModel from '../../models/User';
import CompetitionModel from '../../models/Competition';
import { User, UserRole } from '../../types';

// Helper to convert DB document to a data transfer object (DTO)
const toUserDTO = (user: any, competitionName?: string): User => ({
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    assignedCompetitionId: user.assignedCompetitionId,
    assignedCompetitionName: competitionName || '',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectMongo();

    switch (req.method) {
        case 'GET':
            try {
                const users = await UserModel.find({ role: UserRole.JURI }).lean();
                const competitions = await CompetitionModel.find({}).lean();
                
                const competitionMap = new Map(competitions.map(c => [c._id.toString(), c.name]));

                const usersWithCompetitionNames = users.map(user => {
                    const competitionName = user.assignedCompetitionId ? competitionMap.get(user.assignedCompetitionId) : undefined;
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
                    password,
                    role: UserRole.JURI,
                });
                await newUser.save();
                res.status(201).json(toUserDTO(newUser));
            } catch (error: any) {
                if (error.code === 11000) {
                    return res.status(409).json({ error: 'A user with this username already exists.' });
                }
                res.status(500).json({ error: 'Error adding user' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}