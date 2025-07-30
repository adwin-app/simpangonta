import React, { useState, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input } from '../../components/UI';
import { AppRoutes, KeyIcon } from '../../constants';
import { apiService } from '../../services/api';
import { AuthContext } from '../../App';
import { UserRole } from '../../types';

type FormInputs = {
    name: string;
    email: string;
    password: string;
};

export const SchoolRegisterPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();
    const [apiError, setApiError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsSubmitting(true);
        setApiError('');
        try {
            const school = await apiService.schoolRegister(data);
            if (school && school.id) {
                // Automatically log in the user after successful registration
                auth?.login(UserRole.SEKOLAH, school.id, { schoolName: school.name });
                navigate(AppRoutes.schoolDashboard);
            }
        } catch (err: any) {
            setApiError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center p-4">
            <Card className="w-full max-w-lg">
                <div className="text-center mb-6">
                    <KeyIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <h2 className="text-2xl font-bold mt-2">Daftar Akun Sekolah</h2>
                    <p className="text-gray-500 text-sm">Buat akun untuk mendaftarkan regu sekolah Anda.</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah / Gugus Depan</label>
                        <Input {...register('name', { required: 'Nama sekolah wajib diisi' })} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                        <Input type="email" {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/i, message: "Format email tidak valid" } })} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <Input type="password" {...register('password', { required: 'Password wajib diisi', minLength: { value: 6, message: 'Password minimal 6 karakter' } })} />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    
                    {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Mendaftarkan...' : 'Daftar dan Masuk'}
                    </Button>
                </form>
                <div className="text-center mt-4">
                     <p className="text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <Link to={AppRoutes.schoolLogin} className="font-medium text-green-600 hover:text-green-500">
                            Login di sini
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};
