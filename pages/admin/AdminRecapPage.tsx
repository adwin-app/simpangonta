import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { LeaderboardEntry, Competition } from '../../types';
import { Card } from '../../components/UI';
import { AppColors, PrinterIcon } from '../../constants';
import { Button } from '../../components/UI';

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
                                {entry.scoresByCompetition[c.id] || '-'}
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

export const AdminRecapPage: React.FC = () => {
    const [putraLeaderboard, setPutraLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [putriLeaderboard, setPutriLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [isResetting, setIsResetting] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [putraData, putriData, compsData] = await Promise.all([
                apiService.getLeaderboard('Putra'),
                apiService.getLeaderboard('Putri'),
                apiService.getCompetitions()
            ]);
            setPutraLeaderboard(putraData);
            setPutriLeaderboard(putriData);
            setCompetitions(compsData);
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

    const handleReset = async () => {
        if(window.confirm("Apakah Anda yakin ingin mereset semua data? Tindakan ini akan menghapus semua nilai dan mengembalikan data ke keadaan awal.")) {
            setIsResetting(true);
            try {
                await apiService.resetData();
                await loadData(); // Reload data after reset
                alert("Data berhasil direset.");
            } catch (error) {
                 console.error("Failed to reset data:", error);
                 alert("Gagal mereset data.");
            } finally {
                setIsResetting(false);
            }
        }
    }

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
                    <Button onClick={handleReset} variant="secondary" disabled={isResetting}>
                        {isResetting ? 'Mereset...' : 'Reset Data'}
                    </Button>
                </div>
            </div>
            
            {loading ? (
                <Card><p className="text-center p-8">Memuat data rekapitulasi...</p></Card>
            ) : (
                <div className="printable-area">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Rekap Juara Putra</h2>
                        <Card className="overflow-x-auto">
                            <LeaderboardTable leaderboard={putraLeaderboard} competitions={competitions} />
                        </Card>
                    </section>

                    <section className="mt-8 print:break-before-page">
                        <h2 className="text-2xl font-bold mb-4">Rekap Juara Putri</h2>
                        <Card className="overflow-x-auto">
                            <LeaderboardTable leaderboard={putriLeaderboard} competitions={competitions} />
                        </Card>
                    </section>
                </div>
            )}
        </div>
    );
};
