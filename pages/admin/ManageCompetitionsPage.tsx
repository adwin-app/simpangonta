import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Competition, Criterion } from '../../types';
import { Card, Button, Input } from '../../components/UI';
import { PlusCircleIcon, TrophyIcon, CloseIcon, PencilIcon, TrashIcon, UserGroupIcon } from '../../constants';

const TAPAK_KEMAH_NAME = 'Tapak Kemah';

const EditCompetitionModal: React.FC<{
    competition: Competition;
    onClose: () => void;
    onSave: () => void;
}> = ({ competition, onClose, onSave }) => {
    const [name, setName] = useState(competition.name);
    const [criteria, setCriteria] = useState<Criterion[]>(competition.criteria);
    const [participantsPerTeam, setParticipantsPerTeam] = useState(competition.participantsPerTeam);
    const [isSaving, setIsSaving] = useState(false);
    const isTapakKemah = competition.name.toLowerCase() === TAPAK_KEMAH_NAME.toLowerCase();

    const handleCriterionChange = (index: number, field: 'name' | 'maxScore', value: string) => {
        const newCriteria = [...criteria];
        const updatedCriterion = { ...newCriteria[index] };
        if (field === 'name') {
            updatedCriterion.name = value;
        } else {
            const numValue = parseInt(value, 10);
            updatedCriterion.maxScore = isNaN(numValue) || numValue <= 0 ? 1 : numValue;
        }
        newCriteria[index] = updatedCriterion;
        setCriteria(newCriteria);
    };

    const addCriterion = () => {
        setCriteria([...criteria, { id: `new-${Date.now()}`, name: '', maxScore: 100 }]);
    };

    const removeCriterion = (id: string) => {
        setCriteria(criteria.filter(c => c.id !== id));
    };

    const handleSave = async () => {
        const finalCriteria = criteria
            .map(c => ({ ...c, name: c.name.trim(), maxScore: c.maxScore || 100 }))
            .filter(c => c.name.trim() !== '');

        if (!name.trim() || finalCriteria.length === 0) {
            alert("Nama lomba dan minimal satu kriteria wajib diisi.");
            return;
        }
        
        if (finalCriteria.length < criteria.length) {
            if (!window.confirm("Beberapa kriteria kosong dan akan dihapus. Lanjutkan?")) {
                return;
            }
        }

        setIsSaving(true);
        try {
            await apiService.updateCompetition(competition.id, { 
                name: name.trim(), 
                criteria: finalCriteria,
                participantsPerTeam: isTapakKemah ? 0 : participantsPerTeam
            });
            onSave();
        } catch (error: any) {
            console.error("Failed to update competition", error);
            alert(`Gagal menyimpan perubahan: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <Card className="w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Lomba</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lomba</label>
                            <Input value={name} onChange={e => setName(e.target.value)} required disabled={isTapakKemah} />
                            {isTapakKemah && <p className="text-xs text-gray-500 mt-1">Nama lomba "Tapak Kemah" tidak dapat diubah.</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Peserta per Regu</label>
                            <Input 
                                type="number" 
                                value={isTapakKemah ? '' : participantsPerTeam} 
                                onChange={e => setParticipantsPerTeam(parseInt(e.target.value, 10) || 1)} 
                                required 
                                min="1"
                                disabled={isTapakKemah}
                                placeholder={isTapakKemah ? 'Semua Anggota' : 'Cth: 1'}
                             />
                              {isTapakKemah && <p className="text-xs text-gray-500 mt-1">Lomba ini diikuti oleh semua anggota regu.</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kriteria Penilaian</label>
                        <div className="space-y-2">
                            {criteria.map((criterion, index) => (
                                <div key={criterion.id} className="flex items-center gap-2">
                                    <Input
                                        value={criterion.name}
                                        onChange={e => handleCriterionChange(index, 'name', e.target.value)}
                                        placeholder={`Kriteria ${index + 1}`}
                                        className="flex-grow"
                                        required
                                    />
                                    <Input
                                        type="number"
                                        value={criterion.maxScore}
                                        onChange={e => handleCriterionChange(index, 'maxScore', e.target.value)}
                                        className="w-28"
                                        placeholder="Max"
                                        min="1"
                                        required
                                    />
                                    <button onClick={() => removeCriterion(criterion.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                        <CloseIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Button onClick={addCriterion} variant="secondary" className="mt-3 text-sm py-1 px-3">Tambah Kriteria</Button>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={onClose}>Batal</Button>
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};


export const ManageCompetitionsPage: React.FC = () => {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCompetitionName, setNewCompetitionName] = useState('');
    const [newParticipantsPerTeam, setNewParticipantsPerTeam] = useState<number>(1);
    const [newCriteria, setNewCriteria] = useState<{name: string, maxScore: string}[]>([{ name: '', maxScore: '100' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);

    const fetchCompetitions = async () => {
        setLoading(true);
        try {
            const data = await apiService.getCompetitions();
            setCompetitions(data);
        } catch (error) {
            console.error("Failed to fetch competitions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const addCriterionInput = () => setNewCriteria([...newCriteria, { name: '', maxScore: '100' }]);
    const removeCriterionInput = (index: number) => setNewCriteria(newCriteria.filter((_, i) => i !== index));
    const handleCriterionInputChange = (index: number, field: 'name' | 'maxScore', value: string) => {
        const updatedCriteria = [...newCriteria];
        updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
        setNewCriteria(updatedCriteria);
    };

    const handleAddCompetition = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalCriteria = newCriteria
          .map(c => ({ 
              name: c.name.trim(), 
              maxScore: parseInt(c.maxScore, 10) || 100 
          }))
          .filter(c => c.name);

        if (newCompetitionName.trim() && finalCriteria.length > 0) {
            setIsSubmitting(true);
            try {
                await apiService.addCompetition(newCompetitionName.trim(), finalCriteria, newParticipantsPerTeam);
                setNewCompetitionName('');
                setNewParticipantsPerTeam(1);
                setNewCriteria([{ name: '', maxScore: '100' }]);
                fetchCompetitions();
            } catch (error: any) {
                console.error("Failed to add competition:", error);
                alert(`Gagal menambah lomba: ${error.message}`);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            alert("Nama lomba dan minimal satu kriteria wajib diisi.");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus lomba "${name}"? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua nilai yang terkait.`)) {
            try {
                await apiService.deleteCompetition(id);
                alert(`Lomba "${name}" berhasil dihapus.`);
                fetchCompetitions();
            } catch (error: any) {
                console.error("Failed to delete competition:", error);
                alert(`Gagal menghapus lomba: ${error.message}`);
            }
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Kelola Lomba</h1>
            <Card>
                <h2 className="text-xl font-semibold mb-4">Tambah Lomba Baru</h2>
                <form onSubmit={handleAddCompetition} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="md:col-span-2">
                             <label htmlFor="competitionName" className="block text-sm font-medium text-gray-700 mb-1">Nama Lomba</label>
                             <Input
                                id="competitionName"
                                type="text"
                                value={newCompetitionName}
                                onChange={(e) => setNewCompetitionName(e.target.value)}
                                placeholder="e.g., Cerdas Cermat"
                                required
                            />
                        </div>
                        <div>
                             <label htmlFor="participantsPerTeam" className="block text-sm font-medium text-gray-700 mb-1">Peserta / Regu</label>
                             <Input
                                id="participantsPerTeam"
                                type="number"
                                value={newParticipantsPerTeam}
                                onChange={(e) => setNewParticipantsPerTeam(parseInt(e.target.value, 10) || 1)}
                                placeholder="Jumlah peserta"
                                required
                                min="1"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kriteria Penilaian</label>
                        <div className="space-y-2">
                        {newCriteria.map((criterion, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    placeholder={`Nama Kriteria ${index + 1}`}
                                    value={criterion.name}
                                    onChange={(e) => handleCriterionInputChange(index, 'name', e.target.value)}
                                    className="flex-grow"
                                    required
                                />
                                <Input
                                    type="number"
                                    placeholder="Skor Max"
                                    title="Skor Maksimal"
                                    value={criterion.maxScore}
                                    onChange={(e) => handleCriterionInputChange(index, 'maxScore', e.target.value)}
                                    className="w-28"
                                    min="1"
                                    required
                                />
                                <button type="button" onClick={() => removeCriterionInput(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        </div>
                        <Button type="button" onClick={addCriterionInput} variant="secondary" className="mt-3 text-sm py-1 px-3">Tambah Kriteria</Button>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" className="flex items-center" disabled={isSubmitting}>
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            {isSubmitting ? 'Menambahkan...' : 'Tambah Lomba'}
                        </Button>
                    </div>
                </form>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-4">Daftar Lomba Aktif</h2>
                {loading ? (
                    <p>Memuat daftar lomba...</p>
                ) : competitions.length > 0 ? (
                    <ul className="space-y-4">
                        {competitions.map((comp) => {
                            const isTapakKemah = comp.name.toLowerCase() === TAPAK_KEMAH_NAME.toLowerCase();
                            return (
                                <li key={comp.id} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center">
                                                <TrophyIcon className="w-6 h-6 mr-3 text-yellow-500" />
                                                <span className="text-gray-800 font-bold text-lg">{comp.name}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 mt-2 ml-9 gap-1">
                                                <UserGroupIcon className="w-4 h-4"/>
                                                <span>
                                                    {isTapakKemah || comp.participantsPerTeam === 0 ? 'Semua Anggota' : `${comp.participantsPerTeam} Peserta / Regu`}
                                                </span>
                                            </div>
                                            <div className="mt-2 ml-9">
                                                <h4 className="text-sm font-semibold text-gray-600">Kriteria:</h4>
                                                <ul className="list-disc list-inside text-sm text-gray-700">
                                                    {comp.criteria.map(c => <li key={c.id}>{c.name} (Skor Max: {c.maxScore})</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                             <Button variant="secondary" className="py-1 px-3 text-sm flex items-center" onClick={() => setEditingCompetition(comp)}>
                                                 <PencilIcon className="w-4 h-4 mr-1"/> Edit
                                             </Button>
                                             {!isTapakKemah && (
                                                 <Button variant="secondary" className="!bg-red-500 hover:!bg-red-600 text-white py-1 px-3 text-sm flex items-center" onClick={() => handleDelete(comp.id, comp.name)}>
                                                    <TrashIcon className="w-4 h-4 mr-1"/> Hapus
                                                 </Button>
                                             )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-500">Belum ada lomba yang ditambahkan.</p>
                )}
            </Card>
            {editingCompetition && (
                <EditCompetitionModal 
                    competition={editingCompetition}
                    onClose={() => setEditingCompetition(null)}
                    onSave={() => {
                        setEditingCompetition(null);
                        fetchCompetitions();
                    }}
                />
            )}
        </div>
    );
};