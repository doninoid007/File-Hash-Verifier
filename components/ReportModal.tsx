import React, { useState } from 'react';
import { ReportFormat, ReportOptions } from '../types';
import { CustomCheckbox } from './CustomCheckbox';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (options: ReportOptions) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [selectedFormats, setSelectedFormats] = useState<ReportFormat[]>(['PDF']);
    const [reportTitle, setReportTitle] = useState('');
    const [purposeNotes, setPurposeNotes] = useState('');
    const [verifiedBy, setVerifiedBy] = useState('');
    const [organization, setOrganization] = useState('');

    const handleFormatChange = (format: ReportFormat, checked: boolean) => {
        setSelectedFormats(prev =>
            checked ? [...prev, format] : prev.filter(f => f !== format)
        );
    };

    const handleSubmit = () => {
        if (selectedFormats.length === 0) {
            alert('Please select at least one report format.');
            return;
        }
        onGenerate({
            formats: selectedFormats,
            reportTitle,
            purposeNotes,
            verifiedBy,
            organization
        });
        onClose();
    };

    if (!isOpen) return null;

    const formats: { id: ReportFormat; label: string; description: string, disabled?: boolean }[] = [
        { id: 'PDF', label: 'PDF', description: 'Professional certificate-style report' },
        { id: 'HTML', label: 'HTML', description: 'Styled, self-contained report' },
        { id: 'TXT', label: 'TXT', description: 'Plain text report' },
        { id: 'JSON', label: 'JSON', description: 'Programmatic/API format' },
        { id: 'CSV', label: 'CSV', description: 'Spreadsheet format' },
    ];

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl p-6 sm:p-8 m-4 text-slate-300 font-mono" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-green-400 mb-6">Generate Comparison Report</h2>
                
                <div className="space-y-6">
                    {/* Report Format */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-slate-200">REPORT FORMAT:</h3>
                        <div className="space-y-1">
                            {formats.map(({ id, label, description, disabled }) => (
                                 <CustomCheckbox
                                    key={id}
                                    id={`format-${id}`}
                                    label={label}
                                    description={description}
                                    checked={selectedFormats.includes(id)}
                                    onChange={(checked) => handleFormatChange(id, checked)}
                                    disabled={disabled}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="reportTitle" className="block text-sm font-semibold mb-1">REPORT TITLE (OPTIONAL):</label>
                            <input type="text" id="reportTitle" value={reportTitle} onChange={e => setReportTitle(e.target.value)} placeholder="e.g., Security Audit 2025" className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition font-sans"/>
                        </div>
                        <div>
                            <label htmlFor="purposeNotes" className="block text-sm font-semibold mb-1">PURPOSE/NOTES (OPTIONAL):</label>
                            <textarea id="purposeNotes" value={purposeNotes} onChange={e => setPurposeNotes(e.target.value)} rows={3} placeholder="e.g., Monthly verification of backup files" className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition font-sans"></textarea>
                        </div>
                         <div>
                            <label htmlFor="verifiedBy" className="block text-sm font-semibold mb-1">VERIFIED BY (OPTIONAL):</label>
                            <input type="text" id="verifiedBy" value={verifiedBy} onChange={e => setVerifiedBy(e.target.value)} placeholder="Your name" className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition font-sans"/>
                        </div>
                        <div>
                            <label htmlFor="organization" className="block text-sm font-semibold mb-1">ORGANIZATION (OPTIONAL):</label>
                            <input type="text" id="organization" value={organization} onChange={e => setOrganization(e.target.value)} placeholder="Company/Department" className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition font-sans"/>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end items-center gap-4">
                    <button onClick={onClose} className="font-bold text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-md">[CANCEL]</button>
                    <button onClick={handleSubmit} className="font-bold bg-green-900/50 border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-slate-900 transition-colors px-6 py-2 rounded-md">[GENERATE & DOWNLOAD]</button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;