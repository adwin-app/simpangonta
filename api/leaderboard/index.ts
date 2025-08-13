

import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectMongo from '../../lib/mongodb';
import CompetitionModel from '../../models/Competition';
import TeamModel from '../../models/Team';
import ScoreModel, { IScoreDocument } from '../../models/Score';
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
                const individualScores = scoresForCompetition
                    .filter(s => s.teamId && s.totalScore > 0) 
                    .sort((a, b) => b.totalScore - a.totalScore);

                // This part correctly awards medals to the team of the winning individual
                const awardIndividualMedal = (rank: number, scoreDoc: IScoreDocument | undefined) => {
                    if (!scoreDoc) return;
                    const teamId = scoreDoc.teamId;
                    if (teamId && teamStats[teamId]) { 
                        if (rank === 1) teamStats[teamId].gold += 1;
                        else if (rank === 2) teamStats[teamId].silver += 1;
                        else if (rank === 3) teamStats[teamId].bronze += 1;
                    }
                };
                awardIndividualMedal(1, individualScores[0]);
                awardIndividualMedal(2, individualScores[1]);
                awardIndividualMedal(3, individualScores[2]);

                // NEW LOGIC: Instead of names, mark the rank (1, 2, 3) for the winning teams
                // Initialize all teams with a default value for this competition
                 filteredTeams.forEach(team => {
                    teamStats[team.id].scoresByCompetition[competitionId] = "-";
                });

                // Get the top 3 winners
                const topWinners = individualScores.slice(0, 3);

                // Mark the rank for each winning team
                topWinners.forEach((winner, index) => {
                    const rank = index + 1;
                    const teamId = winner.teamId;
                    if (teamId && teamStats[teamId]) {
                        const currentBestRank = teamStats[teamId].scoresByCompetition[competitionId];
                        // If the team already has a rank, only update if the new rank is better (lower number)
                        if (typeof currentBestRank !== 'number' || rank < currentBestRank) {
                            teamStats[teamId].scoresByCompetition[competitionId] = rank;
                        }
                    }
                });

            } else {
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

                const isTapakKemah = competitionId === tapakKemahId;
                const awardTeamMedal = (rank: number, scoreEntry: { teamId: string; score: number } | undefined) => {
                    if (!scoreEntry || scoreEntry.score <= 0) return;
                    const teamId = scoreEntry.teamId;
                    if (teamId && teamStats[teamId]) {
                        if (isTapakKemah) {
                            if (rank === 1) teamStats[teamId].gold += 3;
                            else if (rank === 2) teamStats[teamId].gold += 2;
                            else if (rank === 3) teamStats[teamId].gold += 1;
                        } else {
                            if (rank === 1) teamStats[teamId].gold += 1;
                            else if (rank === 2) teamStats[teamId].silver += 1;
                            else if (rank === 3) teamStats[teamId].bronze += 1;
                        }
                    }
                };
                awardTeamMedal(1, teamScoresForCompetition[0]);
                awardTeamMedal(2, teamScoresForCompetition[1]);
                awardTeamMedal(3, teamScoresForCompetition[2]);
            }
        });

        filteredTeams.forEach(team => {
            if (teamStats[team.id]) {
                 const numericScores = Object.values(teamStats[team.id].scoresByCompetition).filter(v => typeof v === 'number') as number[];
                teamStats[team.id].totalScore = numericScores.reduce((acc, curr) => acc + curr, 0);
            }
        });
        
        const teamListForRanking = filteredTeams.map(team => {
            const calculatedMedals = {
                gold: teamStats[team.id]?.gold || 0,
                silver: teamStats[team.id]?.silver || 0,
                bronze: teamStats[team.id]?.bronze || 0,
            };

            const finalMedals = team.manualMedals ? {
                gold: team.manualMedals.gold,
                silver: team.manualMedals.silver,
                bronze: team.manualMedals.bronze,
            } : calculatedMedals;

            return {
                teamId: team.id,
                teamName: team.teamName,
                school: team.school,
                scoresByCompetition: teamStats[team.id]?.scoresByCompetition || {},
                totalScore: teamStats[team.id]?.totalScore || 0,
                medals: finalMedals,
                tapakKemahScore: teamStats[team.id]?.tapakKemahScore || 0,
                isManual: !!team.manualMedals,
            };
        });
        
        teamListForRanking.sort((a, b) => {
            if (a.medals.gold !== b.medals.gold) return b.medals.gold - a.medals.gold;
            if (a.medals.silver !== b.medals.silver) return b.medals.silver - a.medals.silver;
            if (a.medals.bronze !== b.medals.bronze) return b.medals.bronze - a.medals.bronze;
            if (a.tapakKemahScore !== b.tapakKemahScore) return b.tapakKemahScore - a.tapakKemahScore;
            if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
            return 0;
        });
        
        const finalLeaderboard: LeaderboardEntry[] = teamListForRanking.reduce((acc, entry, index) => {
            let rank = index + 1;
            if (index > 0) {
                const prevEntryInSortedList = teamListForRanking[index - 1];
                const isTied = prevEntryInSortedList.medals.gold === entry.medals.gold &&
                               prevEntryInSortedList.medals.silver === entry.medals.silver &&
                               prevEntryInSortedList.medals.bronze === entry.medals.bronze &&
                               prevEntryInSortedList.tapakKemahScore === entry.tapakKemahScore &&
                               prevEntryInSortedList.totalScore === entry.totalScore;
                
                if (isTied) {
                    // If tied, use the rank of the previous entry that was already added to our final list
                    rank = acc[index - 1].rank;
                }
            }
            acc.push({
                rank,
                teamId: entry.teamId,
                teamName: entry.teamName,
                school: entry.school,
                scoresByCompetition: entry.scoresByCompetition,
                totalScore: entry.totalScore,
                medals: entry.medals,
                isManual: entry.isManual,
            });
            return acc;
        }, [] as LeaderboardEntry[]);

        res.status(200).json(finalLeaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Error fetching leaderboard' });
    }
}