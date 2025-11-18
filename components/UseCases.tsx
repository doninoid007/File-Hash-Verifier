import React from 'react';

export const UseCases: React.FC = () => {
    const cases = [
        { title: 'Download Verification', description: 'Check integrity of downloaded files against publisher checksums.' },
        { title: 'File Comparison', description: 'Ensure two files are identical bit-for-bit.' },
        { title: 'Security Audit', description: 'Verify critical files have not been unauthorizedly modified.' },
        { title: 'Digital Forensics', description: 'Generate hash values for evidence chain of custody.' },
        { title: 'Software Distribution', description: 'Verify installer and package integrity before deployment.' },
    ];

    return (
        <div className="mt-12">
            <h3 className="text-xl font-bold text-cyan-400 border-b border-slate-700 pb-2 mb-6">Common Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cases.map((item, index) => (
                    <div key={index} className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg hover:border-cyan-500/30 transition-colors shadow-lg shadow-slate-900/20">
                        <h4 className="font-semibold text-slate-200 mb-2">{item.title}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};