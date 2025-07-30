
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/UI';
import { AppRoutes, AppColors, ScoutBadgeIcon } from '../constants';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="text-center p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Card className="flex flex-col items-center">
                    <ScoutBadgeIcon className="w-24 h-24 mb-4" style={{ color: AppColors.primary }}/>
                    <h1 className="text-4xl md:text-5xl font-extrabold" style={{color: AppColors.primary}}>
                        Selamat Datang di SIMPAN GONTA
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Sistem Informasi Perkemahan dan Perlombaan Pramuka Gondangwetan
                    </p>
                    <p className="mt-2 text-md text-gray-500 max-w-2xl">
                        Platform digital untuk mengelola pendaftaran, penilaian, dan menampilkan hasil juara secara transparan dan real-time.
                    </p>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                        <Button onClick={() => navigate(AppRoutes.publicLeaderboard)}>
                            🏆 Live Info Juara
                        </Button>
                        <Button onClick={() => navigate(AppRoutes.login)} variant="secondary">
                            🔐 Login Panitia / Juri
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
