
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Competition, JudgeReportData } from '../../types';
import { Card, Select, Button } from '../../components/UI';
import { DocumentReportIcon, PrinterIcon } from '../../constants';

const ReportTable: React.FC<{
    title: string;
    teams: JudgeReportData['putra'] | JudgeReportData['putri'];
    judges: JudgeReportData['judges'];
}> = ({ title, teams, judges }) => {
    if (teams.length === 0) {
        return <p className="text-gray-500 py-4">Tidak ada regu terdaftar untuk kategori {title}.</p>;
    }
    
    return (
        <section className="print:break-inside-auto">
            <h3 className="text-xl font-bold mb-4 print:text-lg">{title}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-100 print:bg-gray-100">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Regu</th>
                            {judges.map(judge => (
                                <th key={judge.id} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">{judge.username}</th>
                            ))}
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Rata-rata</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {teams.map(team => (
                            <tr key={team.teamId}>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{team.teamName}</div>
                                    <div className="text-sm text-gray-500">{team.school}</div>
                                </td>
                                {judges.map(judge => (
                                    <td key={judge.id} className="px-4 py-4 whitespace-nowrap text-center font-semibold">
                                        {team.scores[judge.id] !== undefined 
                                            ? <span className="text-gray-800">{team.scores[judge.id]}</span>
                                            : <span className="text-gray-400">-</span>
                                        }
                                    </td>
                                ))}
                                 <td className="px-4 py-4 whitespace-nowrap text-center font-bold text-green-700">{team.averageScore}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};


export const JudgeReportPage: React.FC = () => {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
    const [reportData, setReportData] = useState<JudgeReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        apiService.getCompetitions()
            .then(data => setCompetitions(data))
            .catch(() => setError('Gagal memuat daftar lomba.'));
    }, []);

    useEffect(() => {
        if (selectedCompetitionId) {
            setLoading(true);
            setError('');
            setReportData(null);
            apiService.getJudgeReport(selectedCompetitionId)
                .then(data => setReportData(data))
                .catch(() => setError('Gagal memuat laporan untuk lomba ini.'))
                .finally(() => setLoading(false));
        }
    }, [selectedCompetitionId]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentReportIcon className="w-8 h-8 mr-3"/>
                    Laporan Nilai Juri
                </h1>
                <Button onClick={handlePrint} variant="secondary" className="flex items-center" disabled={!reportData}>
                    <PrinterIcon className="w-5 h-5 mr-2" />
                    Cetak Laporan
                </Button>
            </div>
            
            <Card className="no-print">
                 <label htmlFor="competition-select" className="block text-sm font-medium text-gray-700 mb-1">Pilih Lomba untuk Melihat Laporan</label>
                 <Select 
                    id="competition-select"
                    value={selectedCompetitionId}
                    onChange={e => setSelectedCompetitionId(e.target.value)}
                    disabled={competitions.length === 0}
                 >
                    <option value="">-- Pilih Lomba --</option>
                    {competitions.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                 </Select>
            </Card>

            <div className="printable-area">
                 <div className="hidden print:block text-center mb-8">
                    <h1 className="text-2xl font-bold border-b-2 border-black pb-2 mb-2">Laporan Rinci Nilai Juri</h1>
                    {reportData && <h2 className="text-xl font-semibold">{reportData.competitionName}</h2>}
                    <p className="text-sm mt-1">
                        Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                {loading && <Card><p className="text-center p-8">Memuat laporan...</p></Card>}
                {error && <Card><p className="text-center text-red-500 p-8">{error}</p></Card>}
                {reportData && (
                    <Card className="print:shadow-none print:border-none print:p-0">
                       <div className="space-y-8">
                           <ReportTable title="Regu Putra" teams={reportData.putra} judges={reportData.judges} />
                           <ReportTable title="Regu Putri" teams={reportData.putri} judges={reportData.judges} />
                       </div>
                    </Card>
                )}
                 {!loading && !reportData && !selectedCompetitionId &&
                    <Card><p className="text-center text-gray-500 p-8">Silakan pilih lomba dari menu di atas untuk menampilkan laporan.</p></Card>
                 }
            </div>

        </div>
    );
};