
import { useState, useCallback } from 'react';
import { ComparisonMode, HashAlgorithm, Report, ReportOptions, FileDetails, ExifData, ReportFormat } from '../types';
import { calculateFileHash } from '../services/cryptoService';
import { extractExifData } from '../services/exifService';

// Declare global libraries loaded from CDN
declare const html2canvas: any;
declare const jspdf: any;

const formatFileSize = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const unitIndex = Math.min(i, sizes.length - 1);
    const formattedSize = parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(2));
    return `${formattedSize} ${sizes[unitIndex]}`;
};

export const useFileHasher = () => {
    const [mode, setMode] = useState<ComparisonMode>(ComparisonMode.FileVsFile);
    const [algorithm, setAlgorithm] = useState<HashAlgorithm>('MD5');
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [targetHash, setTargetHash] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<Report | null>(null);

    const resetState = () => {
        setFile1(null);
        setFile2(null);
        setTargetHash('');
        setIsLoading(false);
        setError(null);
        setReport(null);
    };

    const handleFile1Change = (file: File | null) => {
        setFile1(file);
        setReport(null);
        setError(null);
    };

    const handleFile2Change = (file: File | null) => {
        setFile2(file);
        setReport(null);
        setError(null);
    };

    const handleTargetHashChange = (hash: string) => {
        setTargetHash(hash);
        setReport(null);
        setError(null);
    };
    
    const handleAlgorithmChange = (alg: HashAlgorithm) => {
        setAlgorithm(alg);
        setReport(null);
        setError(null);
    };

    const generateReportObject = (
        sourceFileObj: File,
        sourceExif: ExifData | null,
        targetFileObj: File | null,
        targetExif: ExifData | null,
        targetIdentifier: string,
        sourceHashVal: string,
        targetHashVal: string,
        match: boolean
    ): Report => {
        const sourceFileDetails: FileDetails = {
            name: sourceFileObj.name,
            size: sourceFileObj.size,
            type: sourceFileObj.type,
            lastModified: sourceFileObj.lastModified,
            ...(sourceExif && { exif: sourceExif }),
        };

        const newReport: Report = {
            "Report ID": self.crypto.randomUUID(),
            "Generated": new Date().toISOString(),
            "Title": "File Hash Comparison Report",
            "Algorithm": algorithm,
            sourceFile: sourceFileDetails,
            targetIdentifier: targetIdentifier,
            sourceHash: sourceHashVal,
            targetHash: targetHashVal,
            "Result": match ? "✅ Match" : "❌ Mismatch",
            "match": match
        };

        if (targetFileObj) {
            newReport.targetFile = {
                name: targetFileObj.name,
                size: targetFileObj.size,
                type: targetFileObj.type,
                lastModified: targetFileObj.lastModified,
                ...(targetExif && { exif: targetExif }),
            };
        }
        
        return newReport;
    };

    const handleCompare = useCallback(async () => {
        setError(null);
        setReport(null);

        if (!file1) {
            setError("Please select a source file.");
            return;
        }

        if (mode === ComparisonMode.FileVsFile && !file2) {
            setError("Please select a comparison file.");
            return;
        }

        if (mode === ComparisonMode.FileVsHash && !targetHash.trim()) {
            setError("Please enter the expected hash value.");
            return;
        }

        setIsLoading(true);

        try {
            const [hash1, sourceExif] = await Promise.all([
                calculateFileHash(file1, algorithm),
                extractExifData(file1)
            ]);
            
            let hash2 = '';
            let targetIdentifier = '';
            let targetExif: ExifData | null = null;
            
            if (mode === ComparisonMode.FileVsFile && file2) {
                [hash2, targetExif] = await Promise.all([
                    calculateFileHash(file2, algorithm),
                    extractExifData(file2)
                ]);
                targetIdentifier = file2.name;
            } else {
                hash2 = targetHash.trim().toLowerCase();
                targetIdentifier = "Expected Hash";
            }

            const match = hash1 === hash2;
            const newReport = generateReportObject(file1, sourceExif, file2, targetExif, targetIdentifier, hash1, hash2, match);
            setReport(newReport);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [file1, file2, targetHash, mode, algorithm]);

    const handleReset = () => {
        resetState();
    };

    const handleGenerateAndDownloadReport = async (options: ReportOptions) => {
        if (!report) return;

        const { sourceFile, targetFile } = report;

        const fileDetailsToString = (details: FileDetails, includeExif = true) => {
            let str = `Name: ${details.name}\nSize: ${formatFileSize(details.size)}\nType: ${details.type}\nLast Modified: ${new Date(details.lastModified).toLocaleString()}`;
            if (includeExif && details.exif) {
                str += `\nEXIF Data:\n${Object.entries(details.exif).map(([key, value]) => `  - ${key}: ${value}`).join('\n')}`;
            }
            return str;
        };
        
        const customizedReportData: { [key: string]: any } = {
            "Report ID": report["Report ID"],
            Generated: report.Generated,
            Title: options.reportTitle || report.Title,
            ...(options.purposeNotes && { "Purpose/Notes": options.purposeNotes }),
            ...(options.verifiedBy && { "Verified By": options.verifiedBy }),
            ...(options.organization && { "Organization": options.organization }),
            Algorithm: report.Algorithm,
            "Source File": fileDetailsToString(sourceFile),
            ...(targetFile && { "Comparison File": fileDetailsToString(targetFile) }),
            "Source Hash": report.sourceHash,
            "Comparison Hash": report.targetHash,
            Result: report.Result,
        };

        const generateFile = (content: string, mimeType: string, extension: string) => {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `file-hash-report-${report["Report ID"]}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };

        const generateHtmlContent = () => {
            const pusfidLogoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAApVBMVEXMDRb////KABjAABf/u5/LAxXHCxTGMCDDFxDBABjFAxXFABPKAxfJCxPtYl3tZWH5r4H8tZLybGb5q33sXFb/vKX+xLX3noP9wKn5p3ftYF7ycmr8uJv7s5P5qHz3ooT1k2zydW79v6X/w7T0g2D2mHvxgVj1km7/u6L+yL/0hGH2ln/ycmn4pXr6sJD7tZz8vJr+zMj+0M73n4f6roT3m4PxhWLMDRbVAAAGwElFTkSuQmCC";
            const detailsToHtml = (details: FileDetails) => {
                let html = `
                    <p><strong>Name:</strong> ${details.name}</p>
                    <p><strong>Size:</strong> ${formatFileSize(details.size)}</p>
                    <p><strong>Type:</strong> ${details.type}</p>
                    <p><strong>Last Modified:</strong> ${new Date(details.lastModified).toLocaleString()}</p>
                `;
                if (details.exif) {
                    html += '<h4>EXIF Data</h4><div class="exif-data">';
                    html += Object.entries(details.exif).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`).join('');
                    html += '</div>';
                }
                return html;
            };

            return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${customizedReportData.Title}</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; background-color: #0f172a; color: #cbd5e1; margin: 0; padding: 2rem; }
                    .container { max-width: 800px; margin: auto; border: 1px solid #334155; padding: 2rem; border-radius: 8px; background-color: #1e293b; }
                    .header { display: flex; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 1rem; margin-bottom: 1rem; }
                    .header img { width: 80px; height: 80px; margin-right: 1.5rem; }
                    .header h1 { color: #22d3ee; margin: 0; font-size: 2em; }
                    h2, h3 { color: #22d3ee; border-bottom: 1px solid #475569; padding-bottom: 0.5rem; margin-top: 2rem; }
                    p { margin: 0.5rem 0; }
                    strong { color: #94a3b8; }
                    .hash { word-break: break-all; font-size: 0.9em; background-color: #334155; padding: 0.5rem; border-radius: 4px; }
                    .result { font-weight: bold; font-size: 1.2em; }
                    .result.match { color: #4ade80; }
                    .result.mismatch { color: #f87171; }
                    .section { margin-bottom: 1.5rem; }
                    .exif-data { padding-left: 1rem; border-left: 2px solid #334155; margin-top: 1rem; }
                </style>
            </head>
            <body>
                <div class="container" id="report-content">
                    <div class="header">
                        <img src="${pusfidLogoBase64}" alt="PUSFID Logo">
                        <h1>${customizedReportData.Title}</h1>
                    </div>
                    <div class="section">
                        <h2>Report Details</h2>
                        ${Object.entries(customizedReportData).filter(([key]) => !['Title', 'Source File', 'Comparison File', 'Source Hash', 'Comparison Hash', 'Result'].includes(key)).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`).join('')}
                    </div>
                    <div class="section">
                        <h2>Source File</h2>
                        ${detailsToHtml(sourceFile)}
                    </div>
                    ${targetFile ? `<div class="section"><h2>Comparison File</h2>${detailsToHtml(targetFile)}</div>` : ''}
                    <div class="section">
                        <h2>Comparison Results</h2>
                        <p><strong>Source Hash:</strong><div class="hash">${report.sourceHash}</div></p>
                        <p><strong>Comparison Hash:</strong><div class="hash">${report.targetHash}</div></p>
                        <p><strong>Result:</strong> <span class="result ${report.match ? 'match' : 'mismatch'}">${report.Result}</span></p>
                    </div>
                </div>
            </body>
            </html>`;
        };

        for (const format of options.formats) {
            switch (format) {
                case 'TXT':
                    const reportString = Object.entries(customizedReportData)
                        .map(([key, value]) => `${key}:\n${value.toString().split('\n').map((l: string) => `  ${l}`).join('\n')}`)
                        .join('\n\n');
                    generateFile(reportString, 'text/plain;charset=utf-8', 'txt');
                    break;

                case 'JSON':
                    const jsonData = {
                        reportMetadata: {
                            "Report ID": report["Report ID"],
                            Generated: report.Generated,
                            Title: options.reportTitle || report.Title,
                            ...(options.purposeNotes && { "Purpose/Notes": options.purposeNotes }),
                            ...(options.verifiedBy && { "Verified By": options.verifiedBy }),
                            ...(options.organization && { "Organization": options.organization }),
                        },
                        comparisonDetails: {
                            Algorithm: report.Algorithm,
                            "Source Hash": report.sourceHash,
                            "Comparison Hash": report.targetHash,
                            Result: report.Result,
                            Match: report.match,
                        },
                        sourceFile: sourceFile,
                        ...(targetFile && { comparisonFile: targetFile }),
                    };
                    generateFile(JSON.stringify(jsonData, null, 2), 'application/json', 'json');
                    break;
                
                case 'CSV':
                     const headers = [
                        'Report ID', 'Generated', 'Title', 'Purpose/Notes', 'Verified By', 'Organization',
                        'Algorithm', 'Result', 'Source File Name', 'Source File Size', 'Source File Type',
                        'Source Hash', 'Comparison Identifier', 'Comparison File Name', 'Comparison File Size',
                        'Comparison File Type', 'Comparison Hash'
                    ];

                    const escapeCsvCell = (cellData: any): string => {
                        const stringified = String(cellData ?? '');
                        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
                            return `"${stringified.replace(/"/g, '""')}"`;
                        }
                        return stringified;
                    };
                    
                    const row = [
                        report["Report ID"],
                        report.Generated,
                        options.reportTitle || report.Title,
                        options.purposeNotes || '',
                        options.verifiedBy || '',
                        options.organization || '',
                        report.Algorithm,
                        report.Result,
                        sourceFile.name,
                        sourceFile.size,
                        sourceFile.type,
                        report.sourceHash,
                        report.targetIdentifier,
                        targetFile?.name || 'N/A',
                        targetFile?.size || 'N/A',
                        targetFile?.type || 'N/A',
                        report.targetHash
                    ].map(escapeCsvCell);

                    const csvContent = [headers.join(','), row.join(',')].join('\n');
                    generateFile(csvContent, 'text/csv;charset=utf-8;', 'csv');
                    break;

                case 'HTML':
                    generateFile(generateHtmlContent(), 'text/html;charset=utf-8', 'html');
                    break;

                case 'PDF':
                    const reportContainer = document.createElement('div');
                    reportContainer.style.position = 'absolute';
                    reportContainer.style.left = '-9999px';
                    reportContainer.innerHTML = generateHtmlContent();
                    document.body.appendChild(reportContainer);

                    const content = reportContainer.querySelector('#report-content');
                    if (content) {
                        try {
                            const canvas = await html2canvas(content as HTMLElement, { scale: 2, backgroundColor: '#1e293b' });
                            const imgData = canvas.toDataURL('image/png');
                            const pdf = new jspdf.jsPDF({
                                orientation: 'p',
                                unit: 'px',
                                format: [canvas.width, canvas.height]
                            });
                            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                            pdf.save(`file-hash-report-${report["Report ID"]}.pdf`);
                        } catch (e) {
                            console.error("PDF generation failed:", e);
                            alert("Failed to generate PDF report.");
                        }
                    }
                    document.body.removeChild(reportContainer);
                    break;
            }
        }
    };

    return {
        mode, setMode,
        algorithm, setAlgorithm: handleAlgorithmChange,
        file1, setFile1: handleFile1Change,
        file2, setFile2: handleFile2Change,
        targetHash, setTargetHash: handleTargetHashChange,
        isLoading,
        error,
        report,
        handleCompare,
        handleReset,
        handleGenerateAndDownloadReport,
        formatFileSize
    };
};
