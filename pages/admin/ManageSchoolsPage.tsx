import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI';
import { apiService } from '../../services/api';
import { School } from '../../types';
import { BuildingOfficeIcon } from '../../constants';

export const ManageSchoolsPage: React.FC = () => {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSchools = async () => {
            setLoading(true);
            try {
                const data = await apiService.getSchools();
                setSchools(data);
            } catch (err: any) {
                setError('Gagal memuat daftar sekolah.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchools();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold flex items-center">
                <BuildingOfficeIcon className="w-8 h-8 mr-3" />
                Kelola Akun Sekolah
            </h1>

            <Card>
                <h2 className="text-xl font-semibold mb-4">Daftar Sekolah Terdaftar</h2>
                {loading && <p>Memuat...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                    schools.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Sekolah / Gugus Depan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Kontak</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {schools.map(school => (
                                        <tr key={school.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{school.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{school.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">Belum ada sekolah yang mendaftar.</p>
                    )
                )}
            </Card>
        </div>
    );
};
