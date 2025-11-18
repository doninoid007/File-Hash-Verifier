export enum ComparisonMode {
    FileVsFile = 'fileVsFile',
    FileVsHash = 'fileVsHash',
}

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export interface ExifData {
    [key: string]: any;
}

export interface FileDetails {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    exif?: ExifData | null;
}

export interface Report {
    "Report ID": string;
    "Generated": string;
    "Title": string;
    "Algorithm": HashAlgorithm;
    sourceFile: FileDetails;
    targetFile?: FileDetails;
    sourceHash: string;
    targetHash: string;
    targetIdentifier: string;
    "Result": string;
    "match": boolean;
}

export type ReportFormat = 'PDF' | 'HTML' | 'TXT' | 'JSON' | 'CSV';

export interface ReportOptions {
    formats: ReportFormat[];
    reportTitle?: string;
    purposeNotes?: string;
    verifiedBy?: string;
    organization?: string;
}