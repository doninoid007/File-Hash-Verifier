
import React, { useState } from 'react';
import { ComparisonMode } from './types';
import { useFileHasher } from './hooks/useFileHasher';
import { ReportDisplay } from './components/ReportDisplay';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { ArrowPathIcon } from './components/icons/ArrowPathIcon';
import ReportModal from './components/ReportModal';

const App: React.FC = () => {
    const {
        mode, setMode,
        algorithm, setAlgorithm,
        file1, setFile1,
        file2, setFile2,
        targetHash, setTargetHash,
        isLoading,
        error,
        report,
        handleCompare,
        handleReset,
        handleGenerateAndDownloadReport,
        formatFileSize
    } = useFileHasher();

    const [isDraggingFile1, setIsDraggingFile1] = useState<boolean>(false);
    const [isDraggingFile2, setIsDraggingFile2] = useState<boolean>(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const handleDragEvent = (e: React.DragEvent, setter: React.Dispatch<React.SetStateAction<boolean>>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setter(isEntering);
    };

    const handleDrop = (e: React.DragEvent, fileSetter: (file: File | null) => void, dragSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
        e.preventDefault();
        e.stopPropagation();
        dragSetter(false);
        const droppedFile = e.dataTransfer.files?.[0] ?? null;
        if (droppedFile) {
            fileSetter(droppedFile);
        }
    };

    return (
        <div className="bg-slate-900 text-slate-300 min-h-screen font-sans flex flex-col items-center p-4 sm:p-8 transition-colors duration-500">
            <main className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-wider">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
                            File Hash Verifier
                        </span>
                    </h1>
                    <p className="text-slate-400 mt-3 text-lg">
                        Securely compare files or verify a file against a known hash value.
                        <br />
                        by : doninoid | PUSFID | 2025
                    </p>
                </header>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8 mb-8 shadow-2xl shadow-slate-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="mode" className="block text-sm font-medium text-slate-400 mb-2">Comparison Mode</label>
                            <select
                                id="mode"
                                value={mode}
                                onChange={(e) => setMode(e.target.value as ComparisonMode)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            >
                                <option value={ComparisonMode.FileVsFile}>File vs. File</option>
                                <option value={ComparisonMode.FileVsHash}>File vs. Hash</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="algorithm" className="block text-sm font-medium text-slate-400 mb-2">Hash Algorithm</label>
                            <select
                                id="algorithm"
                                value={algorithm}
                                onChange={(e) => setAlgorithm(e.target.value as any)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            >
                                <option>MD5</option>
                                <option>SHA-1</option>
                                <option>SHA-256</option>
                                <option>SHA-384</option>
                                <option>SHA-512</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Source File Input */}
                        <div
                            onDragEnter={(e) => handleDragEvent(e, setIsDraggingFile1, true)}
                            onDragLeave={(e) => handleDragEvent(e, setIsDraggingFile1, false)}
                            onDragOver={(e) => handleDragEvent(e, setIsDraggingFile1, true)}
                            onDrop={(e) => handleDrop(e, setFile1, setIsDraggingFile1)}
                            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${isDraggingFile1 ? 'border-cyan-400 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'}`}
                        >
                            <div className="text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-slate-500" />
                                <label htmlFor="file1-upload" className="mt-4 text-sm font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer">
                                    Upload a file
                                </label>
                                <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
                                <input id="file1-upload" type="file" className="sr-only" onChange={(e) => setFile1(e.target.files?.[0] ?? null)} />
                            </div>
                            {file1 && (
                                <div className="mt-4 text-center text-sm bg-slate-700 p-2 rounded-md">
                                    <p className="text-slate-200 font-medium truncate">{file1.name}</p>
                                    <p className="text-slate-400 text-xs">{formatFileSize(file1.size)}</p>
                                    <button onClick={() => setFile1(null)} className="absolute -top-2 -right-2 bg-slate-600 rounded-full p-0.5 text-slate-300 hover:bg-red-500 hover:text-white transition-colors">
                                        <XCircleIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Comparison Input */}
                        {mode === ComparisonMode.FileVsFile ? (
                            <div
                                onDragEnter={(e) => handleDragEvent(e, setIsDraggingFile2, true)}
                                onDragLeave={(e) => handleDragEvent(e, setIsDraggingFile2, false)}
                                onDragOver={(e) => handleDragEvent(e, setIsDraggingFile2, true)}
                                onDrop={(e) => handleDrop(e, setFile2, setIsDraggingFile2)}
                                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${isDraggingFile2 ? 'border-cyan-400 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'}`}
                            >
                                <div className="text-center">
                                    <UploadIcon className="mx-auto h-12 w-12 text-slate-500" />
                                    <label htmlFor="file2-upload" className="mt-4 text-sm font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer">
                                        Upload a comparison file
                                    </label>
                                    <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
                                    <input id="file2-upload" type="file" className="sr-only" onChange={(e) => setFile2(e.target.files?.[0] ?? null)} />
                                </div>
                                {file2 && (
                                    <div className="mt-4 text-center text-sm bg-slate-700 p-2 rounded-md">
                                        <p className="text-slate-200 font-medium truncate">{file2.name}</p>
                                        <p className="text-slate-400 text-xs">{formatFileSize(file2.size)}</p>
                                        <button onClick={() => setFile2(null)} className="absolute -top-2 -right-2 bg-slate-600 rounded-full p-0.5 text-slate-300 hover:bg-red-500 hover:text-white transition-colors">
                                            <XCircleIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="targetHash" className="block text-sm font-medium text-slate-400 mb-2">Expected Hash</label>
                                <input
                                    type="text"
                                    id="targetHash"
                                    value={targetHash}
                                    onChange={(e) => setTargetHash(e.target.value)}
                                    placeholder="Enter hash value..."
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition font-mono"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <button
                            onClick={handleCompare}
                            disabled={isLoading}
                            className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Comparing...
                                </>
                            ) : 'Compare Hashes'}
                        </button>
                         <button
                            onClick={handleReset}
                            title="Reset all fields"
                            className="bg-slate-700 text-slate-300 p-3 rounded-md hover:bg-slate-600 transition-colors"
                        >
                            <ArrowPathIcon className="h-5 w-5"/>
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    {error && (
                        <div className="bg-red-900/50 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {report && <ReportDisplay report={report} onGenerateReport={() => setIsReportModalOpen(true)} />}
                </div>

                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    onGenerate={handleGenerateAndDownloadReport}
                />
            </main>
            <footer className="w-full max-w-4xl mx-auto text-center mt-12 pb-4">
                <p className="text-sm text-slate-500">
                    All hashing is performed locally in your browser. Your files are never uploaded.
                </p>
            </footer>
        </div>
    );
};

export default App;
