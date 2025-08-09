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
                if (!competitionId || !judgeId) {
                    return res.status(400).json({ error: 'competitionId and judgeId are required' });
                }
                const scores = await ScoreModel.find({
                    competitionId: competitionId as string,
                    judgeId: judgeId as string,
                }).lean();
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
                // If memberName is provided, it's an individual score. Add it to the filter.
                // null or undefined memberName means it's a team score.
                filter.memberName = memberName || null;
                
                const update = { scoresByCriterion, totalScore, notes };
                const options = { upsert: true, new: true, setDefaultsOnInsert: true };

                const score = await ScoreModel.findOneAndUpdate(filter, update, options);

                if (score) {
                    res.status(201).json(toScoreDTO(score));
                } else {
                    res.status(500).json({ error: 'Failed to save the score.' });
                }
            } catch (error) {
                res.status(500).json({ error: 'Error submitting score' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}