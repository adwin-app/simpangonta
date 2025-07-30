import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { UserRole } from '../../types';
import { Card, Button, Input } from '../../components/UI';
import { AppRoutes, KeyIcon } from '../../constants';

export const AdminLoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    
    const ADMIN_PASSWORD = 'kwarrangonta';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setError('');
            auth?.login(UserRole.ADMIN, 'Admin');
            navigate(AppRoutes.adminDashboard);
        } else {
            setError('Password panitia salah.');
            setPassword('');
        }
    };

    return (
        <div className="flex justify-center items-center p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-6">
                    <KeyIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <h2 className="text-2xl font-bold mt-2">Login Panitia</h2>
                    <p className="text-gray-500 text-sm">Halaman ini khusus untuk administrator.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="password-admin" className="block text-sm font-medium text-gray-700 mb-1">Password Panitia</label>
                        <Input
                            id="password-admin"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full">
                        Masuk
                    </Button>
                </form>
            </Card>
        </div>
    );
};