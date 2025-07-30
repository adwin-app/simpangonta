import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Team } from '../../types';
import { Card, Button } from '../../components/UI';
import { UsersIcon, PrinterIcon } from '../../constants';

const TeamCard: React.FC<{ team: Team, className?: string }> = ({ team, className = "" }) => (
    <Card className={`flex flex-col print:shadow-none print:border print:border-gray-300 print:mb-6 ${className}`}>
        <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800">{team.teamName}</h3>
            <p className="text-sm text-gray-500">{team.school}</p>
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
        </div>
        <div>
            <p className="font-semibold mb-2">Anggota Regu:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 bg-gray-50 p-3 rounded-md">
                {team.members.map((member, index) => (
                    <li key={index}>{member}</li>
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

    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true);
            try {
                const allTeams = await apiService.getTeams();
                setPutraTeams(allTeams.filter(t => t.type === 'Putra'));
                setPutriTeams(allTeams.filter(t => t.type === 'Putri'));
            } catch (error) {
                console.error("Failed to fetch teams:", error);
                alert("Gagal memuat daftar regu.");
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

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
                <h2 className="text-xl font-semibold">SIMPAN GONTA - Perkemahan Pramuka Gondangwetan</h2>
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
                                {putraTeams.map(team => <TeamCard key={team.id} team={team} />)}
                            </div>
                        ) : (
                            <Card className="print:border-none print:shadow-none"><p className="text-gray-500">Belum ada regu putra yang terdaftar.</p></Card>
                        )}
                    </section>
                    
                    <section className="print:break-before-page">
                        <h2 className="text-2xl font-bold mb-4 print:text-xl print:mt-8">Regu Putri</h2>
                         {putriTeams.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
                                {putriTeams.map(team => <TeamCard key={team.id} team={team} />)}
                            </div>
                        ) : (
                            <Card className="print:border-none print:shadow-none"><p className="text-gray-500">Belum ada regu putri yang terdaftar.</p></Card>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};
