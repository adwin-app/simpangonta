import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { User, Competition } from '../../types';
import { Card, Button, Input, Select } from '../../components/UI';
import { PlusCircleIcon, UserGroupIcon, TrashIcon, CloseIcon } from '../../constants';

export const ManageJudgesPage: React.FC = () => {
    const [judges, setJudges] = useState<User[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    
    // State for adding a new judge
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addError, setAddError] = useState('');

    // State for updating assignments
    const [assignment, setAssignment] = useState<{ [judgeId: string]: string }>({});
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [judgesData, competitionsData] = await Promise.all([
                apiService.getUsers(),
                apiService.getCompetitions(),
            ]);
            setJudges(judgesData);
            setCompetitions(competitionsData);

            // Initialize assignment state
            const initialAssignment: { [judgeId: string]: string } = {};
            judgesData.forEach(j => {
                initialAssignment[j.id] = j.assignedCompetitionId || '';
            });
            setAssignment(initialAssignment);

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
    
    const handleAssignmentChange = (judgeId: string, competitionId: string) => {
        setAssignment(prev => ({ ...prev, [judgeId]: competitionId }));
    };

    const handleSaveAssignment = async (judgeId: string) => {
        const competitionId = assignment[judgeId];
        try {
            await apiService.updateUser(judgeId, { assignedCompetitionId: competitionId });
            alert('Tugas juri berhasil disimpan.');
            fetchData(); // Refresh to update competition name
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
                <h2 className="text-xl font-semibold mb-4">Daftar Juri</h2>
                {loading ? (
                    <p>Memuat daftar juri...</p>
                ) : judges.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                           <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tugas Lomba</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-gray-200">
                                {judges.map((judge) => (
                                    <tr key={judge.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{judge.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Select
                                                  value={assignment[judge.id] || ''}
                                                  onChange={e => handleAssignmentChange(judge.id, e.target.value)}
                                                  className="w-full max-w-xs"
                                                >
                                                    <option value="">-- Tidak ditugaskan --</option>
                                                    {competitions.map(comp => (
                                                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                                                    ))}
                                                </Select>
                                                <Button variant="primary" className="py-2 px-4 text-sm" onClick={() => handleSaveAssignment(judge.id)}>Simpan</Button>
                                            </div>
                                             {judge.assignedCompetitionName && <p className="text-xs text-gray-500 mt-1">Saat ini bertugas di: {judge.assignedCompetitionName}</p>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => handleDeleteJudge(judge.id, judge.username)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
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
