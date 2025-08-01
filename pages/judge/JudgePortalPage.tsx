

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../App';
import { apiService } from '../../services/api';
import { Competition, Team, Score, Criterion } from '../../types';
import { Card, Button, Input, Textarea } from '../../components/UI';
import { AppColors, CloseIcon } from '../../constants';

type ScoreInput = {
    scores: { [criterionId: string]: string };
    notes: string;
    participants: string[];
};
type ScoreInputState = { [teamId: string]: ScoreInput };

const ScoringModal: React.FC<{
    team: Team;
    competition: Competition;
    initialScore: ScoreInput;
    onClose: () => void;
    onSave: (teamId: string, scoreData: ScoreInput) => Promise<void>;
}> = ({ team, competition, initialScore, onClose, onSave }) => {
    const [scores, setScores] = useState(initialScore.scores);
    const [notes, setNotes] = useState(initialScore.notes);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>(initialScore.participants);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const isTapakKemah = competition.name.toLowerCase() === 'tapak kemah' || competition.participantsPerTeam === 0;

    useEffect(() => {
        // For Tapak Kemah, all members are automatically selected and disabled.
        if (isTapakKemah) {
            setSelectedParticipants(team.members);
        }
    }, [team.members, isTapakKemah]);

    const handleParticipantToggle = (memberName: string) => {
        setSelectedParticipants(prev =>
            prev.includes(memberName)
                ? prev.filter(p => p !== memberName)
                : [...prev, memberName]
        );
    };

    const handleSave = async () => {
        setError('');
        
        // Validation
        for (const crit of competition.criteria) {
            const scoreStr = scores[crit.id] || '0';
            const scoreNum = Number(scoreStr);
            if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > crit.maxScore) {
                setError(`Nilai untuk "${crit.name}" harus antara 0 dan ${crit.maxScore}.`);
                return;
            }
        }
        
        if (!isTapakKemah && selectedParticipants.length === 0) {
            setError('Pilih minimal satu peserta yang mengikuti lomba ini.');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(team.id, { scores, notes, participants: selectedParticipants });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan nilai.');
        } finally {
            setIsSaving(false);
        }
    };

    const totalScore = useMemo(() => {
        return Object.values(scores).reduce((acc, val) => acc + (Number(val) || 0), 0);
    }, [scores]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Beri Nilai: {competition.name}</h2>
                        <p className="text-lg font-semibold text-gray-700">{team.teamName} <span className="text-gray-500">({team.school})</span></p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="overflow-y-auto flex-grow pr-2 space-y-6">
                    {/* Participant Selection */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">
                            Pilih Peserta yang Mengikuti Lomba
                            {!isTapakKemah && ` (Dibutuhkan: ${competition.participantsPerTeam} orang)`}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border rounded-lg bg-gray-50">
                            {team.members.map(member => (
                                <label key={member} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedParticipants.includes(member)}
                                        onChange={() => handleParticipantToggle(member)}
                                        disabled={isTapakKemah}
                                        className="h-5 w-5 rounded text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{member}</span>
                                </label>
                            ))}
                        </div>
                         {isTapakKemah && <p className="text-xs text-gray-500 mt-1">Untuk Tapak Kemah, semua anggota regu otomatis terpilih.</p>}
                    </div>

                    {/* Scoring */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Input Nilai</h3>
                        <div className="space-y-3">
                            {competition.criteria.map(crit => (
                                <div key={crit.id} className="grid grid-cols-3 items-center gap-4">
                                    <label htmlFor={crit.id} className="font-medium text-sm text-gray-700 col-span-1">{crit.name}</label>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <Input
                                            id={crit.id}
                                            type="number"
                                            min="0"
                                            max={crit.maxScore}
                                            value={scores[crit.id] || ''}
                                            onChange={e => setScores(prev => ({ ...prev, [crit.id]: e.target.value }))}
                                            className="w-32"
                                            placeholder="Nilai"
                                        />
                                        <span className="text-sm text-gray-500">/ {crit.maxScore}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                     {/* Notes and Total */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div>
                            <label htmlFor="notes" className="font-semibold text-gray-800 mb-2 block">Catatan (Opsional)</label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Catatan untuk regu ini..."
                            />
                        </div>
                        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4">
                             <p className="text-lg font-semibold text-gray-600">Total Skor</p>
                             <p className="text-5xl font-bold" style={{color: AppColors.primary}}>{totalScore}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-6 mt-auto">
                    {error && <p className="text-red-500 font-semibold">{error}</p>}
                    <Button variant="secondary" onClick={onClose}>Batal</Button>
                    <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan Nilai'}</Button>
                </div>
            </Card>
        </div>
    );
};

export const JudgePortalPage: React.FC = () => {
    const [myCompetition, setMyCompetition] = useState<Competition | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);
    const [scoringTeam, setScoringTeam] = useState<Team | null>(null);
    
    const auth = useContext(AuthContext);

    const loadData = async () => {
        // Added a more robust check to ensure auth object and its properties are valid
        if (!auth || !auth.identifier || !auth.assignedCompetitionId) {
            setLoading(false);
            return;
        }

        try {
            const { assignedCompetitionId, identifier, assignedTeamType } = auth;
            
            setLoading(true);
            const [allCompetitions, allTeams, judgeScores] = await Promise.all([
                apiService.getCompetitions(),
                apiService.getTeams(),
                apiService.getScores(assignedCompetitionId, identifier)
            ]);

            const foundCompetition = allCompetitions.find(c => c.id === assignedCompetitionId);
            setMyCompetition(foundCompetition || null);

            let filteredTeams = allTeams;
            if (assignedTeamType) {
                filteredTeams = allTeams.filter(t => t.type === assignedTeamType);
            }
            setTeams(filteredTeams);
            setScores(judgeScores);

        } catch (error) {
            console.error("Failed to load judge portal data:", error);
            alert("Gagal memuat data portal juri. Coba muat ulang halaman.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [auth]);


    const handleSaveScore = async (teamId: string, scoreData: ScoreInput) => {
        if (!myCompetition || !auth?.identifier) return;

        const scoresByCriterionNum: { [criterionId: string]: number } = {};
        myCompetition.criteria.forEach(crit => {
            scoresByCriterionNum[crit.id] = Number(scoreData.scores[crit.id] || '0');
        });

        const totalScore = Object.values(scoresByCriterionNum).reduce((acc, val) => acc + val, 0);

        await apiService.addScore({
            teamId,
            competitionId: myCompetition.id,
            judgeId: auth.identifier,
            scoresByCriterion: scoresByCriterionNum,
            totalScore,
            notes: scoreData.notes,
            participants: scoreData.participants,
        });
        
        // Refresh data after saving
        await loadData();
    };
    
    const renderTeamTable = (teamList: Team[], title: string) => {
        if (!myCompetition) return null;
        if (teamList.length === 0) return null;

        return (
            <Card>
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regu & Peserta</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {teamList.map(team => {
                               const score = scores.find(s => s.teamId === team.id);
                               const hasScore = !!score;
                               return (
                                   <tr key={team.id}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                                            <div className="text-sm text-gray-500">{team.school}</div>
                                             {score && score.participants && score.participants.length > 0 && (
                                                <div className="text-xs text-gray-600 mt-2">
                                                    <span className="font-semibold">Peserta: </span>
                                                    {score.participants.join(', ')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                             <span className={`font-bold text-lg ${hasScore ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {score ? score.totalScore : 'Belum dinilai'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Button onClick={() => setScoringTeam(team)} className="px-3 py-1 text-sm">
                                                {hasScore ? 'Edit Nilai' : 'Beri Nilai'}
                                            </Button>
                                        </td>
                                   </tr>
                               );
                           })}
                        </tbody>
                    </table>
                </div>
            </Card>
        )
    };
    
    if (loading) return <div>Memuat data...</div>;
    if (!auth?.identifier) return <Card><div className="text-center p-8"><h2 className="text-xl font-bold text-red-600">Akses Ditolak</h2><p className="text-gray-600 mt-2">Sesi tidak valid. Mohon login kembali.</p></div></Card>;
    if (!myCompetition) return <Card><div className="text-center p-8"><h2 className="text-xl font-bold text-yellow-600">Belum Ada Tugas</h2><p className="text-gray-600 mt-2">Anda belum ditugaskan untuk menilai lomba apapun. Mohon hubungi panitia.</p></div></Card>;

    const putraTeams = teams.filter(t => t.type === 'Putra');
    const putriTeams = teams.filter(t => t.type === 'Putri');
    const noTeamsToShow = teams.length === 0;

    const initialScoreForModal = useMemo((): ScoreInput => {
        if (!scoringTeam) {
            return { scores: {}, notes: '', participants: [] };
        }
        const foundScore = scores.find(s => s.teamId === scoringTeam.id);
        if (foundScore) {
            const scoresAsString: { [criterionId: string]: string } = {};
            if (foundScore.scoresByCriterion) {
                Object.entries(foundScore.scoresByCriterion).forEach(([key, value]) => {
                    scoresAsString[key] = String(value);
                });
            }
            return {
                scores: scoresAsString,
                notes: foundScore.notes || '',
                participants: foundScore.participants || [],
            };
        }
        return { scores: {}, notes: '', participants: [] };
    }, [scoringTeam, scores]);

    return (
        <div className="space-y-6">
            {scoringTeam && myCompetition && (
                <ScoringModal
                    team={scoringTeam}
                    competition={myCompetition}
                    initialScore={initialScoreForModal}
                    onClose={() => setScoringTeam(null)}
                    onSave={handleSaveScore}
                />
            )}
            <div className="text-center">
                <h1 className="text-3xl font-bold">Portal Penilaian Juri</h1>
                <h2 className="text-2xl font-semibold mt-1" style={{color: AppColors.primary}}>
                    Lomba: {myCompetition.name} 
                    {auth?.assignedTeamType ? ` (Hanya Regu ${auth.assignedTeamType})` : ''}
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
