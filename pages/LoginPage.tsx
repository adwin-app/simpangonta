
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { UserRole } from '../types';
import { Card, Button, Select } from '../components/UI';
import { AppRoutes } from '../constants';

export const LoginPage: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);
    const [judgeId, setJudgeId] = useState('Juri Tapak Kemah');
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const roleToLogin = selectedRole;
        const identifier = roleToLogin === UserRole.JURI ? judgeId : 'Admin';
        auth?.login(roleToLogin, identifier);
        
        if (roleToLogin === UserRole.ADMIN) {
            navigate(AppRoutes.adminDashboard);
        } else {
            navigate(AppRoutes.judgePortal);
        }
    };

    return (
        <div className="flex justify-center items-center p-4">
            <Card className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Pilih Peran Anda</label>
                        <Select
                            id="role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                        >
                            <option value={UserRole.ADMIN}>Panitia (Admin)</option>
                            <option value={UserRole.JURI}>Juri</option>
                        </Select>
                    </div>
                    
                    {selectedRole === UserRole.JURI && (
                        <div>
                             <label htmlFor="judgeId" className="block text-sm font-medium text-gray-700 mb-1">Nama Juri</label>
                             <Select
                                id="judgeId"
                                value={judgeId}
                                onChange={(e) => setJudgeId(e.target.value)}
                             >
                                <option>Juri Tapak Kemah</option>
                                <option>Juri Gelas Racing</option>
                                <option>Juri KIM</option>
                                <option>Juri Cerdas Cermat</option>
                                <option>Juri Kuda Tuli</option>
                             </Select>
                        </div>
                    )}

                    <Button type="submit" className="w-full">
                        Masuk
                    </Button>
                </form>
            </Card>
        </div>
    );
};