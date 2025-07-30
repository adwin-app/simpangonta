import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import UserModel from '../../models/User';
import { User } from '../../types';

const toUserDTO = (user: any): User => ({
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    assignedCompetitionId: user.assignedCompetitionId,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectMongo();
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    switch (req.method) {
        case 'PUT':
            try {
                // Only allow updating assignedCompetitionId for now
                const { assignedCompetitionId } = req.body;

                const updatedUser = await UserModel.findByIdAndUpdate(
                    id,
                    { assignedCompetitionId: assignedCompetitionId || null },
                    { new: true }
                );

                if (!updatedUser) {
                    return res.status(404).json({ error: 'User not found' });
                }
                res.status(200).json(toUserDTO(updatedUser));
            } catch (error: any) {
                res.status(500).json({ error: 'Error updating user' });
            }
            break;

        case 'DELETE':
            try {
                const deletedUser = await UserModel.findByIdAndDelete(id);

                if (!deletedUser) {
                    return res.status(404).json({ error: 'User not found' });
                }
                
                res.status(200).json({ message: 'User deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Error deleting user' });
            }
            break;

        default:
            res.setHeader('Allow', ['PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}