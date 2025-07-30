import React from 'react';
import { Card } from '../../components/UI';
import { TeamRegistrationForm } from '../../components/TeamRegistrationForm';

export const RegisterTeamPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Pendaftaran Regu (Admin)</h1>
            <Card>
                <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md mb-4">
                    Anda login sebagai panitia. Anda dapat mendaftarkan regu untuk sekolah mana pun.
                </p>
                <TeamRegistrationForm />
            </Card>
        </div>
    );
};
