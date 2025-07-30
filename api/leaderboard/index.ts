import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import CompetitionModel from '../../models/Competition';
import TeamModel from '../../models/Team';
import ScoreModel from '../../models/Score';
import { LeaderboardEntry } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { type } = req.query;
        if (type !== 'Putra' && type !== 'Putri') {
            return res.status(400).json({ message: 'Type query parameter must be either "Putra" or "Putri"' });
        }

        await connectMongo();

        const competitions = await CompetitionModel.find({}).lean();
        const teams = await TeamModel.find({ type }).lean();
        const scores = await ScoreModel.find({ teamId: { $in: teams.map(t => t._id.toString()) } }).lean();
        
        const filteredTeams = teams.map(t => ({...t, id: t._id.toString()}));
        
        if (filteredTeams.length === 0) return res.status(200).json([]);
        
        const tapakKemahCompetition = competitions.find(c => c.name.toLowerCase() === 'tapak kemah');
        const tapakKemahId = tapakKemahCompetition?._id.toString();

        const teamStats: { [teamId: string]: {
            gold: number; silver: number; bronze: number;
            tapakKemahScore: number;
            scoresByCompetition: { [competitionId: string]: number };
            totalScore: number;
        } } = {};

        filteredTeams.forEach(team => {
            teamStats[team.id] = { gold: 0, silver: 0, bronze: 0, tapakKemahScore: 0, scoresByCompetition: {}, totalScore: 0 };
        });

        competitions.forEach(competition => {
            const competitionId = competition._id.toString();
            
            // Get latest scores for this competition
            const scoresForCompetition = scores.filter(s => s.competitionId === competitionId);
            
            const teamScoresForCompetition = filteredTeams.map(team => {
                const teamScores = scoresForCompetition.filter(s => s.teamId === team.id);
                // In a real scenario, you might average scores from multiple judges. Here we take the highest/latest for simplicity.
                const finalScore = teamScores.length > 0 ? Math.max(...teamScores.map(s => s.totalScore)) : 0;
                
                if (teamStats[team.id]) {
                    teamStats[team.id].scoresByCompetition[competitionId] = finalScore;
                    if (competitionId === tapakKemahId) {
                        teamStats[team.id].tapakKemahScore = finalScore;
                    }
                }
                return { teamId: team.id, score: finalScore };
            }).sort((a, b) => b.score - a.score);

            // Award medals
            if (competitionId === tapakKemahId) {
                if (teamScoresForCompetition.length >= 1 && teamScoresForCompetition[0].score > 0) teamStats[teamScoresForCompetition[0].teamId].gold += 3;
                if (teamScoresForCompetition.length >= 2 && teamScoresForCompetition[1].score > 0) teamStats[teamScoresForCompetition[1].teamId].gold += 2;
                if (teamScoresForCompetition.length >= 3 && teamScoresForCompetition[2].score > 0) teamStats[teamScoresForCompetition[2].teamId].gold += 1;
            } else {
                if (teamScoresForCompetition.length >= 1 && teamScoresForCompetition[0].score > 0) teamStats[teamScoresForCompetition[0].teamId].gold += 1;
                if (teamScoresForCompetition.length >= 2 && teamScoresForCompetition[1].score > 0) teamStats[teamScoresForCompetition[1].teamId].silver += 1;
                if (teamScoresForCompetition.length >= 3 && teamScoresForCompetition[2].score > 0) teamStats[teamScoresForCompetition[2].teamId].bronze += 1;
            }
        });

        filteredTeams.forEach(team => {
            if (teamStats[team.id]) {
                teamStats[team.id].totalScore = Object.values(teamStats[team.id].scoresByCompetition).reduce((acc, curr) => acc + curr, 0);
            }
        });
        
        const teamListForRanking = filteredTeams.map(team => ({
            teamId: team.id,
            teamName: team.teamName,
            school: team.school,
            scoresByCompetition: teamStats[team.id]?.scoresByCompetition || {},
            totalScore: teamStats[team.id]?.totalScore || 0,
            medals: {
                gold: teamStats[team.id]?.gold || 0,
                silver: teamStats[team.id]?.silver || 0,
                bronze: teamStats[team.id]?.bronze || 0,
            },
            tapakKemahScore: teamStats[team.id]?.tapakKemahScore || 0,
        }));
        
        teamListForRanking.sort((a, b) => {
            // Standard medal count sorting: Gold > Silver > Bronze
            if (a.medals.gold !== b.medals.gold) return b.medals.gold - a.medals.gold;
            if (a.medals.silver !== b.medals.silver) return b.medals.silver - a.medals.silver;
            if (a.medals.bronze !== b.medals.bronze) return b.medals.bronze - a.medals.bronze;
            // Specific tie-breaker from competition rules
            if (a.tapakKemahScore !== b.tapakKemahScore) return b.tapakKemahScore - a.tapakKemahScore;
            // Final tie-breaker: total score across all competitions
            if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
            return 0; // Teams are tied
        });
        
        const finalLeaderboard = teamListForRanking.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));

        res.status(200).json(finalLeaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Error fetching leaderboard' });
    }
}