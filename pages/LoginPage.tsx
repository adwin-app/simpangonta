
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { UserRole, Competition } from '../types';
import { Card, Button, Select } from '../components/UI';
import { AppRoutes } from '../constants';
import { apiService } from '../services/api';

export const LoginPage: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);
    const [judgeId, setJudgeId] = useState('');
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loadingCompetitions, setLoadingCompetitions] = useState(false);
    
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedRole === UserRole.JURI) {
            setLoadingCompetitions(true);
            setJudgeId('');
            apiService.getCompetitions()
                .then(data => {
                    setCompetitions(data);
                    if (data.length > 0) {
                        setJudgeId(`Juri ${data[0].name}`); 
                    }
                })
                .catch(err => {
                    console.error("Failed to load competitions for judge login", err);
                })
                .finally(() => {
                    setLoadingCompetitions(false);
                });
        }
    }, [selectedRole]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const roleToLogin = selectedRole;
        
        if (roleToLogin === UserRole.JURI && !judgeId) {
            alert("Tidak ada lomba yang tersedia untuk dinilai. Harap hubungi panitia.");
            return;
        }
        
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
                             <label htmlFor="judgeId" className="block text-sm font-medium text-gray-700 mb-1">Pilih Lomba yang Dinilai</label>
                             <Select
                                id="judgeId"
                                value={judgeId}
                                onChange={(e) => setJudgeId(e.target.value)}
                                disabled={loadingCompetitions || competitions.length === 0}
                             >
                                {loadingCompetitions ? (
                                    <option>Memuat daftar lomba...</option>
                                ) : competitions.length > 0 ? (
                                    competitions.map(comp => (
                                        <option key={comp.id} value={`Juri ${comp.name}`}>
                                            Juri {comp.name}
                                        </option>
                                    ))
                                ) : (
                                    <option>Tidak ada lomba tersedia</option>
                                )}
                             </Select>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={selectedRole === UserRole.JURI && (!judgeId || loadingCompetitions)}>
                        Masuk
                    </Button>
                </form>
            </Card>
        </div>
    );
};
