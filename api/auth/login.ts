import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import UserModel from '../../models/User';
import { UserRole } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await connectMongo();
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await UserModel.findOne({ username: username.toLowerCase() });

        if (!user) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }
        
        if (user.role !== UserRole.JURI) {
             return res.status(403).json({ error: 'Hanya juri yang dapat login melalui halaman ini' });
        }

        // Return user data without the password
        const userObject = user.toObject();
        const { password: _, ...userWithoutPassword } = userObject;

        res.status(200).json({
            id: user._id.toString(),
            username: user.username,
            role: user.role,
            assignedCompetitionId: user.assignedCompetitionId,
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}