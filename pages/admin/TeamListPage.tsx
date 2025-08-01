import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { apiService } from '../../services/api';
import { Team } from '../../types';
import { Card, Button, Input, Select } from '../../components/UI';
import { UsersIcon, PrinterIcon, PencilIcon, TrashIcon, CloseIcon } from '../../constants';

type FormInputs = Omit<Team, 'id' | 'schoolId' | 'school'> & { school: string };

const EditTeamModal: React.FC<{
    team: Team;
    onClose: () => void;
    onSave: (updatedTeam: Team) => void;
}> = ({ team, onClose, onSave }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>({
        defaultValues: {
            ...team,
            members: [...team.members, ...Array(10 - team.members.length).fill('')] 
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
                members: data.members.map(m => m ? m.trim() : '').filter(m => m),
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
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2 p-4 border rounded-lg bg-gray-50">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div key={index}>
                                    <label htmlFor={`member-edit-${index}`} className="text-xs text-gray-600">Anggota {index + 1}</label>
                                    <Input
                                        id={`member-edit-${index}`}
                                        {...register(`members.${index}` as const)}
                                        placeholder={`Nama Anggota ${index + 1}`}
                                        className="mt-1"
                                    />
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
    )
}

const TeamCard: React.FC<{
    team: Team,
    className?: string,
    onEdit: (team: Team) => void,
    onDelete: (team: Team) => void,
}> = ({ team, className = "", onEdit, onDelete }) => (
    <Card className={`flex flex-col print:shadow-none print:border print:border-gray-300 print:mb-6 ${className}`}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-xl font-bold text-gray-800">{team.teamName}</h3>
                <p className="text-sm text-gray-500">{team.school}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 no-print">
                <Button onClick={() => onEdit(team)} variant="secondary" className="p-2 h-9 w-9" title="Edit Regu"><PencilIcon className="h-5 w-5"/></Button>
                <Button onClick={() => onDelete(team)} className="!bg-red-600 hover:!bg-red-700 p-2 h-9 w-9" title="Hapus Regu"><TrashIcon className="h-5 w-5"/></Button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
                <p className="font-semibold">Nama Pembina:</p>
                <p className="text-gray-700">{team.coachName}</p>
            </div>
            <div>
                <p className="font-semibold">No. HP Pembina:</p>
                <p className="text-gray-700">{team.coachPhone}</p>
            </div>
             {team.campNumber && (
                 <div className="md:col-span-2">
                    <p className="font-semibold">Nomor Tapak Kemah:</p>
                    <p className="text-gray-700 font-bold text-base">{team.campNumber}</p>
                </div>
            )}
        </div>
        <div>
            <p className="font-semibold mb-2">Anggota Regu:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 bg-gray-50 p-3 rounded-md">
                {team.members.map((member, index) => (
                    <li key={index}>{member}</li>
                ))}
            </ol>
             {team.members.length === 0 && <p className="text-gray-500 text-xs">Belum ada anggota yang didaftarkan.</p>}
        </div>
    </Card>
);

export const TeamListPage: React.FC = () => {
    const [putraTeams, setPutraTeams] = useState<Team[]>([]);
    const [putriTeams, setPutriTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const allTeams = await apiService.getTeams();
            setPutraTeams(allTeams.filter(t => t.type === 'Putra'));
            setPutriTeams(allTeams.filter(t => t.type === 'Putri'));
        } catch (error) {
            console.error("Failed to fetch teams:", error);
            alert("Gagal memuat daftar regu.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchTeams();
    }, []);
    
    const handleDelete = async (team: Team) => {
        if (window.confirm(`Yakin ingin menghapus regu "${team.teamName}" dari "${team.school}"? Semua nilai yang terkait dengan regu ini juga akan dihapus.`)) {
            try {
                await apiService.deleteTeam(team.id);
                fetchTeams(); // Refetch all data to ensure consistency
                alert('Regu berhasil dihapus.');
            } catch (error: any) {
                console.error("Failed to delete team:", error);
                alert(`Gagal menghapus regu: ${error.message}`);
            }
        }
    };
    
    const handleSave = (updatedTeam: Team) => {
        fetchTeams(); // Refetch all data to ensure consistency
        setEditingTeam(null);
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="flex justify-between items-center no-print">
                <h1 className="text-3xl font-bold flex items-center">
                    <UsersIcon className="w-8 h-8 mr-3"/>
                    Daftar Regu Terdaftar
                </h1>
                <Button onClick={handlePrint} variant="secondary" className="flex items-center">
                    <PrinterIcon className="w-5 h-5 mr-2" />
                    Cetak Laporan
                </Button>
            </div>

            <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">Laporan Daftar Peserta</h1>
                <h2 className="text-xl font-semibold">KWARRAN GONTA - Perkemahan Pramuka Gondangwetan</h2>
                <p className="text-sm mt-1">
                    Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
            </div>
            
            {loading ? (
                 <Card><p className="text-center p-8">Memuat daftar regu...</p></Card>
            ) : (
                <div className="space-y-8 print:space-y-0">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 print:text-xl print:mt-8">Regu Putra</h2>
                        {putraTeams.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
                                {putraTeams.map(team => <TeamCard key={team.id} team={team} onEdit={setEditingTeam} onDelete={handleDelete} />)}
                            </div>
                        ) : (
                            <Card className="print:border-none print:shadow-none"><p className="text-gray-500">Belum ada regu putra yang terdaftar.</p></Card>
                        )}
                    </section>
                    
                    <section className="print:break-before-page">
                        <h2 className="text-2xl font-bold mb-4 print:text-xl print:mt-8">Regu Putri</h2>
                         {putriTeams.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
                                {putriTeams.map(team => <TeamCard key={team.id} team={team} onEdit={setEditingTeam} onDelete={handleDelete} />)}
                            </div>
                        ) : (
                            <Card className="print:border-none print:shadow-none"><p className="text-gray-500">Belum ada regu putri yang terdaftar.</p></Card>
                        )}
                    </section>
                </div>
            )}
            
            {editingTeam && (
                <EditTeamModal 
                    team={editingTeam}
                    onClose={() => setEditingTeam(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};