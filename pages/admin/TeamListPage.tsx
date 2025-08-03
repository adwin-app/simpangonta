import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Team, Competition } from '../../types';
import { Card, Button } from '../../components/UI';
import { UsersIcon, PrinterIcon, PencilIcon, TrashIcon } from '../../constants';
import { EditTeamModal } from '../../components/EditTeamModal';


const TeamCard: React.FC<{
    team: Team,
    className?: string,
    onEdit: (team: Team) => void,
    onDelete: (team: Team) => void,
    competitionMap: Map<string, string>;
}> = ({ team, className = "", onEdit, onDelete, competitionMap }) => (
    <Card className={`flex flex-col print:shadow-none print:border print:border-gray-300 print:mb-6 ${className}`}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-xl font-bold text-gray-800">{team.teamName}</h3>
                <p className="text-sm text-gray-500">{team.school}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 no-print">
                <Button onClick={() => onEdit(team)} variant="secondary" className="p-2 h-9 w-9" title="Edit Regu"><PencilIcon className="h-5 w-5"/></Button>
                <Button onClick={() => onDelete(team)} className="!bg-red-600 hover:!bg-red-700 p-2 h-9 w-9" title="Hapus Regu"><TrashIcon className="h-5 w-5"/></Button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
                <p className="font-semibold">Nama Pembina:</p>
                <p className="text-gray-700">{team.coachName}</p>
            </div>
            <div>
                <p className="font-semibold">No. HP Pembina:</p>
                <p className="text-gray-700">{team.coachPhone}</p>
            </div>
             {team.campNumber && (
                 <div className="md:col-span-2">
                    <p className="font-semibold">Nomor Tapak Kemah:</p>
                    <p className="text-gray-700 font-bold text-base">{team.campNumber}</p>
                </div>
            )}
        </div>
        <div>
            <p className="font-semibold mb-2">Anggota Regu:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 bg-gray-50 p-3 rounded-md">
                {team.members.map((member, index) => (
                    <li key={index}>
                        <div className="font-medium">{member.name}</div>
                        {member.participatedCompetitions && member.participatedCompetitions.length > 0 && (
                            <div className="text-xs text-gray-500 pl-4">
                                Ikut: {member.participatedCompetitions.map(id => competitionMap.get(id) || `Lomba (ID: ${id})`).join(', ')}
                            </div>
                        )}
                    </li>
                ))}
            </ol>
             {team.members.length === 0 && <p className="text-gray-500 text-xs">Belum ada anggota yang didaftarkan.</p>}
        </div>
    </Card>
);

export const TeamListPage: React.FC = () => {
    const [putraTeams, setPutraTeams] = useState<Team[]>([]);
    const [putriTeams, setPutriTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [competitionMap, setCompetitionMap] = useState<Map<string, string>>(new Map());

    const fetchTeamsAndCompetitions = async () => {
        setLoading(true);
        try {
            const [allTeams, allCompetitions] = await Promise.all([
                apiService.getTeams(),
                apiService.getCompetitions()
            ]);
            setPutraTeams(allTeams.filter(t => t.type === 'Putra'));
            setPutriTeams(allTeams.filter(t => t.type === 'Putri'));
            
            setCompetitions(allCompetitions.filter(c => c.name.toLowerCase() !== 'tapak kemah'));

            const newMap = new Map<string, string>();
            allCompetitions.forEach(c => newMap.set(c.id, c.name));
            setCompetitionMap(newMap);

        } catch (error) {
            console.error("Failed to fetch data:", error);
            alert("Gagal memuat data.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchTeamsAndCompetitions();
    }, []);
    
    const handleDelete = async (team: Team) => {
        if (window.confirm(`Yakin ingin menghapus regu "${team.teamName}" dari "${team.school}"? Semua nilai yang terkait dengan regu ini juga akan dihapus.`)) {
            try {
                await apiService.deleteTeam(team.id);
                fetchTeamsAndCompetitions();
                alert('Regu berhasil dihapus.');
            } catch (error: any) {
                console.error("Failed to delete team:", error);
                alert(`Gagal menghapus regu: ${error.message}`);
            }
        }
    };
    
    const handleSave = (updatedTeam: Team) => {
        fetchTeamsAndCompetitions();
        setEditingTeam(null);
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="flex justify-between items-center no-print">
                <h1 className="text-3xl font-bold flex items-center">
                    <UsersIcon className="w-8 h-8 mr-3"/>
                    Daftar Regu Terdaftar
                </h1>
                <Button onClick={handlePrint} variant="secondary" className="flex items-center">
                    <PrinterIcon className="w-5 h-5 mr-2" />
                    Cetak Laporan
                </Button>
            </div>

            <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">Laporan Daftar Peserta</h1>
                <h2 className="text-xl font-semibold">KWARRAN GONTA - Perkemahan Pramuka Gondangwetan</h2>
                <p className="text-sm mt-1">
                    Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
            </div>
            
            {loading ? (
                 <Card><p className="text-center p-8">Memuat daftar regu...</p></Card>
            ) : (
                <div className="space-y-8 print:space-y-0">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 print:text-xl print:mt-8">Regu Putra</h2>
                        {putraTeams.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
                                {putraTeams.map(team => <TeamCard key={team.id} team={team} onEdit={setEditingTeam} onDelete={handleDelete} competitionMap={competitionMap} />)}
                            </div>
                        ) : (
                            <Card className="print:border-none print:shadow-none"><p className="text-gray-500">Belum ada regu putra yang terdaftar.</p></Card>
                        )}
                    </section>
                    
                    <section className="print:break-before-page">
                        <h2 className="text-2xl font-bold mb-4 print:text-xl print:mt-8">Regu Putri</h2>
                         {putriTeams.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
                                {putriTeams.map(team => <TeamCard key={team.id} team={team} onEdit={setEditingTeam} onDelete={handleDelete} competitionMap={competitionMap} />)}
                            </div>
                        ) : (
                            <Card className="print:border-none print:shadow-none"><p className="text-gray-500">Belum ada regu putri yang terdaftar.</p></Card>
                        )}
                    </section>
                </div>
            )}
            
            {editingTeam && (
                <EditTeamModal 
                    team={editingTeam}
                    onClose={() => setEditingTeam(null)}
                    onSave={handleSave}
                    competitions={competitions}
                />
            )}
        </div>
    );
};