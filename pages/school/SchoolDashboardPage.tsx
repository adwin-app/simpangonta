import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card } from '../../components/UI';
import { TeamRegistrationForm } from '../../components/TeamRegistrationForm';
import { AuthContext } from '../../App';
import { apiService } from '../../services/api';
import { Team } from '../../types';
import { UsersIcon } from '../../constants';

const TeamList: React.FC<{ teams: Team[] }> = ({ teams }) => {
    if (teams.length === 0) {
        return <p className="text-gray-500 text-center py-4">Anda belum mendaftarkan regu apapun.</p>;
    }

    return (
        <div className="space-y-3">
            {teams.map(team => (
                <div key={team.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-800">{team.teamName}</p>
                            <p className="text-sm text-gray-600">Kategori: {team.type}</p>
                        </div>
                         <p className="text-sm text-gray-600">Jumlah Anggota: {team.members.length}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};


export const SchoolDashboardPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyTeams = useCallback(async () => {
        if (!auth?.identifier) return;
        setLoading(true);
        try {
            const myTeams = await apiService.getTeams(auth.identifier);
            setTeams(myTeams);
        } catch (error) {
            console.error("Failed to fetch school teams:", error);
            alert("Gagal memuat data regu Anda.");
        } finally {
            setLoading(false);
        }
    }, [auth?.identifier]);

    useEffect(() => {
        fetchMyTeams();
    }, [fetchMyTeams]);
    
    const putraTeams = teams.filter(t => t.type === 'Putra');
    const putriTeams = teams.filter(t => t.type === 'Putri');

    return (
        <div className="space-y-8">
            <div className="text-center">
                 <h1 className="text-3xl font-bold">Dashboard Sekolah</h1>
                 <p className="text-xl text-gray-700 font-semibold">{auth?.schoolName}</p>
            </div>
           
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Registration Form */}
                <div className="lg:col-span-2">
                     <Card>
                        <h2 className="text-2xl font-bold mb-4">Pendaftaran Regu Baru</h2>
                        <TeamRegistrationForm onTeamRegistered={fetchMyTeams} />
                    </Card>
                </div>

                {/* Team Lists */}
                <Card>
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <UsersIcon className="w-6 h-6 mr-2" /> Regu Putra Terdaftar
                    </h2>
                     {loading ? <p>Memuat...</p> : <TeamList teams={putraTeams} />}
                </Card>
                 <Card>
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <UsersIcon className="w-6 h-6 mr-2" /> Regu Putri Terdaftar
                    </h2>
                     {loading ? <p>Memuat...</p> : <TeamList teams={putriTeams} />}
                </Card>
            </div>
        </div>
    );
};
