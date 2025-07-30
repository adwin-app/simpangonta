import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/UI';
import { apiService } from '../../services/api';
import { DashboardStats } from '../../types';
import { AppColors, UsersIcon, ClipboardListIcon, TrophyIcon, ChartBarIcon } from '../../constants';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 rounded-full text-white" style={{backgroundColor: AppColors.primary}}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    </Card>
);

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div>Memuat dashboard...</div>;
    }
    
    if (!stats) {
        return <div>Gagal memuat data statistik.</div>;
    }

    const chartData = stats.scoresByJudge.map(item => ({
        name: item.judgeId,
        "Jumlah Nilai Masuk": item.count,
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard Panitia</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Regu" value={stats.totalTeams} icon={<UsersIcon className="h-6 w-6" />} />
                <StatCard title="Total Peserta" value={stats.totalParticipants} icon={<UsersIcon className="h-6 w-6" />} />
                <StatCard title="Jumlah Lomba" value={stats.totalCompetitions} icon={<TrophyIcon className="h-6 w-6" />} />
                <StatCard title="Regu Putra / Putri" value={`${stats.teamsByType.putra} / ${stats.teamsByType.putri}`} icon={<ClipboardListIcon className="h-6 w-6" />} />
            </div>

            <Card>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <ChartBarIcon className="w-6 h-6 mr-2" />
                    Aktivitas Juri (Nilai Masuk)
                </h2>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Jumlah Nilai Masuk" fill={AppColors.primary} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};
