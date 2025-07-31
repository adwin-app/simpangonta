
import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import CompetitionModel from '../../models/Competition';
import TeamModel from '../../models/Team';
import ScoreModel from '../../models/Score';
import UserModel from '../../models/User';
import { JudgeReportData, JudgeReportTeamEntry, UserRole } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { competitionId } = req.query;
        if (!competitionId || typeof competitionId !== 'string') {
            return res.status(400).json({ message: 'Competition ID is required' });
        }

        await connectMongo();

        const [competition, teams, scores, judges] = await Promise.all([
            CompetitionModel.findById(competitionId).lean(),
            TeamModel.find({}).sort({ school: 1, teamName: 1 }).lean(),
            ScoreModel.find({ competitionId }).lean(),
            UserModel.find({ role: UserRole.JURI }).lean()
        ]);

        if (!competition) {
            return res.status(404).json({ message: 'Competition not found' });
        }

        const judgeList = judges.map(j => ({ id: j._id.toString(), username: j.username }));
        
        const processTeams = (teamList: any[]): JudgeReportTeamEntry[] => {
            return teamList.map(team => {
                const teamId = team._id.toString();
                const scoresForTeam = scores.filter(s => s.teamId === teamId);
                
                const scoresByJudge: { [judgeId: string]: number | undefined } = {};
                judgeList.forEach(judge => {
                    const score = scoresForTeam.find(s => s.judgeId === judge.id);
                    scoresByJudge[judge.id] = score ? score.totalScore : undefined;
                });
                
                const totalScoreSum = scoresForTeam.reduce((acc, s) => acc + s.totalScore, 0);
                const averageScore = scoresForTeam.length > 0 ? totalScoreSum / scoresForTeam.length : 0;

                return {
                    teamId: teamId,
                    teamName: team.teamName,
                    school: team.school,
                    scores: scoresByJudge,
                    averageScore: parseFloat(averageScore.toFixed(2)),
                };
            });
        };

        const reportData: JudgeReportData = {
            competitionName: competition.name,
            judges: judgeList,
            putra: processTeams(teams.filter(t => t.type === 'Putra')),
            putri: processTeams(teams.filter(t => t.type === 'Putri')),
        };

        res.status(200).json(reportData);

    } catch (error) {
        console.error('Error fetching judge report:', error);
        res.status(500).json({ error: 'Error fetching judge report data' });
    }
}