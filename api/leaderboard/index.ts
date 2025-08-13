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
        const { type, includeUnpublished } = req.query;
        if (type !== 'Putra' && type !== 'Putri') {
            return res.status(400).json({ message: 'Type query parameter must be either "Putra" or "Putri"' });
        }

        await connectMongo();

        const competitionQuery = includeUnpublished === 'true' ? {} : { isPublished: true };
        const competitions = await CompetitionModel.find(competitionQuery).lean();
        const teams = await TeamModel.find({ type }).lean();
        
        if (competitions.length === 0 || teams.length === 0) {
            return res.status(200).json([]);
        }

        const teamIds = teams.map(t => t._id.toString());
        const scores = await ScoreModel.find({ teamId: { $in: teamIds } }).lean();
        
        const filteredTeams = teams.map(t => ({...t, id: t._id.toString()}));
        
        if (filteredTeams.length === 0) return res.status(200).json([]);
        
        const tapakKemahCompetition = competitions.find(c => c.name.toLowerCase() === 'tapak kemah');
        const tapakKemahId = tapakKemahCompetition?._id.toString();

        const teamStats: { [teamId: string]: {
            gold: number; silver: number; bronze: number;
            tapakKemahScore: number;
            scoresByCompetition: { [competitionId: string]: number | string };
            totalScore: number;
        } } = {};

        filteredTeams.forEach(team => {
            teamStats[team.id] = { gold: 0, silver: 0, bronze: 0, tapakKemahScore: 0, scoresByCompetition: {}, totalScore: 0 };
        });

        competitions.forEach(competition => {
            const competitionId = competition._id.toString();
            const scoresForCompetition = scores.filter(s => s.competitionId === competitionId);
            
            if (competition.isIndividual) {
                // Individual competition logic
                const individualScores = scoresForCompetition.filter(s => s.teamId).sort((a, b) => b.totalScore - a.totalScore);
                
                if (individualScores.length >= 1 && individualScores[0].totalScore > 0 && teamStats[individualScores[0].teamId]) {
                    teamStats[individualScores[0].teamId].gold += 1;
                }
                if (individualScores.length >= 2 && individualScores[1].totalScore > 0 && teamStats[individualScores[1].teamId]) {
                    teamStats[individualScores[1].teamId].silver += 1;
                }
                if (individualScores.length >= 3 && individualScores[2].totalScore > 0 && teamStats[individualScores[2].teamId]) {
                    teamStats[individualScores[2].teamId].bronze += 1;
                }

                // Mark this competition as "Individual" for display, no single score to show.
                 filteredTeams.forEach(team => {
                    if (teamStats[team.id]) {
                       teamStats[team.id].scoresByCompetition[competitionId] = "Individu";
                    }
                });

            } else {
                 // Team-based competition logic
                const teamScoresForCompetition = filteredTeams.map(team => {
                    const teamScores = scoresForCompetition.filter(s => s.teamId === team.id);
                    const finalScore = teamScores.length > 0
                        ? teamScores.reduce((acc, s) => acc + s.totalScore, 0) / teamScores.length
                        : 0;
                    
                    if (teamStats[team.id]) {
                        teamStats[team.id].scoresByCompetition[competitionId] = parseFloat(finalScore.toFixed(2));
                        if (competitionId === tapakKemahId) {
                            teamStats[team.id].tapakKemahScore = finalScore;
                        }
                    }
                    return { teamId: team.id, score: finalScore };
                }).sort((a, b) => b.score - a.score);

                // Award medals for team competitions
                const isTapakKemah = competitionId === tapakKemahId;
                if (isTapakKemah) {
                    if (teamScoresForCompetition.length >= 1 && teamScoresForCompetition[0].score > 0 && teamStats[teamScoresForCompetition[0].teamId]) teamStats[teamScoresForCompetition[0].teamId].gold += 3;
                    if (teamScoresForCompetition.length >= 2 && teamScoresForCompetition[1].score > 0 && teamStats[teamScoresForCompetition[1].teamId]) teamStats[teamScoresForCompetition[1].teamId].gold += 2;
                    if (teamScoresForCompetition.length >= 3 && teamScoresForCompetition[2].score > 0 && teamStats[teamScoresForCompetition[2].teamId]) teamStats[teamScoresForCompetition[2].teamId].gold += 1;
                } else {
                    if (teamScoresForCompetition.length >= 1 && teamScoresForCompetition[0].score > 0 && teamStats[teamScoresForCompetition[0].teamId]) teamStats[teamScoresForCompetition[0].teamId].gold += 1;
                    if (teamScoresForCompetition.length >= 2 && teamScoresForCompetition[1].score > 0 && teamStats[teamScoresForCompetition[1].teamId]) teamStats[teamScoresForCompetition[1].teamId].silver += 1;
                    if (teamScoresForCompetition.length >= 3 && teamScoresForCompetition[2].score > 0 && teamStats[teamScoresForCompetition[2].teamId]) teamStats[teamScoresForCompetition[2].teamId].bronze += 1;
                }
            }
        });

        filteredTeams.forEach(team => {
            if (teamStats[team.id]) {
                 const numericScores = Object.values(teamStats[team.id].scoresByCompetition).filter(v => typeof v === 'number') as number[];
                teamStats[team.id].totalScore = numericScores.reduce((acc, curr) => acc + curr, 0);
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
            if (a.medals.gold !== b.medals.gold) return b.medals.gold - a.medals.gold;
            if (a.medals.silver !== b.medals.silver) return b.medals.silver - a.medals.silver;
            if (a.medals.bronze !== b.medals.bronze) return b.medals.bronze - a.medals.bronze;
            if (a.tapakKemahScore !== b.tapakKemahScore) return b.tapakKemahScore - a.tapakKemahScore;
            if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
            return 0;
        });
        
        const finalLeaderboard: LeaderboardEntry[] = teamListForRanking.map((entry, index, arr) => {
            let rank = index + 1;
            if (index > 0) {
                const prev = arr[index - 1];
                // Check if current entry is tied with the previous one
                const isTied = prev.medals.gold === entry.medals.gold &&
                               prev.medals.silver === entry.medals.silver &&
                               prev.medals.bronze === entry.medals.bronze &&
                               prev.tapakKemahScore === entry.tapakKemahScore &&
                               prev.totalScore === entry.totalScore;
                if (isTied) {
                    // find rank of previous entry in final array
                    const prevFinal = finalLeaderboard[index -1];
                    rank = prevFinal.rank;
                }
            }
            return {
                ...entry,
                rank,
            };
        });

        res.status(200).json(finalLeaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Error fetching leaderboard' });
    }
}