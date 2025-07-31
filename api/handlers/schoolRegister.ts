import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import SchoolModel from '../../models/School';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await connectMongo();
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nama sekolah, email, dan password wajib diisi.' });
        }
        
        const existingSchool = await SchoolModel.findOne({ email: email.toLowerCase() });
        if(existingSchool) {
            return res.status(409).json({ error: 'Email ini sudah terdaftar.' });
        }

        const newSchool = new SchoolModel({
            name,
            email,
            password, // Password will be hashed by the pre-save hook in the model
        });

        await newSchool.save();

        const schoolObject = newSchool.toObject();
        // Don't send password back
        const { password: _, ...schoolWithoutPassword } = schoolObject;

        res.status(201).json({
             id: (newSchool as any)._id.toString(),
            ...schoolWithoutPassword
        });

    } catch (error: any) {
        console.error('School registration error:', error);
        if (error.code === 11000) {
             return res.status(409).json({ error: 'Email ini sudah terdaftar.' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan internal pada server.' });
    }
}
