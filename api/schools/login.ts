import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import SchoolModel from '../../models/School';
import { UserRole } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await connectMongo();
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi.' });
        }

        const school = await SchoolModel.findOne({ email: email.toLowerCase() });

        if (!school) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        const isMatch = await school.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Return user data without the password, but add the role
        const schoolObject = school.toObject();
        const { password: _, ...schoolWithoutPassword } = schoolObject;

        res.status(200).json({
            id: school._id.toString(),
            ...schoolWithoutPassword,
            role: UserRole.SEKOLAH, // Add role for the frontend auth context
        });

    } catch (error) {
        console.error('School login error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan internal pada server.' });
    }
}
