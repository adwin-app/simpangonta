import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { LeaderboardEntry } from '../../types';
import { AppColors } from '../../constants';

type Category = 'Putra' | 'Putri';

const Medal: React.FC<{ rank: number, size?: string }> = ({ rank, size='text-4xl' }) => {
    if (rank === 1) return <span className={size} title="Juara 1">🥇</span>;
    if (rank === 2) return <span className={size} title="Juara 2">🥈</span>;
    if (rank === 3) return <span className={size} title="Juara 3">🥉</span>;
    return null;
};

const MedalDisplay: React.FC<{entry: LeaderboardEntry, isPodium?: boolean}> = ({entry, isPodium = false}) => {
    const sizeClass = isPodium ? "text-3xl" : "text-xl";
    const fontClass = isPodium ? "text-3xl" : "text-lg";
    const gapClass = isPodium ? "gap-4" : "gap-x-4 gap-y-1";
    const itemGapClass = isPodium ? "gap-2" : "gap-1";

    return (
        <div className={`flex flex-wrap justify-center items-baseline ${gapClass} ${isPodium ? 'mt-4' : ''}`}>
            <div className={`flex items-center ${itemGapClass}`}>
                <span className={sizeClass}>🥇</span>
                <span className={`${fontClass} font-bold text-gray-800`}>{entry.medals.gold}</span>
            </div>
            <div className={`flex items-center ${itemGapClass}`}>
                <span className={sizeClass}>🥈</span>
                <span className={`${fontClass} font-bold text-gray-800`}>{entry.medals.silver}</span>
            </div>
            <div className={`flex items-center ${itemGapClass}`}>
                <span className={sizeClass}>🥉</span>
                <span className={`${fontClass} font-bold text-gray-800`}>{entry.medals.bronze}</span>
            </div>
        </div>
    )
}

const LeaderboardPodium: React.FC<{topThree: LeaderboardEntry[]}> = ({ topThree }) => {
    if (topThree.length === 0) return null;
    
    const [second, first, third] = [
        topThree.find(t => t.rank === 2),
        topThree.find(t => t.rank === 1),
        topThree.find(t => t.rank === 3),
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {/* 2nd Place */}
            <div className="order-2 md:order-1 text-center">
                {second && (
                    <div className="bg-white p-6 rounded-xl shadow-2xl border-4 h-full" style={{borderColor: AppColors.silver}}>
                        <Medal rank={2} size="text-6xl" />
                        <h2 className="text-2xl font-bold mt-2">{second.teamName}</h2>
                        <p className="text-gray-500">{second.school}</p>
                        <MedalDisplay entry={second} isPodium={true} />
                        <p className="font-semibold text-gray-600 mt-4">Peringkat 2</p>
                    </div>
                )}
            </div>
            {/* 1st Place */}
             <div className="order-1 md:order-2 text-center">
                {first && (
                    <div className="bg-white p-8 rounded-xl shadow-2xl border-4" style={{borderColor: AppColors.gold, transform: 'scale(1.1)'}}>
                        <Medal rank={1} size="text-7xl" />
                        <h2 className="text-3xl font-bold mt-2">{first.teamName}</h2>
                        <p className="text-gray-500">{first.school}</p>
                        <MedalDisplay entry={first} isPodium={true} />
                        <p className="font-semibold text-gray-600 mt-4">Peringkat 1</p>
                    </div>
                )}
            </div>
            {/* 3rd Place */}
             <div className="order-3 md:order-3 text-center">
                {third && (
                    <div className="bg-white p-6 rounded-xl shadow-2xl border-4 h-full" style={{borderColor: AppColors.bronze}}>
                        <Medal rank={3} size="text-6xl" />
                        <h2 className="text-2xl font-bold mt-2">{third.teamName}</h2>
                        <p className="text-gray-500">{third.school}</p>
                        <MedalDisplay entry={third} isPodium={true} />
                        <p className="font-semibold text-gray-600 mt-4">Peringkat 3</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const PublicLeaderboardPage: React.FC = () => {
    const [putraLeaderboard, setPutraLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [putriLeaderboard, setPutriLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [activeTab, setActiveTab] = useState<Category>('Putra');
    const [loading, setLoading] = useState(true);

    const fetchAndSetLeaderboards = useCallback(async () => {
        try {
            const [putraData, putriData] = await Promise.all([
                apiService.getLeaderboard('Putra'),
                apiService.getLeaderboard('Putri')
            ]);
            setPutraLeaderboard(putraData);
            setPutriLeaderboard(putriData);
        } catch (error) {
            console.error("Failed to fetch leaderboards", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAndSetLeaderboards();
        const interval = setInterval(fetchAndSetLeaderboards, 10000); // Auto-refresh every 10 seconds

        return () => clearInterval(interval);
    }, [fetchAndSetLeaderboards]);

    const currentLeaderboard = activeTab === 'Putra' ? putraLeaderboard : putriLeaderboard;
    const topThree = currentLeaderboard.slice(0, 3);
    const others = currentLeaderboard.slice(3);

    return (
        <div className="space-y-8 p-4">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold" style={{color: AppColors.primary}}>Live Info Juara</h1>
                <p className="text-lg text-gray-600 mt-2">Peringkat berdasarkan perolehan medali</p>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex justify-center bg-gray-200 rounded-lg p-1 max-w-sm mx-auto">
                <button
                    onClick={() => setActiveTab('Putra')}
                    className={`w-1/2 py-2 px-4 rounded-md font-semibold transition-colors ${activeTab === 'Putra' ? 'text-white shadow' : 'text-gray-600'}`}
                    style={{backgroundColor: activeTab === 'Putra' ? AppColors.primary : 'transparent'}}
                >
                    Juara Umum Putra
                </button>
                <button
                    onClick={() => setActiveTab('Putri')}
                     className={`w-1/2 py-2 px-4 rounded-md font-semibold transition-colors ${activeTab === 'Putri' ? 'text-white shadow' : 'text-gray-600'}`}
                    style={{backgroundColor: activeTab === 'Putri' ? AppColors.primary : 'transparent'}}
                >
                    Juara Umum Putri
                </button>
            </div>

            {loading ? (
                 <div className="text-center py-16">
                    <p className="text-2xl text-gray-500">Memuat papan peringkat...</p>
                 </div>
            ) : currentLeaderboard.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-2xl text-gray-500">Papan Peringkat masih kosong untuk kategori {activeTab}.</p>
                    <p className="text-gray-400">Nilai akan muncul di sini setelah diinput oleh juri.</p>
                </div>
            ) : (
                <div className="space-y-12">
                     {/* Top 3 Podium */}
                    <LeaderboardPodium topThree={topThree} />
                    
                    {/* Rest of the leaderboard */}
                    {others.length > 0 && (
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                             <table className="min-w-full">
                                <thead style={{backgroundColor: AppColors.primary}} className="text-white">
                                    <tr>
                                        <th className="py-4 px-6 text-left font-semibold">Rank</th>
                                        <th className="py-4 px-6 text-left font-semibold">Regu</th>
                                        <th className="py-4 px-6 text-center font-semibold">Perolehan Medali</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                     {others.map(entry => (
                                        <tr key={entry.teamId} className="hover:bg-gray-100 transition-colors">
                                            <td className="py-4 px-6 text-xl font-bold text-gray-700">{entry.rank}</td>
                                            <td className="py-4 px-6">
                                                <p className="font-semibold text-lg text-gray-900">{entry.teamName}</p>
                                                <p className="text-sm text-gray-500">{entry.school}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <MedalDisplay entry={entry} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
