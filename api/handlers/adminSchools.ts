import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import SchoolModel from '../../models/School';
import { School } from '../../types';

// Helper to convert DB document to a data transfer object (DTO)
const toSchoolDTO = (school: any): School => ({
    id: school._id.toString(),
    name: school.name,
    email: school.email,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Note: In a real app, this endpoint should be protected to ensure only admins can access it.
    // The current architecture relies on client-side routing protection.
    
    await connectMongo();

    switch (req.method) {
        case 'GET':
            try {
                // Fetch all schools and sort by name
                const schools = await SchoolModel.find({}).sort({ name: 1 }).lean();
                res.status(200).json(schools.map(toSchoolDTO));
            } catch (error) {
                res.status(500).json({ error: 'Error fetching schools' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}