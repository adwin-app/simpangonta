import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { LeaderboardEntry, Competition, Score, Team } from '../../types';
import { Card } from '../../components/UI';
import { AppColors, PrinterIcon, UsersIcon } from '../../constants';
import { Button } from '../../components/UI';

type IndividualWinnerRecap = {
    competitionId: string;
    competitionName: string;
    winners: (Score & { teamName: string; school: string; })[];
};

const MedalIcon: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank === 1) return <span title="Juara 1">🥇</span>;
    if (rank === 2) return <span title="Juara 2">🥈</span>;
    if (rank === 3) return <span title="Juara 3">🥉</span>;
    return null;
};

const LeaderboardTable: React.FC<{ leaderboard: LeaderboardEntry[], competitions: Competition[] }> = ({ leaderboard, competitions }) => {
    if (leaderboard.length === 0) {
        return <p className="text-center py-8 text-gray-500">Belum ada data nilai yang masuk untuk kategori ini.</p>;
    }

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regu</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Emas">🥇</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Perak">🥈</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Perunggu">🥉</th>
                    {competitions.map(c => (
                        <th key={c.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate" style={{maxWidth: '150px'}}>{c.name}</th>
                    ))}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nilai</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry) => (
                    <tr key={entry.teamId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-lg font-bold">
                            <div className="flex items-center">
                                <span className="mr-2">{entry.rank}</span>
                                <MedalIcon rank={entry.rank} />
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{entry.teamName}</div>
                            <div className="text-sm text-gray-500">{entry.school}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-800">{entry.medals.gold}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-800">{entry.medals.silver}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-800">{entry.medals.bronze}</td>
                        {competitions.map(c => (
                            <td key={c.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                {c.isIndividual ? 
                                    <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800"><UsersIcon className="w-3 h-3 mr-1"/>Individu</span> : 
                                    (entry.scoresByCompetition[c.id] || '-')
                                }
                            </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold" style={{color: AppColors.primary}}>
                            {entry.totalScore}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const ResetDataModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onReset: (mode?: 'clean') => Promise<void>;
    isResetting: boolean;
}> = ({ isOpen, onClose, onReset, isResetting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <Card className="w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">Pilih Tipe Reset Data</h2>
                <p className="text-gray-600 mb-6">Pilih salah satu opsi di bawah ini. Tindakan ini tidak dapat dibatalkan.</p>
                
                <div className="space-y-4">
                    <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-yellow-800">Reset dengan Data Uji Coba</h3>
                        <p className="text-sm text-yellow-700 mt-1 mb-3">Hapus semua data saat ini dan isi kembali dengan data contoh (regu, juri, dll). Berguna untuk pengujian atau demonstrasi.</p>
                        <Button
                            onClick={() => onReset()}
                            disabled={isResetting}
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        >
                            {isResetting ? 'Mereset...' : 'Reset & Isi Data Uji'}
                        </Button>
                    </div>

                    <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-red-800">Hapus Semua Data (Mulai Lomba Baru)</h3>
                        <p className="text-sm text-red-700 mt-1 mb-3">Menghapus SELURUH data (lomba, regu, juri, sekolah, skor). Gunakan opsi ini untuk membersihkan database sebelum acara dimulai.</p>
                         <Button
                            onClick={() => onReset('clean')}
                            disabled={isResetting}
                            className="!bg-red-600 hover:!bg-red-700 focus:ring-red-500"
                        >
                            {isResetting ? 'Menghapus...' : 'Hapus Semua Data'}
                        </Button>
                    </div>
                </div>

                <div className="mt-6 text-right">
                    <Button variant="secondary" onClick={onClose} disabled={isResetting}>
                        Batal
                    </Button>
                </div>
            </Card>
        </div>
    );
};

const IndividualWinners: React.FC<{ winners: (Score & { teamName: string; school: string; })[], competitionName: string }> = ({ winners, competitionName }) => {
    if (winners.length === 0) {
        return null;
    }

    return (
        <section className="mt-8 print:break-before-page">
            <h2 className="text-2xl font-bold mb-4">Juara Individu - {competitionName}</h2>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peringkat</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Peserta</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asal Regu</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {winners.map((winner, index) => (
                                <tr key={winner.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 text-center">{index + 1}</span>
                                            <MedalIcon rank={index + 1} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{winner.memberName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{winner.teamName}</div>
                                        <div className="text-sm text-gray-500">{winner.school}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold" style={{color: AppColors.primary}}>
                                        {winner.totalScore}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </section>
    );
};

export const AdminRecapPage: React.FC = () => {
    const [putraLeaderboard, setPutraLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [putriLeaderboard, setPutriLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [individualWinners, setIndividualWinners] = useState<IndividualWinnerRecap[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [putraData, putriData, compsData, allTeams] = await Promise.all([
                apiService.getLeaderboard('Putra', true),
                apiService.getLeaderboard('Putri', true),
                apiService.getCompetitions(),
                apiService.getTeams()
            ]);
            setPutraLeaderboard(putraData);
            setPutriLeaderboard(putriData);
            setCompetitions(compsData);

            const teamMap = new Map(allTeams.map((t: Team) => [t.id, { teamName: t.teamName, school: t.school }]));
            const individualCompetitions = compsData.filter(c => c.isIndividual);

            if (individualCompetitions.length > 0) {
                const winnersByCompetition = await Promise.all(
                    individualCompetitions.map(async (comp) => {
                        const scores = await apiService.getScoresByCompetition(comp.id);
                        const winners = scores
                            .filter(score => score.totalScore > 0 && score.memberName)
                            .map(score => ({
                                ...score,
                                teamName: teamMap.get(score.teamId)?.teamName || 'N/A',
                                school: teamMap.get(score.teamId)?.school || 'N/A'
                            }))
                            .sort((a, b) => b.totalScore - a.totalScore);

                        return {
                            competitionId: comp.id,
                            competitionName: comp.name,
                            winners: winners,
                        };
                    })
                );
                setIndividualWinners(winnersByCompetition.filter(wc => wc.winners.length > 0));
            } else {
                setIndividualWinners([]);
            }

        } catch (error) {
            console.error("Failed to load recap data:", error);
            alert("Gagal memuat data rekapitulasi.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleReset = async (mode?: 'clean') => {
        setIsResetting(true);
        try {
            const result = await apiService.resetData(mode);
            await loadData(); // Reload data after reset
            alert(result.message);
        } catch (error: any) {
             console.error("Failed to reset data:", error);
             alert(`Gagal mereset data: ${error.message}`);
        } finally {
            setIsResetting(false);
            setIsResetModalOpen(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <h1 className="text-3xl font-bold">Rekap Juara Otomatis</h1>
                <div className="flex items-center gap-2">
                    <Button onClick={handlePrint} variant="secondary" className="flex items-center">
                        <PrinterIcon className="w-5 h-5 mr-2" />
                        Cetak Rekap
                    </Button>
                    <Button onClick={() => setIsResetModalOpen(true)} variant="secondary" disabled={isResetting}>
                        {isResetting ? 'Mereset...' : 'Reset Data'}
                    </Button>
                </div>
            </div>
            
            {loading ? (
                <Card><p className="text-center p-8">Memuat data rekapitulasi...</p></Card>
            ) : (
                <div className="printable-area">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Rekap Juara Umum Putra</h2>
                        <Card className="overflow-x-auto">
                            <LeaderboardTable leaderboard={putraLeaderboard} competitions={competitions} />
                        </Card>
                    </section>

                    <section className="mt-8 print:break-before-page">
                        <h2 className="text-2xl font-bold mb-4">Rekap Juara Umum Putri</h2>
                        <Card className="overflow-x-auto">
                            <LeaderboardTable leaderboard={putriLeaderboard} competitions={competitions} />
                        </Card>
                    </section>

                    {individualWinners.map(recap => (
                        <IndividualWinners
                            key={recap.competitionId}
                            winners={recap.winners}
                            competitionName={recap.competitionName}
                        />
                    ))}
                </div>
            )}
             <ResetDataModal 
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onReset={handleReset}
                isResetting={isResetting}
            />
        </div>
    );
};