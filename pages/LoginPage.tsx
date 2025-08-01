import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { UserRole } from '../types';
import { Card, Button, Input } from '../components/UI';
import { AppRoutes, KeyIcon } from '../constants';
import { apiService } from '../services/api';

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);
        
        try {
            const user = await apiService.judgeLogin({ username, password });
            if (user && user.role === UserRole.JURI) {
                auth?.login(user.role, user.id, { 
                    assignedCompetitionId: user.assignedCompetitionId,
                    assignedTeamType: user.assignedTeamType,
                    assignedCriteriaIds: user.assignedCriteriaIds
                });
                navigate(AppRoutes.judgePortal);
            } else {
                setError('Hanya juri yang dapat login di halaman ini.');
            }
        } catch (err: any) {
            setError(err.message || 'Username atau password salah.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex justify-center items-center p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-6">
                    <KeyIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <h2 className="text-2xl font-bold mt-2">Login Juri</h2>
                    <p className="text-gray-500 text-sm">Masukkan kredensial yang diberikan panitia.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password-juri" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                         <Input
                            id="password-juri"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                         />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full" disabled={isLoggingIn}>
                        {isLoggingIn ? 'Memproses...' : 'Masuk'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};