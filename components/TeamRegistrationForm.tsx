import React, { useState, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { apiService } from '../services/api';
import { Team, UserRole } from '../types';
import { Button, Input, Select } from './UI';
import { AuthContext } from '../App';

type FormInputs = Omit<Team, 'id' | 'schoolId'>;

interface TeamRegistrationFormProps {
    onTeamRegistered?: () => void;
}

export const TeamRegistrationForm: React.FC<TeamRegistrationFormProps> = ({ onTeamRegistered }) => {
    const auth = useContext(AuthContext);
    const isSchoolUser = auth?.role === UserRole.SEKOLAH;

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<FormInputs>({
        defaultValues: {
            school: isSchoolUser ? auth.schoolName || '' : '',
            teamName: '',
            type: 'Putra',
            coachName: '',
            coachPhone: '',
            members: Array(10).fill('')
        }
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsSubmitting(true);
        setSubmitMessage('');
        try {
            const teamData = {
                ...data,
                schoolId: isSchoolUser ? auth.identifier : undefined,
                members: data.members.map(m => m.trim()).filter(m => m),
            };

            if (teamData.members.length === 0) {
                setSubmitMessage('Gagal: Harap isi setidaknya satu nama anggota.');
                setTimeout(() => setSubmitMessage(''), 3000);
                setIsSubmitting(false);
                return;
            }

            await apiService.addTeam(teamData);
            setSubmitMessage(`Regu "${data.teamName}" berhasil didaftarkan!`);
            reset();
            if (isSchoolUser) {
              setValue('school', auth.schoolName || '');
            }
            if (onTeamRegistered) {
                onTeamRegistered();
            }
        } catch (error: any) {
            setSubmitMessage(error.message || 'Terjadi kesalahan saat mendaftarkan regu.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitMessage(''), 4000);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Gugus Depan / Sekolah</label>
                    <Input 
                        {...register('school', { required: 'Nama sekolah wajib diisi' })} 
                        disabled={isSchoolUser}
                        className={isSchoolUser ? 'bg-gray-100' : ''}
                    />
                    {errors.school && <p className="text-red-500 text-xs mt-1">{errors.school.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Regu</label>
                    <Input {...register('teamName', { required: 'Nama regu wajib diisi' })} />
                    {errors.teamName && <p className="text-red-500 text-xs mt-1">{errors.teamName.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Regu</label>
                    <Select {...register('type')}>
                        <option value="Putra">Putra</option>
                        <option value="Putri">Putri</option>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pembina</label>
                    <Input {...register('coachName', { required: 'Nama pembina wajib diisi' })} />
                    {errors.coachName && <p className="text-red-500 text-xs mt-1">{errors.coachName.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. HP Pembina</label>
                    <Input type="tel" {...register('coachPhone', { required: 'No. HP wajib diisi' })} />
                    {errors.coachPhone && <p className="text-red-500 text-xs mt-1">{errors.coachPhone.message}</p>}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Anggota (Maks 10)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2 p-4 border rounded-lg">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <div key={index}>
                            <label htmlFor={`member-${index}`} className="text-xs text-gray-600">Anggota {index + 1}</label>
                            <Input
                                id={`member-${index}`}
                                {...register(`members.${index}` as const)}
                                placeholder={`Nama Anggota ${index + 1}`}
                                className="mt-1"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                {submitMessage && <p className={`font-semibold ${submitMessage.includes('Gagal') ? 'text-red-600' : 'text-green-600'}`}>{submitMessage}</p>}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Regu'}
                </Button>
            </div>
        </form>
    );
};
