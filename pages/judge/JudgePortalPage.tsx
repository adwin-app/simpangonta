


import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { AuthContext } from '../../App';
import { apiService } from '../../services/api';
import { Competition, Team, Score, Criterion } from '../../types';
import { Card, Button, Input } from '../../components/UI';
import { AppColors } from '../../constants';

type ScoreInput = {
    scores: { [criterionId: string]: string };
    notes: string;
};
type ScoreInputState = { [teamId: string]: ScoreInput };

const calculateTotal = (scores: { [criterionId: string]: string }): number => {
    return Object.values(scores).reduce((acc, val) => acc + (Number(val) || 0), 0);
};

// Component for a single row in the scoring table.
const TeamScoreRow: React.FC<{
    team: Team;
    competition: Competition;
    scoreInput: ScoreInput;
    isEditing: boolean;
    isSaving: boolean;
    rowMessage: { teamId: string; text: string; isError: boolean } | null;
    onEdit: (teamId: string) => void;
    onCancel: (teamId: string) => void;
    onSave: (teamId: string) => void;
    onInputChange: (teamId: string, criterionId: string, value: string) => void;
    onNotesChange: (teamId: string, value: string) => void;
}> = ({
    team,
    competition,
    scoreInput,
    isEditing,
    isSaving,
    rowMessage,
    onEdit,
    onCancel,
    onSave,
    onInputChange,
    onNotesChange,
}) => {
    const total = useMemo(() => calculateTotal(scoreInput.scores), [scoreInput.scores]);
    const message = rowMessage?.teamId === team.id ? rowMessage : null;

    return (
        <tr className={isEditing ? 'bg-yellow-50' : ''}>
            <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                <div className="text-sm text-gray-500">{team.school}</div>
            </td>
            {competition.criteria.map(crit => (
                <td key={crit.id} className="px-4 py-4">
                    {isEditing ? (
                        <Input
                            type="number" min="0" max="100"
                            value={scoreInput.scores[crit.id] || ''}
                            onChange={e => onInputChange(team.id, crit.id, e.target.value)}
                            className="w-24"
                        />
                    ) : (
                        <span className="font-medium text-gray-800">{scoreInput.scores[crit.id] || '-'}</span>
                    )}
                </td>
            ))}
            <td className="px-4 py-4 font-bold text-gray-900">{total}</td>
            <td className="px-4 py-4">
                {isEditing ? (
                    <Input
                        type="text" placeholder="Opsional"
                        value={scoreInput.notes}
                        onChange={e => onNotesChange(team.id, e.target.value)}
                    />
                ) : (
                    <span className="text-sm text-gray-600 truncate" title={scoreInput.notes}>{scoreInput.notes || '-'}</span>
                )}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button onClick={() => onSave(team.id)} disabled={isSaving} className="px-3 py-1 text-sm">{isSaving ? '...' : 'Simpan'}</Button>
                            <Button variant="secondary" onClick={() => onCancel(team.id)} className="px-3 py-1 text-sm">Batal</Button>
                        </>
                    ) : (
                        <Button variant="secondary" onClick={() => onEdit(team.id)} className="px-3 py-1 text-sm">Edit</Button>
                    )}
                    {message && <span className={`text-xs font-semibold ${message.isError ? 'text-red-600' : 'text-green-600'}`}>{message.text}</span>}
                </div>
            </td>
        </tr>
    );
};

export const JudgePortalPage: React.FC = () => {
    const [myCompetition, setMyCompetition] = useState<Competition | null>(null);
    const [putraTeams, setPutraTeams] = useState<Team[]>([]);
    const [putriTeams, setPutriTeams] = useState<Team[]>([]);
    const [scoreInputs, setScoreInputs] = useState<ScoreInputState>({});
    const [originalScores, setOriginalScores] = useState<ScoreInputState>({});
    
    const [loading, setLoading] = useState(true);
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [isRowSaving, setIsRowSaving] = useState<string | null>(null);
    const [rowMessage, setRowMessage] = useState<{ teamId: string; text: string; isError: boolean } | null>(null);

    const auth = useContext(AuthContext);

    useEffect(() => {
        const loadData = async () => {
            if (!auth?.identifier || !auth.assignedCompetitionId) {
                setLoading(false);
                return;
            }

            try {
                const { assignedCompetitionId, identifier, assignedTeamType } = auth;
                
                const [allCompetitions, allTeams, judgeScores] = await Promise.all([
                    apiService.getCompetitions(),
                    apiService.getTeams(),
                    apiService.getScores(assignedCompetitionId, identifier)
                ]);

                const foundCompetition = allCompetitions.find(c => c.id === assignedCompetitionId);
                
                if (foundCompetition) {
                    setMyCompetition(foundCompetition);
                    
                    // Filter teams based on judge's assignment
                    const putra = allTeams.filter(t => t.type === 'Putra');
                    const putri = allTeams.filter(t => t.type === 'Putri');
                    setPutraTeams(assignedTeamType === 'Putri' ? [] : putra);
                    setPutriTeams(assignedTeamType === 'Putra' ? [] : putri);

                    const teamsToProcess = assignedTeamType === 'Putri' 
                        ? putri 
                        : assignedTeamType === 'Putra'
                        ? putra
                        : allTeams;

                    const initialScores: ScoreInputState = {};
                    teamsToProcess.forEach(team => {
                        const existingScore = judgeScores.find(s => s.teamId === team.id);
                        const scoresByCriterion: { [criterionId: string]: string } = {};
                        if (existingScore) {
                            foundCompetition.criteria.forEach(crit => {
                                scoresByCriterion[crit.id] = (existingScore.scoresByCriterion[crit.id] || 0).toString();
                            });
                        }
                        initialScores[team.id] = {
                            scores: scoresByCriterion,
                            notes: existingScore?.notes || ''
                        };
                    });
                    setScoreInputs(initialScores);
                    setOriginalScores(JSON.parse(JSON.stringify(initialScores))); // Deep copy for resetting on cancel
                }
            } catch (error) {
                console.error("Failed to load judge portal data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [auth?.identifier, auth?.assignedCompetitionId, auth?.assignedTeamType]);

    const handleInputChange = (teamId: string, criterionId: string, value: string) => {
        setScoreInputs(prev => ({
            ...prev,
            [teamId]: {
                ...(prev[teamId] || { scores: {}, notes: '' }),
                scores: {
                    ...(prev[teamId]?.scores || {}),
                    [criterionId]: value,
                }
            }
        }));
    };

    const handleNotesChange = (teamId: string, value: string) => {
        setScoreInputs(prev => ({
            ...prev,
            [teamId]: {
                ...(prev[teamId] || { scores: {}, notes: '' }),
                notes: value,
            }
        }));
    };

    const handleEdit = (teamId: string) => {
        setEditingTeamId(teamId);
        setRowMessage(null);
    };
    
    const handleCancel = (teamId: string) => {
        setScoreInputs(prev => ({
            ...prev,
            [teamId]: originalScores[teamId] || { scores: {}, notes: '' }
        }));
        setEditingTeamId(null);
    };

    const handleSave = async (teamId: string) => {
        if (!myCompetition || !auth?.identifier) return;

        setIsRowSaving(teamId);
        setRowMessage(null);

        const currentInput = scoreInputs[teamId];
        const scoresByCriterionNum: { [criterionId: string]: number } = {};
        let allScoresValid = true;

        myCompetition.criteria.forEach(crit => {
            const scoreStr = currentInput.scores[crit.id] || '0';
            const scoreNum = Number(scoreStr);
            if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
                allScoresValid = false;
            }
            scoresByCriterionNum[crit.id] = isNaN(scoreNum) ? 0 : scoreNum;
        });

        if (!allScoresValid) {
            setRowMessage({ teamId, text: 'Skor harus antara 0-100', isError: true });
            setIsRowSaving(null);
            return;
        }

        const totalScore = Object.values(scoresByCriterionNum).reduce((acc, val) => acc + val, 0);

        try {
            await apiService.addScore({
                teamId,
                competitionId: myCompetition.id,
                judgeId: auth.identifier,
                scoresByCriterion: scoresByCriterionNum,
                totalScore,
                notes: currentInput.notes,
            });
            
            setOriginalScores(prev => ({ ...prev, [teamId]: currentInput }));
            setRowMessage({ teamId, text: 'Tersimpan!', isError: false });
            setTimeout(() => setRowMessage(null), 3000);
            setEditingTeamId(null);
        } catch (error) {
            setRowMessage({ teamId, text: 'Gagal menyimpan', isError: true });
            console.error(error);
        } finally {
            setIsRowSaving(null);
        }
    };
    
    const renderTeamTable = (teams: Team[], title: string) => {
        if (!myCompetition) return null;
        if (teams.length === 0) {
            // Don't show the table at all if there are no teams for this category
            return null;
        }
        return (
            <Card>
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regu</th>
                                {myCompetition.criteria.map(crit => (
                                    <th key={crit.id} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">{crit.name}</th>
                                ))}
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Total</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {teams.map(team => (
                               <TeamScoreRow
                                   key={team.id}
                                   team={team}
                                   competition={myCompetition}
                                   scoreInput={scoreInputs[team.id] || { scores: {}, notes: '' }}
                                   isEditing={editingTeamId === team.id}
                                   isSaving={isRowSaving === team.id}
                                   rowMessage={rowMessage}
                                   onEdit={handleEdit}
                                   onCancel={handleCancel}
                                   onSave={handleSave}
                                   onInputChange={handleInputChange}
                                   onNotesChange={handleNotesChange}
                               />
                           ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        )
    };
    
    if (loading) return <div>Memuat data...</div>;

    if (!auth?.identifier) {
        return <Card><div className="text-center p-8"><h2 className="text-xl font-bold text-red-600">Akses Ditolak</h2><p className="text-gray-600 mt-2">Sesi tidak valid. Mohon login kembali.</p></div></Card>;
    }
    
    if (!myCompetition) {
        return <Card><div className="text-center p-8"><h2 className="text-xl font-bold text-yellow-600">Belum Ada Tugas</h2><p className="text-gray-600 mt-2">Anda belum ditugaskan untuk menilai lomba apapun. Mohon hubungi panitia.</p></div></Card>;
    }

    const noTeamsToShow = putraTeams.length === 0 && putriTeams.length === 0;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Portal Penilaian Juri</h1>
                <h2 className="text-2xl font-semibold mt-1" style={{color: AppColors.primary}}>
                    Lomba: {myCompetition.name} 
                    {auth.assignedTeamType ? ` (Hanya Regu ${auth.assignedTeamType})` : ''}
                </h2>
            </div>
            
            {renderTeamTable(putraTeams, 'Regu Putra')}
            {renderTeamTable(putriTeams, 'Regu Putri')}
            {noTeamsToShow && (
                <Card>
                    <p className="text-center text-gray-500 py-4">
                        Tidak ada regu yang terdaftar dalam kategori yang ditugaskan kepada Anda.
                    </p>
                </Card>
            )}
        </div>
    );
};