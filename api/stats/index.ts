import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../lib/mongodb';
import TeamModel from '../../models/Team';
import CompetitionModel from '../../models/Competition';
import ScoreModel from '../../models/Score';
import { DashboardStats } from '../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    
    try {
        await connectMongo();

        const totalTeams = await TeamModel.countDocuments();
        const totalCompetitions = await CompetitionModel.countDocuments();
        
        const teams = await TeamModel.find({}, 'type members').lean();
        const totalParticipants = teams.reduce((acc, team) => acc + team.members.length, 0);
        const teamsByType = {
            putra: teams.filter(t => t.type === 'Putra').length,
            putri: teams.filter(t => t.type === 'Putri').length,
        };
        
        const scoresByJudgeAggregation = await ScoreModel.aggregate([
            { $group: { _id: "$judgeId", count: { $sum: 1 } } },
            { $project: { judgeId: "$_id", count: 1, _id: 0 } }
        ]);

        const stats: DashboardStats = {
            totalTeams,
            totalParticipants,
            teamsByType,
            totalCompetitions,
            scoresByJudge: scoresByJudgeAggregation,
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Failed to get dashboard stats:', error);
        res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
    }
}
