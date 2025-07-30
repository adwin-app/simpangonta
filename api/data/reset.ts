import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import CompetitionModel from '../../models/Competition';
import TeamModel from '../../models/Team';
import ScoreModel from '../../models/Score';
import { v4 as uuidv4 } from 'uuid';

const initialCompetitions = [
  { name: 'tapak kemah', criteria: [{id: uuidv4(), name: 'Kerapian'}, {id: uuidv4(), name: 'Kekuatan'}, {id: uuidv4(), name: 'Fungsi'}] },
  { name: 'Gelas Racing', criteria: [{id: uuidv4(), name: 'Kecepatan'}, {id: uuidv4(), name: 'Keseimbangan'}] },
  { name: 'KIM', criteria: [{id: uuidv4(), name: 'Ketepatan'}] },
  { name: 'Cerdas Cermat', criteria: [{id: uuidv4(), name: 'Skor'}] },
  { name: 'Kuda Tuli', criteria: [{id: uuidv4(), name: 'Kekompakan'}, {id: uuidv4(), name: 'Kreativitas'}] },
];

const initialTeams = [
    { school: 'SMPN 1 Gondangwetan', teamName: 'Elang', type: 'Putra', coachName: 'Budi', coachPhone: '081234567890', members: ['Andi', 'Beni', 'Candra', 'Dedi', 'Eko', 'Fahmi', 'Gani', 'Hadi', 'Irfan', 'Joko']},
    { school: 'SMPN 1 Gondangwetan', teamName: 'Melati', type: 'Putri', coachName: 'Siti', coachPhone: '081234567891', members: ['Ani', 'Bunga', 'Citra', 'Dewi', 'Eka', 'Fina', 'Gina', 'Hana', 'Indah', 'Jeni']},
    { school: 'MTs Al-Hidayah', teamName: 'Harimau', type: 'Putra', coachName: 'Ahmad', coachPhone: '081234567892', members: ['Kiki', 'Lilo', 'Miko', 'Nano', 'Opik', 'Piko', 'Qori', 'Rian', 'Soni', 'Toni']},
    { school: 'MTs Al-Hidayah', teamName: 'Anggrek', type: 'Putri', coachName: 'Aisyah', coachPhone: '081234567893', members: ['Kikiwati', 'Lila', 'Mika', 'Nana', 'Opikah', 'Pika', 'Qoriah', 'Riani', 'Sonia', 'Toniwati']}
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectMongo();
    
    // Clear existing data
    await CompetitionModel.deleteMany({});
    await TeamModel.deleteMany({});
    await ScoreModel.deleteMany({});
    
    // Seed new data
    await CompetitionModel.insertMany(initialCompetitions);
    await TeamModel.insertMany(initialTeams);
    
    res.status(200).json({ message: 'Data reset and seeded successfully!' });
  } catch (error) {
    console.error('Data reset failed:', error);
    res.status(500).json({ message: 'Failed to reset data', error });
  }
}