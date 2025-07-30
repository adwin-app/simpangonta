import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import ScoreModel from '../../models/Score';

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
                });
                res.status(200).json(scores.map(s => s.toJSON()));
            } catch (error) {
                res.status(500).json({ error: 'Error fetching scores' });
            }
            break;
        case 'POST':
            try {
                const { teamId, competitionId, judgeId, scoresByCriterion, totalScore, notes } = req.body;
                if (!teamId || !competitionId || !judgeId || !scoresByCriterion) {
                    return res.status(400).json({ error: 'Missing required fields for score submission.' });
                }

                const filter = { teamId, competitionId, judgeId };
                const update = { scoresByCriterion, totalScore, notes };
                const options = { upsert: true, new: true, setDefaultsOnInsert: true };

                const score = await ScoreModel.findOneAndUpdate(filter, update, options);

                if (score) {
                    res.status(201).json(score.toJSON());
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
