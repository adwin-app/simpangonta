import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../lib/mongodb';
import CompetitionModel from '../../models/Competition';
import TeamModel from '../../models/Team';
import ScoreModel from '../../models/Score';

const initialCompetitions = [
  { id: 'lomba-1', name: 'tapak kemah', criteria: [{id: 'k-1-1', name: 'Kerapian'}, {id: 'k-1-2', name: 'Kekuatan'}, {id: 'k-1-3', name: 'Fungsi'}] },
  { id: 'lomba-2', name: 'Gelas Racing', criteria: [{id: 'k-2-1', name: 'Kecepatan'}, {id: 'k-2-2', name: 'Keseimbangan'}] },
  { id: 'lomba-3', name: 'KIM', criteria: [{id: 'k-3-1', name: 'Ketepatan'}] },
  { id: 'lomba-4', name: 'Cerdas Cermat', criteria: [{id: 'k-4-1', name: 'Skor'}] },
  { id: 'lomba-5', name: 'Kuda Tuli', criteria: [{id: 'k-5-1', name: 'Kekompakan'}, {id: 'k-5-2', name: 'Kreativitas'}] },
];

const initialTeams = [
    {id: 'tim-1', school: 'SMPN 1 Gondangwetan', teamName: 'Elang', type: 'Putra', coachName: 'Budi', coachPhone: '081234567890', members: ['Andi', 'Beni', 'Candra', 'Dedi', 'Eko', 'Fahmi', 'Gani', 'Hadi', 'Irfan', 'Joko']},
    {id: 'tim-2', school: 'SMPN 1 Gondangwetan', teamName: 'Melati', type: 'Putri', coachName: 'Siti', coachPhone: '081234567891', members: ['Ani', 'Bunga', 'Citra', 'Dewi', 'Eka', 'Fina', 'Gina', 'Hana', 'Indah', 'Jeni']},
    {id: 'tim-3', school: 'MTs Al-Hidayah', teamName: 'Harimau', type: 'Putra', coachName: 'Ahmad', coachPhone: '081234567892', members: ['Kiki', 'Lilo', 'Miko', 'Nano', 'Opik', 'Piko', 'Qori', 'Rian', 'Soni', 'Toni']},
    {id: 'tim-4', school: 'MTs Al-Hidayah', teamName: 'Anggrek', type: 'Putri', coachName: 'Aisyah', coachPhone: '081234567893', members: ['Kikiwati', 'Lila', 'Mika', 'Nana', 'Opikah', 'Pika', 'Qoriah', 'Riani', 'Sonia', 'Toniwati']}
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
