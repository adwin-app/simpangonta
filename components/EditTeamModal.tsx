import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { apiService } from '../services/api';
import { Team, Competition } from '../types';
import { Card, Button, Input, Select } from './UI';
import { CloseIcon } from '../constants';

type FormInputs = Omit<Team, 'id' | 'schoolId' | 'school' | 'members'> & {
    school: string;
    members: { name: string; participatedCompetitions?: string[] }[];
};

interface EditTeamModalProps {
    team: Team;
    onClose: () => void;
    onSave: (updatedTeam: Team) => void;
    competitions: Competition[];
    isSchoolUser?: boolean;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({ team, onClose, onSave, competitions, isSchoolUser = false }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>({
        defaultValues: {
            ...team,
            members: [...team.members, ...Array(10 - team.members.length).fill({ name: '', participatedCompetitions: [] })] 
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const teamData = {
                ...data,
                members: data.members
                    .filter(m => m.name && m.name.trim())
                    .map(m => ({
                        ...m,
                        name: m.name.trim(),
                        participatedCompetitions: m.participatedCompetitions || [],
                    })),
            };
            const updatedTeam = await apiService.updateTeam(team.id, teamData);
            onSave(updatedTeam);
            onClose();
        } catch (error: any) {
            setSubmitError(error.message || 'Gagal menyimpan perubahan.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Edit Regu</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6" /></button>
                </div>
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
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. HP Pembina</label>
                            <Input type="tel" {...register('coachPhone', { required: 'No. HP wajib diisi' })} />
                            {errors.coachPhone && <p className="text-red-500 text-xs mt-1">{errors.coachPhone.message}</p>}
                        </div>
                         <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Tapak Kemah</label>
                            <Input {...register('campNumber')} placeholder="Opsional, cth: A1" />
                            {errors.campNumber && <p className="text-red-500 text-xs mt-1">{errors.campNumber.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Anggota (Maks 10)</label>
                        <div className="space-y-4 mt-2 p-4 border rounded-lg bg-gray-50 max-h-[40vh] overflow-y-auto">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-white rounded-md border">
                                    <div>
                                        <label htmlFor={`member-edit-${index}-name`} className="text-xs text-gray-600">Anggota {index + 1}</label>
                                        <Input
                                            id={`member-edit-${index}-name`}
                                            {...register(`members.${index}.name` as const)}
                                            placeholder={`Nama Anggota ${index + 1}`}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-2 block">Lomba yang Diikuti (Opsional)</label>
                                        {competitions.length > 0 ? (
                                            <div className="space-y-1 max-h-24 overflow-y-auto">
                                                {competitions.map(comp => (
                                                    <div key={comp.id} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`member-edit-${index}-comp-${comp.id}`}
                                                            {...register(`members.${index}.participatedCompetitions` as const)}
                                                            value={comp.id}
                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <label htmlFor={`member-edit-${index}-comp-${comp.id}`} className="ml-2 block text-sm text-gray-700">{comp.name}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400">Tidak ada lomba tersedia</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4">
                        {submitError && <p className="text-red-500 font-semibold">{submitError}</p>}
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};