import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { User, Competition } from '../../types';
import { Card, Button, Input, Select } from '../../components/UI';
import { PlusCircleIcon, UserGroupIcon, TrashIcon } from '../../constants';

export const ManageJudgesPage: React.FC = () => {
    const [judges, setJudges] = useState<User[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addError, setAddError] = useState('');

    const [assignments, setAssignments] = useState<{ [judgeId: string]: { competitionId: string; teamType: string; criteriaIds: string[] } }>({});
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [judgesData, competitionsData] = await Promise.all([
                apiService.getUsers(),
                apiService.getCompetitions(),
            ]);
            setJudges(judgesData);
            setCompetitions(competitionsData);

            const initialAssignments: { [judgeId: string]: { competitionId: string; teamType: string; criteriaIds: string[] } } = {};
            judgesData.forEach(j => {
                initialAssignments[j.id] = {
                    competitionId: j.assignedCompetitionId || '',
                    teamType: j.assignedTeamType || '',
                    criteriaIds: j.assignedCriteriaIds || []
                };
            });
            setAssignments(initialAssignments);

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddJudge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim() || !newPassword.trim()) {
            setAddError("Username dan password wajib diisi.");
            return;
        }
        setIsSubmitting(true);
        setAddError('');
        try {
            await apiService.addUser({ username: newUsername, password: newPassword });
            setNewUsername('');
            setNewPassword('');
            fetchData(); // Refresh list
        } catch (error: any) {
            console.error("Failed to add judge:", error);
            setAddError(error.message || "Gagal menambah juri.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteJudge = async (id: string, username: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus juri "${username}"?`)) {
            try {
                await apiService.deleteUser(id);
                fetchData(); // Refresh list
            } catch (error: any) {
                alert(`Gagal menghapus juri: ${error.message}`);
            }
        }
    };
    
    const handleAssignmentChange = (judgeId: string, field: 'competitionId' | 'teamType', value: string) => {
        setAssignments(prev => {
            const currentAssignment = { ...(prev[judgeId] || { competitionId: '', teamType: '', criteriaIds: [] }) };
            currentAssignment[field] = value;
            // if competition is changed, reset criteria selection
            if (field === 'competitionId') {
                currentAssignment.criteriaIds = [];
            }
            return {
                ...prev,
                [judgeId]: currentAssignment
            };
        });
    };

    const handleCriteriaChange = (judgeId: string, criterionId: string, isChecked: boolean) => {
        setAssignments(prev => {
            const currentAssignment = { ...prev[judgeId] };
            const currentCriteria = currentAssignment.criteriaIds || [];
            if (isChecked) {
                if (!currentCriteria.includes(criterionId)) {
                    currentAssignment.criteriaIds = [...currentCriteria, criterionId];
                }
            } else {
                currentAssignment.criteriaIds = currentCriteria.filter(id => id !== criterionId);
            }
            return { ...prev, [judgeId]: currentAssignment };
        });
    };

    const handleSaveAssignment = async (judgeId: string) => {
        const { competitionId, teamType, criteriaIds } = assignments[judgeId];
        try {
            await apiService.updateUser(judgeId, { 
                assignedCompetitionId: competitionId,
                assignedTeamType: teamType,
                assignedCriteriaIds: criteriaIds,
            });
            alert('Tugas juri berhasil disimpan.');
            fetchData(); // Refresh to update competition name and type
        } catch (error: any) {
             alert(`Gagal menyimpan tugas: ${error.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold flex items-center"><UserGroupIcon className="w-8 h-8 mr-3" /> Kelola Juri</h1>
            
            <Card>
                <h2 className="text-xl font-semibold mb-4">Tambah Juri Baru</h2>
                <form onSubmit={handleAddJudge} className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                    <div className="flex-grow">
                         <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username Juri</label>
                         <Input
                            id="username"
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="e.g., juri1"
                            required
                        />
                    </div>
                     <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <Input
                            type="password"
                            placeholder="Password untuk login"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex-shrink-0 pt-4 md:pt-0">
                        <Button type="submit" className="flex items-center w-full md:w-auto" disabled={isSubmitting}>
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            {isSubmitting ? 'Menambahkan...' : 'Tambah Juri'}
                        </Button>
                    </div>
                </form>
                {addError && <p className="text-red-500 text-xs mt-2">{addError}</p>}
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-4">Daftar Juri dan Penugasan</h2>
                {loading ? (
                    <p>Memuat daftar juri...</p>
                ) : judges.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                           <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penugasan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-gray-200">
                                {judges.map((judge) => (
                                    <tr key={judge.id}>
                                        <td className="px-6 py-4 whitespace-nowrap align-top">
                                            <p className="font-medium text-gray-900">{judge.username}</p>
                                            {judge.assignedCompetitionName && (() => {
                                                const competition = competitions.find(c => c.id === judge.assignedCompetitionId);
                                                const totalCriteria = competition ? competition.criteria.length : 0;
                                                const assignedCriteriaCount = judge.assignedCriteriaIds?.length || 0;
                                                
                                                let criteriaText = ' - Semua Kriteria';
                                                if (totalCriteria > 0 && assignedCriteriaCount > 0 && assignedCriteriaCount < totalCriteria) {
                                                    criteriaText = ` - ${assignedCriteriaCount}/${totalCriteria} Kriteria`;
                                                }
                                                
                                                return (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Bertugas di: {judge.assignedCompetitionName}
                                                        {judge.assignedTeamType ? ` (${judge.assignedTeamType})` : ' (Semua Kategori)'}
                                                        {criteriaText}
                                                    </p>
                                                )
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap align-top">
                                            <div className="space-y-2">
                                                <div className="flex flex-col md:flex-row md:items-center gap-2">
                                                    <Select
                                                      value={assignments[judge.id]?.competitionId || ''}
                                                      onChange={e => handleAssignmentChange(judge.id, 'competitionId', e.target.value)}
                                                      className="w-full md:w-48"
                                                    >
                                                        <option value="">-- Pilih Lomba --</option>
                                                        {competitions.map(comp => (
                                                            <option key={comp.id} value={comp.id}>{comp.name}</option>
                                                        ))}
                                                    </Select>
                                                    <Select
                                                      value={assignments[judge.id]?.teamType || ''}
                                                      onChange={e => handleAssignmentChange(judge.id, 'teamType', e.target.value)}
                                                      className="w-full md:w-48"
                                                      disabled={!assignments[judge.id]?.competitionId}
                                                    >
                                                        <option value="">Semua (Putra & Putri)</option>
                                                        <option value="Putra">Putra Saja</option>
                                                        <option value="Putri">Putri Saja</option>
                                                    </Select>
                                                </div>
                                                
                                                {(() => {
                                                    const assignedCompId = assignments[judge.id]?.competitionId;
                                                    if (!assignedCompId) return null;

                                                    const competition = competitions.find(c => c.id === assignedCompId);
                                                    if (!competition || competition.criteria.length === 0) return null;

                                                    return (
                                                        <div className="p-2 border rounded-md bg-gray-50/50 max-w-sm">
                                                            <label className="text-xs font-medium text-gray-600 mb-2 block">Kriteria yang Dinilai (kosongkan untuk menilai semua):</label>
                                                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                                                {competition.criteria.map(criterion => (
                                                                    <div key={criterion.id} className="flex items-center">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            id={`crit-${judge.id}-${criterion.id}`} 
                                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            checked={(assignments[judge.id]?.criteriaIds || []).includes(criterion.id)}
                                                                            onChange={(e) => handleCriteriaChange(judge.id, criterion.id, e.target.checked)}
                                                                        />
                                                                        <label htmlFor={`crit-${judge.id}-${criterion.id}`} className="ml-2 block text-sm text-gray-700">{criterion.name}</label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap align-top">
                                            <div className="flex items-center gap-2">
                                                <Button variant="primary" className="py-2 px-4 text-sm" onClick={() => handleSaveAssignment(judge.id)}>Simpan</Button>
                                                <button onClick={() => handleDeleteJudge(judge.id, judge.username)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full" title={`Hapus juri ${judge.username}`}>
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">Belum ada juri yang ditambahkan.</p>
                )}
            </Card>
        </div>
    );
};