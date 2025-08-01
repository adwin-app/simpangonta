import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import CompetitionModel from '../../models/Competition';
import TeamModel from '../../models/Team';
import ScoreModel from '../../models/Score';
import UserModel from '../../models/User';
import SchoolModel from '../../models/School';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../types';

const tapakKemahCompetition = { 
  name: 'Tapak Kemah', 
  criteria: [
    {id: uuidv4(), name: 'Kerapian Tenda', maxScore: 100}, 
    {id: uuidv4(), name: 'Kekuatan Ikatan', maxScore: 100}, 
    {id: uuidv4(), name: 'Fungsi Bangunan', maxScore: 100}
  ] 
};

const otherInitialCompetitions = [
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

const initialUsers = [
    { username: 'juri1', password: 'juri1', role: UserRole.JURI }
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectMongo();
    
    const { mode } = req.query;

    // Clear existing data, always
    await CompetitionModel.deleteMany({});
    await TeamModel.deleteMany({});
    await ScoreModel.deleteMany({});
    await UserModel.deleteMany({});
    await SchoolModel.deleteMany({});
    
    if (mode === 'clean') {
        // Only create the core competition
        await CompetitionModel.create(tapakKemahCompetition);
        return res.status(200).json({ message: 'Seluruh data aplikasi telah berhasil dibersihkan dan lomba inti "Tapak Kemah" telah dibuat ulang.' });
    }
    
    // Default behavior: seed all new data
    await CompetitionModel.insertMany([tapakKemahCompetition, ...otherInitialCompetitions]);
    await TeamModel.insertMany(initialTeams);
    
    // Manually create users to trigger password hashing
    for (const userData of initialUsers) {
        const user = new UserModel(userData);
        await user.save();
    }
    
    res.status(200).json({ message: 'Data berhasil direset dan diisi dengan data uji coba!' });
  } catch (error) {
    console.error('Data reset failed:', error);
    res.status(500).json({ message: 'Gagal mereset data', error });
  }
}