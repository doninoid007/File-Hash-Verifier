import React, { useState } from 'react';
import { Report, FileDetails } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

const formatFileSize = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const unitIndex = Math.min(i, sizes.length - 1);
    const formattedSize = parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(2));
    return `${formattedSize} ${sizes[unitIndex]}`;
};

interface ReportRowProps {
    label: string;
    value: string;
    breakWord?: boolean;
    isCopyable?: boolean;
    copyButtonText?: string;
}

const ReportRow: React.FC<ReportRowProps> = ({ label, value, breakWord = false, isCopyable = false, copyButtonText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    };
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2 border-b border-slate-800 last:border-b-0">
            <dt className="font-medium text-slate-400 truncate">{label}</dt>
            <dd className={`sm:col-span-2 text-slate-200 flex items-center justify-between`}>
                <span className={`flex-1 font-mono text-xs ${breakWord ? 'break-all' : ''}`}>{value}</span>
                 {copyButtonText ? (
                    <button 
                        onClick={handleCopy} 
                        className="ml-4 text-xs whitespace-nowrap bg-slate-700 text-slate-300 font-semibold py-1 px-3 rounded-md hover:bg-slate-600 transition-colors duration-200 disabled:opacity-50"
                        disabled={copied}
                    >
                        {copied ? 'Copied!' : copyButtonText}
                    </button>
                ) : isCopyable ? (
                    <button onClick={handleCopy} title="Copy to clipboard" className="ml-2 p-1 text-slate-400 hover:text-cyan-400 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
                    </button>
                ) : null}
            </dd>
        </div>
    );
};

const FileDetailsDisplay: React.FC<{ details: FileDetails, title: string }> = ({ details, title }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-cyan-400 border-b border-slate-700 pb-2 mb-3">{title}</h3>
        <dl className="text-sm">
            <ReportRow label="Name" value={details.name} copyButtonText="Copy" />
            <ReportRow label="Size" value={formatFileSize(details.size)} copyButtonText="Copy" />
            <ReportRow label="Type" value={details.type} copyButtonText="Copy" />
            <ReportRow label="Last Modified" value={new Date(details.lastModified).toLocaleString()} copyButtonText="Copy" />
        </dl>
        {details.exif && (
            <div className="mt-4 pl-4 border-l-2 border-slate-700">
                <h4 className="text-md font-semibold text-slate-300 mb-2">EXIF Data</h4>
                <dl className="text-sm">
                    {Object.entries(details.exif).map(([key, value]) => (
                         <ReportRow key={key} label={key} value={String(value)} isCopyable />
                    ))}
                </dl>
            </div>
        )}
    </div>
);


export const ReportDisplay: React.FC<{ report: Report; onGenerateReport: () => void; }> = ({ report, onGenerateReport }) => {
    const [reportCopied, setReportCopied] = useState(false);
    const isMatch = report.match;

    const formatReportToString = (reportData: Report): string => {
        // This function would need to be updated to handle the new nested structure for copying.
        // For brevity, the logic is simplified here. A full implementation would format all details.
         return JSON.stringify(reportData, null, 2);
    };

    const handleCopyReport = () => {
        const reportString = formatReportToString(report);
        navigator.clipboard.writeText(reportString).then(() => {
            setReportCopied(true);
            setTimeout(() => setReportCopied(false), 2000);
        }).catch(err => {
            console.error("Failed to copy report: ", err);
        });
    };

    return (
        <div className="bg-slate-900/50 border border-cyan-500/40 rounded-lg p-6 animate-fade-in shadow-lg shadow-cyan-500/10">
            <div className={`flex items-center text-2xl font-bold mb-6 ${isMatch ? 'text-green-400' : 'text-red-400'}`}>
                {isMatch ? <CheckCircleIcon className="h-8 w-8 mr-3" /> : <XCircleIcon className="h-8 w-8 mr-3" />}
                <h2 className="tracking-wide">Comparison Result: {isMatch ? "Match" : "Mismatch"}</h2>
            </div>
            
            <FileDetailsDisplay details={report.sourceFile} title="Source File Details" />
            {report.targetFile && <FileDetailsDisplay details={report.targetFile} title="Comparison File Details" />}
            
            <div className="mt-4">
                 <h3 className="text-lg font-semibold text-cyan-400 border-b border-slate-700 pb-2 mb-3">Comparison Details</h3>
                 <dl className="text-sm">
                    <ReportRow label="Algorithm" value={report['Algorithm']} copyButtonText="Copy" />
                    <ReportRow label="Source Hash" value={report.sourceHash} breakWord copyButtonText="Copy"/>
                    <ReportRow label="Comparison Hash" value={report.targetHash} breakWord copyButtonText="Copy"/>
                     <ReportRow label="Generated At" value={new Date(report['Generated']).toLocaleString()} copyButtonText="Copy" />
                    <ReportRow label="Report ID" value={report['Report ID']} breakWord isCopyable/>
                 </dl>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <button
                    onClick={handleCopyReport}
                    className="inline-flex items-center justify-center w-full sm:w-auto bg-slate-700 text-slate-200 font-semibold py-2 px-5 rounded-md hover:bg-slate-600 transition-colors duration-200"
                >
                    {reportCopied ? (
                        <>
                            <CheckIcon className="h-5 w-5 mr-2 text-green-400" />
                            Report Copied!
                        </>
                    ) : (
                        <>
                             <CopyIcon className="h-5 w-5 mr-2" />
                             Copy Report
                        </>
                    )}
                </button>
                <button
                    onClick={onGenerateReport}
                    className="inline-flex items-center justify-center w-full sm:w-auto bg-slate-700 text-slate-200 font-semibold py-2 px-5 rounded-md hover:bg-slate-600 transition-colors duration-200"
                >
                    <DownloadIcon className="h-5 w-5 mr-2" />
                    Generate Report
                </button>
            </div>
        </div>
    );
};