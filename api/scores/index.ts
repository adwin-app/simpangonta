
import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import ScoreModel from '../../models/Score';
import { Score } from '../../types';

// Helper to convert DB document to a data transfer object (DTO) for the frontend
const toScoreDTO = (score: any): Score => ({
    id: score._id.toString(),
    teamId: score.teamId,
    competitionId: score.competitionId,
    judgeId: score.judgeId,
    scoresByCriterion: score.scoresByCriterion,
    totalScore: score.totalScore,
    notes: score.notes,
    memberName: score.memberName,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectMongo();

    switch (req.method) {
        case 'GET':
            try {
                const { competitionId, judgeId } = req.query;
                if (!competitionId) {
                    return res.status(400).json({ error: 'competitionId is required' });
                }
                const filter: any = { competitionId: competitionId as string };
                if (judgeId) {
                    filter.judgeId = judgeId as string;
                }
                
                const scores = await ScoreModel.find(filter).lean();
                res.status(200).json(scores.map(toScoreDTO));
            } catch (error) {
                res.status(500).json({ error: 'Error fetching scores' });
            }
            break;
        case 'POST':
            try {
                const { teamId, competitionId, judgeId, scoresByCriterion, totalScore, notes, memberName } = req.body;
                if (!teamId || !competitionId || !judgeId || !scoresByCriterion) {
                    return res.status(400).json({ error: 'Missing required fields for score submission.' });
                }

                const filter: any = { teamId, competitionId, judgeId };
                // Handle individual vs team scores. A trimmed, non-empty string is an individual.
                // Anything else (null, undefined, empty string) is treated as a team score.
                const cleanMemberName = (memberName && String(memberName).trim()) ? String(memberName).trim() : null;
                filter.memberName = cleanMemberName;
                
                const update = { scoresByCriterion, totalScore, notes };
                const options = { upsert: true, new: true, setDefaultsOnInsert: true };

                const score = await ScoreModel.findOneAndUpdate(filter, update, options);

                if (score) {
                    res.status(201).json(toScoreDTO(score));
                } else {
                    res.status(500).json({ error: 'Gagal menyimpan skor karena alasan yang tidak diketahui.' });
                }
            } catch (error: any) {
                 if (error.code === 11000) {
                    // Unique key violation
                    const { memberName } = req.body;
                    const target = (memberName && String(memberName).trim()) ? `peserta "${String(memberName).trim()}"` : `regu ini`;
                    return res.status(409).json({ error: `Gagal menyimpan: Anda telah memasukkan nilai untuk ${target} sebelumnya.` });
                }
                console.error('Error submitting score:', error);
                res.status(500).json({ error: 'Terjadi kesalahan internal saat menyimpan skor. Silakan coba lagi.' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
