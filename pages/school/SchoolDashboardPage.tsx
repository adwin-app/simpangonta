import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card, Button } from '../../components/UI';
import { TeamRegistrationForm } from '../../components/TeamRegistrationForm';
import { AuthContext } from '../../App';
import { apiService } from '../../services/api';
import { Team, Competition } from '../../types';
import { UsersIcon, PencilIcon, TrashIcon } from '../../constants';
import { EditTeamModal } from '../../components/EditTeamModal';

const TeamDetailsCard: React.FC<{
    team: Team,
    onEdit: (team: Team) => void,
    onDelete: (team: Team) => void,
    competitionMap: Map<string, string>;
}> = ({ team, onEdit, onDelete, competitionMap }) => (
    <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between items-start mb-3">
            <div>
                <p className="font-bold text-gray-800">{team.teamName}</p>
                <p className="text-sm text-gray-600">Kategori: {team.type}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Button onClick={() => onEdit(team)} variant="secondary" className="p-2 h-8 w-8 text-xs" title="Edit Regu"><PencilIcon className="h-4 w-4"/></Button>
                <Button onClick={() => onDelete(team)} className="!bg-red-600 hover:!bg-red-700 p-2 h-8 w-8 text-xs" title="Hapus Regu"><TrashIcon className="h-4 w-4"/></Button>
            </div>
        </div>
        <div>
            <p className="font-semibold text-sm mb-1">Anggota Regu:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
                 {team.members.length > 0 ? team.members.map((member, index) => (
                    <li key={index}>
                        <div className="font-medium">{member.name}</div>
                        {member.participatedCompetitions && member.participatedCompetitions.length > 0 && (
                            <div className="text-xs text-gray-500 pl-4">
                                Ikut: {member.participatedCompetitions.map(id => competitionMap.get(id) || `Lomba (ID: ${id})`).join(', ')}
                            </div>
                        )}
                    </li>
                )) : <p className="text-xs text-gray-500">Belum ada anggota.</p>}
            </ol>
        </div>
    </div>
);


export const SchoolDashboardPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [competitionMap, setCompetitionMap] = useState<Map<string, string>>(new Map());

    const fetchSchoolData = useCallback(async () => {
        if (!auth?.identifier) return;
        setLoading(true);
        try {
            const [myTeams, allCompetitions] = await Promise.all([
                apiService.getTeams(auth.identifier),
                apiService.getCompetitions()
            ]);
            setTeams(myTeams);
            
            const filteredCompetitions = allCompetitions.filter(c => c.name.toLowerCase() !== 'tapak kemah');
            setCompetitions(filteredCompetitions);

            const newMap = new Map<string, string>();
            allCompetitions.forEach(c => newMap.set(c.id, c.name));
            setCompetitionMap(newMap);

        } catch (error) {
            console.error("Failed to fetch school data:", error);
            alert("Gagal memuat data sekolah Anda.");
        } finally {
            setLoading(false);
        }
    }, [auth?.identifier]);

    useEffect(() => {
        fetchSchoolData();
    }, [fetchSchoolData]);

    const handleEdit = (team: Team) => {
        setEditingTeam(team);
    };

    const handleDelete = async (team: Team) => {
        if (window.confirm(`Yakin ingin menghapus regu "${team.teamName}"? Tindakan ini tidak dapat dibatalkan.`)) {
            try {
                await apiService.deleteTeam(team.id);
                fetchSchoolData(); // Refresh list
                alert('Regu berhasil dihapus.');
            } catch (error: any) {
                console.error("Failed to delete team:", error);
                alert(`Gagal menghapus regu: ${error.message}`);
            }
        }
    };
    
    const handleSave = () => {
        setEditingTeam(null);
        fetchSchoolData(); // Refresh list after saving
    };
    
    const putraTeams = teams.filter(t => t.type === 'Putra');
    const putriTeams = teams.filter(t => t.type === 'Putri');

    return (
        <div className="space-y-8">
            <div className="text-center">
                 <h1 className="text-3xl font-bold">Dashboard Sekolah</h1>
                 <p className="text-xl text-gray-700 font-semibold">{auth?.schoolName}</p>
            </div>
           
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Registration Form */}
                <div className="lg:col-span-3">
                     <Card>
                        <h2 className="text-2xl font-bold mb-4">Pendaftaran Regu Baru</h2>
                        <TeamRegistrationForm onTeamRegistered={fetchSchoolData} />
                    </Card>
                </div>

                {/* Team Lists */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <UsersIcon className="w-6 h-6 mr-2" /> Regu Terdaftar
                        </h2>
                        {loading ? <p>Memuat...</p> : (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Putra</h3>
                                    {putraTeams.length > 0 ? (
                                        <div className="space-y-3">
                                            {putraTeams.map(team => <TeamDetailsCard key={team.id} team={team} onEdit={handleEdit} onDelete={handleDelete} competitionMap={competitionMap} />)}
                                        </div>
                                    ) : <p className="text-gray-500 text-sm text-center py-2">Belum ada regu putra.</p>}
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-lg mb-2">Putri</h3>
                                    {putriTeams.length > 0 ? (
                                        <div className="space-y-3">
                                            {putriTeams.map(team => <TeamDetailsCard key={team.id} team={team} onEdit={handleEdit} onDelete={handleDelete} competitionMap={competitionMap} />)}
                                        </div>
                                    ) : <p className="text-gray-500 text-sm text-center py-2">Belum ada regu putri.</p>}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {editingTeam && (
                <EditTeamModal 
                    team={editingTeam}
                    onClose={() => setEditingTeam(null)}
                    onSave={handleSave}
                    competitions={competitions}
                    isSchoolUser={true}
                />
            )}
        </div>
    );
};