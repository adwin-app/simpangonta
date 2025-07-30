import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input } from '../../components/UI';
import { AppRoutes, KeyIcon } from '../../constants';
import { apiService } from '../../services/api';
import { AuthContext } from '../../App';

export const SchoolLoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
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
            const data = await apiService.schoolLogin({ email, password });
            if (data && data.role) {
                auth?.login(data.role, data.id, { schoolName: data.name });
                navigate(AppRoutes.schoolDashboard);
            } else {
                setError('Gagal login. Kredensial tidak valid.');
            }
        } catch (err: any) {
            setError(err.message || 'Email atau password salah.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex justify-center items-center p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-6">
                    <KeyIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <h2 className="text-2xl font-bold mt-2">Login Sekolah</h2>
                    <p className="text-gray-500 text-sm">Masuk untuk mengelola pendaftaran regu Anda.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                         <Input
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
                <div className="text-center mt-4">
                     <p className="text-sm text-gray-600">
                        Belum punya akun?{' '}
                        <Link to={AppRoutes.schoolRegister} className="font-medium text-green-600 hover:text-green-500">
                            Daftar di sini
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};
