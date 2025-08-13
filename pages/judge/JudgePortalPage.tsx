

import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { AuthContext } from '../../App';
import { apiService } from '../../services/api';
import { Competition, Team, Score, Criterion, TeamMember } from '../../types';
import { Card, Button, Input } from '../../components/UI';
import { AppColors } from '../../constants';

type ScoreInput = {
    scores: { [criterionId: string]: string };
    notes: string;
};
type ScoreInputState = { [id: string]: ScoreInput }; // Key is teamId or participantKey

type Participant = TeamMember & { teamId: string; teamName: string; school: string };

const calculateTotal = (scores: { [criterionId: string]: string }): number => {
    return Object.values(scores).reduce((acc, val) => acc + (Number(val) || 0), 0);
};

const TeamScoreRow: React.FC<{
    team: Team;
    criteria: Criterion[];
    scoreInput: ScoreInput;
    isEditing: boolean;
    isSaving: boolean;
    rowMessage: { id: string; text: string; isError: boolean } | null;
    onEdit: (id: string) => void;
    onCancel: (id: string) => void;
    onSave: (id: string) => void;
    onInputChange: (id: string, criterionId: string, value: string) => void;
    onNotesChange: (id: string, value: string) => void;
}> = ({ team, criteria, scoreInput, isEditing, isSaving, rowMessage, onEdit, onCancel, onSave, onInputChange, onNotesChange }) => {
    const total = useMemo(() => calculateTotal(scoreInput.scores), [scoreInput.scores]);
    const message = rowMessage?.id === team.id ? rowMessage : null;

    return (
        <tr className={isEditing ? 'bg-yellow-50' : ''}>
            <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                <div className="text-sm text-gray-500">{team.school}</div>
            </td>
            {criteria.map(crit => (
                <td key={crit.id} className="px-4 py-4">
                    {isEditing ? (
                        <Input type="number" min="0" value={scoreInput.scores[crit.id] || ''} onChange={e => onInputChange(team.id, crit.id, e.target.value)} className="w-24"/>
                    ) : (
                        <span className="font-medium text-gray-800">{scoreInput.scores[crit.id] || '-'}</span>
                    )}
                </td>
            ))}
            <td className="px-4 py-4 font-bold text-gray-900">{total}</td>
            <td className="px-4 py-4">
                {isEditing ? (
                    <Input type="text" placeholder="Opsional" value={scoreInput.notes} onChange={e => onNotesChange(team.id, e.target.value)} />
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

const ParticipantScoreRow: React.FC<{
    participant: Participant;
    participantKey: string;
    criteria: Criterion[];
    scoreInput: ScoreInput;
    isEditing: boolean;
    isSaving: boolean;
    rowMessage: { id: string; text: string; isError: boolean } | null;
    onEdit: (key: string) => void;
    onCancel: (key: string) => void;
    onSave: (key: string) => void;
    onInputChange: (key: string, criterionId: string, value: string) => void;
    onNotesChange: (key: string, value: string) => void;
}> = ({ participant, participantKey, criteria, scoreInput, isEditing, isSaving, rowMessage, onEdit, onCancel, onSave, onInputChange, onNotesChange }) => {
    const total = useMemo(() => calculateTotal(scoreInput.scores), [scoreInput.scores]);
    const message = rowMessage?.id === participantKey ? rowMessage : null;

    return (
        <tr className={isEditing ? 'bg-yellow-50' : ''}>
            <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                <div className="text-sm text-gray-500">{`${participant.teamName} (${participant.school})`}</div>
            </td>
            {criteria.map(crit => (
                <td key={crit.id} className="px-4 py-4">
                    {isEditing ? (
                        <Input type="number" min="0" value={scoreInput.scores[crit.id] || ''} onChange={e => onInputChange(participantKey, crit.id, e.target.value)} className="w-24"/>
                    ) : (
                        <span className="font-medium text-gray-800">{scoreInput.scores[crit.id] || '-'}</span>
                    )}
                </td>
            ))}
            <td className="px-4 py-4 font-bold text-gray-900">{total}</td>
            <td className="px-4 py-4">
                {isEditing ? (
                    <Input type="text" placeholder="Opsional" value={scoreInput.notes} onChange={e => onNotesChange(participantKey, e.target.value)} />
                ) : (
                    <span className="text-sm text-gray-600 truncate" title={scoreInput.notes}>{scoreInput.notes || '-'}</span>
                )}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button onClick={() => onSave(participantKey)} disabled={isSaving} className="px-3 py-1 text-sm">{isSaving ? '...' : 'Simpan'}</Button>
                            <Button variant="secondary" onClick={() => onCancel(participantKey)} className="px-3 py-1 text-sm">Batal</Button>
                        </>
                    ) : (
                        <Button variant="secondary" onClick={() => onEdit(participantKey)} className="px-3 py-1 text-sm">Edit</Button>
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
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [scoreInputs, setScoreInputs] = useState<ScoreInputState>({});
    const [originalScores, setOriginalScores] = useState<ScoreInputState>({});
    
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null); // teamId or participantKey
    const [isRowSaving, setIsRowSaving] = useState<string | null>(null);
    const [rowMessage, setRowMessage] = useState<{ id: string; text: string; isError: boolean } | null>(null);

    const auth = useContext(AuthContext);

    const isIndividualCompetition = useMemo(() => myCompetition?.isIndividual === true, [myCompetition]);

    useEffect(() => {
        const loadData = async () => {
            if (!auth?.identifier || !auth.assignedCompetitionId) {
                setLoading(false);
                return;
            }

            setLoading(true);
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
                    
                    const putra = allTeams.filter(t => t.type === 'Putra');
                    const putri = allTeams.filter(t => t.type === 'Putri');

                    if(foundCompetition.isIndividual) {
                        const teamsToProcess = assignedTeamType === 'Putri' ? putri : assignedTeamType === 'Putra' ? putra : [...putra, ...putri];
                        const allParticipants = teamsToProcess
                            .flatMap(team => team.members.map(member => ({...member, teamId: team.id, teamName: team.teamName, school: team.school})))
                            .filter(p => !p.participatedCompetitions || p.participatedCompetitions.length === 0 || p.participatedCompetitions.includes(assignedCompetitionId));
                        setParticipants(allParticipants);

                        const initialScores: ScoreInputState = {};
                        allParticipants.forEach(p => {
                            const participantKey = `${p.teamId}::${p.name}`;
                            const existingScore = judgeScores.find(s => s.teamId === p.teamId && s.memberName === p.name);
                            const scoresByCriterion: { [criterionId: string]: string } = {};
                            if (existingScore) {
                                foundCompetition.criteria.forEach(crit => {
                                    scoresByCriterion[crit.id] = (existingScore.scoresByCriterion[crit.id] || 0).toString();
                                });
                            }
                            initialScores[participantKey] = { scores: scoresByCriterion, notes: existingScore?.notes || '' };
                        });
                        setScoreInputs(initialScores);
                        setOriginalScores(JSON.parse(JSON.stringify(initialScores)));

                    } else {
                        setPutraTeams(assignedTeamType === 'Putri' ? [] : putra);
                        setPutriTeams(assignedTeamType === 'Putra' ? [] : putri);
                        const teamsToProcess = assignedTeamType === 'Putri' ? putri : assignedTeamType === 'Putra' ? putra : allTeams;

                        const initialScores: ScoreInputState = {};
                        teamsToProcess.forEach(team => {
                            const existingScore = judgeScores.find(s => s.teamId === team.id);
                            const scoresByCriterion: { [criterionId: string]: string } = {};
                            if (existingScore) {
                                foundCompetition.criteria.forEach(crit => {
                                    scoresByCriterion[crit.id] = (existingScore.scoresByCriterion[crit.id] || 0).toString();
                                });
                            }
                            initialScores[team.id] = { scores: scoresByCriterion, notes: existingScore?.notes || '' };
                        });
                        setScoreInputs(initialScores);
                        setOriginalScores(JSON.parse(JSON.stringify(initialScores)));
                    }
                }
            } catch (error) {
                console.error("Failed to load judge portal data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [auth?.identifier, auth?.assignedCompetitionId, auth?.assignedTeamType]);

    const handleInputChange = (id: string, criterionId: string, value: string) => {
        setScoreInputs(prev => ({ ...prev, [id]: { ...(prev[id] || { scores: {}, notes: '' }), scores: { ...(prev[id]?.scores || {}), [criterionId]: value }}}));
    };

    const handleNotesChange = (id: string, value: string) => {
        setScoreInputs(prev => ({ ...prev, [id]: { ...(prev[id] || { scores: {}, notes: '' }), notes: value }}));
    };

    const handleEdit = (id: string) => {
        setEditingId(id);
        setRowMessage(null);
    };
    
    const handleCancel = (id: string) => {
        setScoreInputs(prev => ({ ...prev, [id]: originalScores[id] || { scores: {}, notes: '' } }));
        setEditingId(null);
    };

    const handleSave = async (id: string) => {
        if (!myCompetition || !auth?.identifier) return;

        setIsRowSaving(id);
        setRowMessage(null);

        const currentInput = scoreInputs[id];
        const scoresByCriterionNum: { [criterionId: string]: number } = {};
        let allScoresValid = true;
        let validationError = '';

        myCompetition.criteria.forEach(crit => {
            const scoreStr = currentInput.scores[crit.id] || '0';
            const scoreNum = Number(scoreStr);
            if (isNaN(scoreNum) || scoreNum < 0) {
                allScoresValid = false;
                 if (!validationError) validationError = `Nilai "${crit.name}" harus angka positif.`;
            }
            scoresByCriterionNum[crit.id] = isNaN(scoreNum) ? 0 : scoreNum;
        });

        if (!allScoresValid) {
            setRowMessage({ id, text: validationError || 'Skor tidak valid.', isError: true });
            setIsRowSaving(null);
            return;
        }

        const totalScore = Object.values(scoresByCriterionNum).reduce((acc, val) => acc + val, 0);

        try {
            let teamId = id;
            let memberName: string | undefined = undefined;

            if (isIndividualCompetition) {
                [teamId, memberName] = id.split('::');
            }

            await apiService.addScore({
                teamId,
                competitionId: myCompetition.id,
                judgeId: auth.identifier,
                scoresByCriterion: scoresByCriterionNum,
                totalScore,
                notes: currentInput.notes,
                memberName,
            });
            
            setOriginalScores(prev => ({ ...prev, [id]: currentInput }));
            setRowMessage({ id, text: 'Tersimpan!', isError: false });
            setTimeout(() => setRowMessage(null), 3000);
            setEditingId(null);
        } catch (error) {
            setRowMessage({ id, text: 'Gagal menyimpan', isError: true });
            console.error(error);
        } finally {
            setIsRowSaving(null);
        }
    };
    
    const getVisibleCriteria = useCallback(() => {
        if (!myCompetition) return [];
        return (auth?.assignedCriteriaIds && auth.assignedCriteriaIds.length > 0)
            ? myCompetition.criteria.filter(c => auth.assignedCriteriaIds.includes(c.id))
            : myCompetition.criteria;
    }, [myCompetition, auth?.assignedCriteriaIds]);

    if (loading) return <div>Memuat data...</div>;
    if (!auth?.identifier) return <Card><div className="text-center p-8"><h2 className="text-xl font-bold text-red-600">Akses Ditolak</h2><p className="text-gray-600 mt-2">Sesi tidak valid. Mohon login kembali.</p></div></Card>;
    if (!myCompetition) return <Card><div className="text-center p-8"><h2 className="text-xl font-bold text-yellow-600">Belum Ada Tugas</h2><p className="text-gray-600 mt-2">Anda belum ditugaskan untuk menilai lomba apapun. Mohon hubungi panitia.</p></div></Card>;

    const visibleCriteria = getVisibleCriteria();
    const noTeamsToShow = !isIndividualCompetition && putraTeams.length === 0 && putriTeams.length === 0;
    const noParticipantsToShow = isIndividualCompetition && participants.length === 0;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Portal Penilaian Juri</h1>
                <h2 className="text-2xl font-semibold mt-1" style={{color: AppColors.primary}}>
                    Lomba: {myCompetition.name} 
                    {auth.assignedTeamType ? ` (Hanya Regu ${auth.assignedTeamType})` : ''}
                    {isIndividualCompetition && ` (Penilaian Individu)`}
                </h2>
            </div>
            
            {visibleCriteria.length === 0 && (
                <Card><p className="text-gray-500 text-center py-4">Tidak ada kriteria spesifik yang ditugaskan kepada Anda untuk lomba ini.</p></Card>
            )}

            {isIndividualCompetition && visibleCriteria.length > 0 && (
                <Card>
                    <h3 className="text-xl font-semibold mb-4">Daftar Peserta</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta</th>
                                    {visibleCriteria.map(crit => (<th key={crit.id} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">{crit.name}</th>))}
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Total</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {participants.map(p => {
                                    const key = `${p.teamId}::${p.name}`;
                                    return (
                                        <ParticipantScoreRow key={key} participant={p} participantKey={key} criteria={visibleCriteria} scoreInput={scoreInputs[key] || { scores: {}, notes: '' }} isEditing={editingId === key} isSaving={isRowSaving === key} rowMessage={rowMessage} onEdit={handleEdit} onCancel={handleCancel} onSave={handleSave} onInputChange={handleInputChange} onNotesChange={handleNotesChange} />
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {!isIndividualCompetition && visibleCriteria.length > 0 && putraTeams.length > 0 && (
                 <Card>
                    <h3 className="text-xl font-semibold mb-4">Regu Putra</h3>
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regu</th>
                                    {visibleCriteria.map(crit => (<th key={crit.id} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">{crit.name}</th>))}
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Total</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                               {putraTeams.map(team => (<TeamScoreRow key={team.id} team={team} criteria={visibleCriteria} scoreInput={scoreInputs[team.id] || { scores: {}, notes: '' }} isEditing={editingId === team.id} isSaving={isRowSaving === team.id} rowMessage={rowMessage} onEdit={handleEdit} onCancel={handleCancel} onSave={handleSave} onInputChange={handleInputChange} onNotesChange={handleNotesChange}/>))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
            
            {!isIndividualCompetition && visibleCriteria.length > 0 && putriTeams.length > 0 && (
                <Card>
                    <h3 className="text-xl font-semibold mb-4">Regu Putri</h3>
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regu</th>
                                    {visibleCriteria.map(crit => (<th key={crit.id} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">{crit.name}</th>))}
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Total</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                               {putriTeams.map(team => (<TeamScoreRow key={team.id} team={team} criteria={visibleCriteria} scoreInput={scoreInputs[team.id] || { scores: {}, notes: '' }} isEditing={editingId === team.id} isSaving={isRowSaving === team.id} rowMessage={rowMessage} onEdit={handleEdit} onCancel={handleCancel} onSave={handleSave} onInputChange={handleInputChange} onNotesChange={handleNotesChange}/>))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {(noTeamsToShow || noParticipantsToShow) && (
                <Card><p className="text-center text-gray-500 py-4">Tidak ada regu atau peserta yang ditemukan untuk dinilai.</p></Card>
            )}
        </div>
    );
};
