import React, { useState, useContext, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { apiService } from '../services/api';
import { Team, UserRole, TeamMember, Competition } from '../types';
import { Button, Input, Select } from './UI';
import { AuthContext } from '../App';

type FormInputs = Omit<Team, 'id' | 'schoolId' | 'members'> & {
    members: TeamMember[];
};

interface TeamRegistrationFormProps {
    onTeamRegistered?: () => void;
}

export const TeamRegistrationForm: React.FC<TeamRegistrationFormProps> = ({ onTeamRegistered }) => {
    const auth = useContext(AuthContext);
    const isSchoolUser = auth?.role === UserRole.SEKOLAH;
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loadingCompetitions, setLoadingCompetitions] = useState(true);

    useEffect(() => {
        const fetchCompetitions = async () => {
            setLoadingCompetitions(true);
            try {
                const comps = await apiService.getCompetitions();
                const filteredComps = comps.filter(c => c.name.toLowerCase() !== 'tapak kemah');
                setCompetitions(filteredComps);
            } catch (error) {
                console.error("Failed to fetch competitions for form:", error);
            } finally {
                setLoadingCompetitions(false);
            }
        };
        fetchCompetitions();
    }, []);

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<FormInputs>({
        defaultValues: {
            school: isSchoolUser ? auth.schoolName || '' : '',
            teamName: '',
            type: 'Putra',
            coachName: '',
            coachPhone: '',
            members: Array(10).fill({ name: '', participatedCompetitions: [] }),
            campNumber: ''
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
                members: data.members
                    .filter(m => m.name && m.name.trim() !== '')
                    .map(m => ({
                        name: m.name.trim(),
                        participatedCompetitions: m.participatedCompetitions || []
                    })),
            };

            if (teamData.members.length === 0) {
                setSubmitMessage('Gagal: Harap isi setidaknya satu nama anggota.');
                setTimeout(() => setSubmitMessage(''), 3000);
                setIsSubmitting(false);
                return;
            }

            await apiService.addTeam(teamData as any);
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Tapak Kemah</label>
                    <Input {...register('campNumber')} placeholder="Opsional, cth: A1" />
                    {errors.campNumber && <p className="text-red-500 text-xs mt-1">{errors.campNumber.message}</p>}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Anggota (Maks 10)</label>
                <div className="space-y-4 mt-2 p-4 border rounded-lg">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md border">
                            <div>
                                <label htmlFor={`member-${index}-name`} className="text-xs text-gray-600">Anggota {index + 1}</label>
                                <Input
                                    id={`member-${index}-name`}
                                    {...register(`members.${index}.name` as const)}
                                    placeholder={`Nama Anggota ${index + 1}`}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 mb-2 block">Lomba yang Diikuti (Opsional)</label>
                                {loadingCompetitions ? (
                                    <p className="text-xs text-gray-400">Memuat lomba...</p>
                                ) : competitions.length > 0 ? (
                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                        {competitions.map(comp => (
                                            <div key={comp.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`member-${index}-comp-${comp.id}`}
                                                    {...register(`members.${index}.participatedCompetitions` as const)}
                                                    value={comp.id}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor={`member-${index}-comp-${comp.id}`} className="ml-2 block text-sm text-gray-700">{comp.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400">Tidak ada lomba yang bisa dipilih.</p>
                                )}
                            </div>
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