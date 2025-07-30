import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Competition, Criterion } from '../../types';
import { Card, Button, Input } from '../../components/UI';
import { PlusCircleIcon, TrophyIcon, CloseIcon } from '../../constants';

const EditCompetitionModal: React.FC<{
    competition: Competition;
    onClose: () => void;
    onSave: () => void;
}> = ({ competition, onClose, onSave }) => {
    const [name, setName] = useState(competition.name);
    const [criteria, setCriteria] = useState<Criterion[]>(competition.criteria);
    const [isSaving, setIsSaving] = useState(false);

    const handleCriterionChange = (index: number, value: string) => {
        const newCriteria = [...criteria];
        newCriteria[index] = { ...newCriteria[index], name: value };
        setCriteria(newCriteria);
    };

    const addCriterion = () => {
        setCriteria([...criteria, { id: `new-${Date.now()}`, name: '' }]);
    };

    const removeCriterion = (id: string) => {
        setCriteria(criteria.filter(c => c.id !== id));
    };

    const handleSave = async () => {
        if (name.trim() && criteria.every(c => c.name.trim())) {
            setIsSaving(true);
            try {
                const finalCriteria = criteria.map(c => ({...c, name: c.name.trim()}));
                // Note: The API for update is not implemented in this example.
                // await apiService.updateCompetition(competition.id, { name: name.trim(), criteria: finalCriteria });
                alert("Fungsi update belum diimplementasikan di API.");
                onSave();
            } catch (error) {
                console.error("Failed to update competition", error);
                alert("Gagal menyimpan perubahan.");
            } finally {
                setIsSaving(false);
            }
        } else {
            alert("Nama lomba dan semua nama kriteria wajib diisi.");
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lomba</label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kriteria Penilaian</label>
                        <div className="space-y-2">
                            {criteria.map((criterion, index) => (
                                <div key={criterion.id} className="flex items-center gap-2">
                                    <Input
                                        value={criterion.name}
                                        onChange={e => handleCriterionChange(index, e.target.value)}
                                        placeholder={`Kriteria ${index + 1}`}
                                        className="flex-grow"
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
    const [newCriteria, setNewCriteria] = useState<{name: string}[]>([{ name: '' }]);
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

    const addCriterionInput = () => setNewCriteria([...newCriteria, { name: '' }]);
    const removeCriterionInput = (index: number) => setNewCriteria(newCriteria.filter((_, i) => i !== index));
    const handleCriterionInputChange = (index: number, value: string) => {
        const updatedCriteria = [...newCriteria];
        updatedCriteria[index].name = value;
        setNewCriteria(updatedCriteria);
    };

    const handleAddCompetition = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalCriteria = newCriteria.map(c => ({ name: c.name.trim() })).filter(c => c.name);
        if (newCompetitionName.trim() && finalCriteria.length > 0) {
            setIsSubmitting(true);
            try {
                await apiService.addCompetition(newCompetitionName.trim(), finalCriteria);
                setNewCompetitionName('');
                setNewCriteria([{ name: '' }]);
                fetchCompetitions();
            } catch (error) {
                console.error("Failed to add competition:", error);
                alert(`Gagal menambah lomba: ${error.message}`);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            alert("Nama lomba dan minimal satu kriteria wajib diisi.");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Kelola Lomba</h1>
            <Card>
                <h2 className="text-xl font-semibold mb-4">Tambah Lomba Baru</h2>
                <form onSubmit={handleAddCompetition} className="space-y-4">
                    <div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kriteria Penilaian</label>
                        <div className="space-y-2">
                        {newCriteria.map((criterion, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    placeholder={`Nama Kriteria ${index + 1}`}
                                    value={criterion.name}
                                    onChange={(e) => handleCriterionInputChange(index, e.target.value)}
                                    className="flex-grow"
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
                        {competitions.map((comp) => (
                            <li key={comp.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center">
                                            <TrophyIcon className="w-6 h-6 mr-3 text-yellow-500" />
                                            <span className="text-gray-800 font-bold text-lg">{comp.name}</span>
                                        </div>
                                        <div className="mt-2 ml-9">
                                            <h4 className="text-sm font-semibold text-gray-600">Kriteria:</h4>
                                            <ul className="list-disc list-inside text-sm text-gray-700">
                                                {comp.criteria.map(c => <li key={c.id}>{c.name}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                    {/* <Button variant="secondary" className="py-1 px-3 text-sm" onClick={() => setEditingCompetition(comp)}>Edit</Button> */}
                                </div>
                            </li>
                        ))}
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
