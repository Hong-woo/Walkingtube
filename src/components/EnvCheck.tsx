'use client';

import React, { useEffect, useState } from 'react';

export default function EnvCheck() {
    const [missing, setMissing] = useState<string[]>([]);

    useEffect(() => {
        const missingVars = [];
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
        if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
        if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) missingVars.push('NEXT_PUBLIC_MAPBOX_TOKEN');

        if (missingVars.length > 0) {
            setMissing(missingVars);
            console.error('Missing Environment Variables:', missingVars);
        }
    }, []);

    if (missing.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 text-white p-4">
            <div className="bg-red-900/90 p-6 rounded-lg max-w-lg w-full border border-red-500">
                <h2 className="text-xl font-bold mb-4 text-red-100">Configuration Error</h2>
                <p className="mb-4">The following environment variables are missing in your Vercel deployment:</p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-sm bg-black/30 p-4 rounded mb-4">
                    {missing.map((v) => (
                        <li key={v} className="text-red-300">{v}</li>
                    ))}
                </ul>
                <p className="text-sm text-gray-300">
                    Please verify that you have added these to your <strong>Vercel Project Settings &gt; Environment Variables</strong>.
                </p>
            </div>
        </div>
    );
}
