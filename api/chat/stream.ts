
import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const sysInstruction = `You are a world-class FPL Scout. You translate complex data into beautiful, actionable Markdown scouting reports.

Personality:
- Insightful, professional, and slightly elite (like a premium sports analyst).
- Use real-time data from tools to back up every recommendation.
- Interpretation is key: explain WHAT the data means for the manager's rank.

Capabilities:
- You can fetch real-time FPL player stats and top performers via tools.
- You generate scouting reports, transfer advice, and captaincy analysis.

Reporting Format:
- Use H2 and H3 for sections.
- Use bolding for player names.
- Use tables for statistical comparisons.
- Keep it concise but dense with value.`;

export default async function handler(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: google('gemini-2.0-flash'), // Using 2.0-flash for best streaming speed
        system: sysInstruction,
        messages,
        tools: {
            get_player_stats: {
                description: 'Fetch detailed statistics for a specific FPL player.',
                inputSchema: z.object({
                    name: z.string().describe('The name of the player'),
                }),
                execute: async ({ name }: { name: string }) => {
                    const res = await fetch(`${new URL(req.url).origin}/api/data/players?name=${encodeURIComponent(name)}`);
                    return res.json();
                },
            },
            get_top_players: {
                description: 'Fetch top performing players by position.',
                inputSchema: z.object({
                    position: z.string().describe('GKP, DEF, MID, or FWD'),
                    limit: z.number().optional().default(5),
                }),
                execute: async ({ position, limit }: { position: string, limit: number }) => {
                    const res = await fetch(`${new URL(req.url).origin}/api/data/top-players?position=${position}&limit=${limit}`);
                    return res.json();
                },
            },
            get_fixtures: {
                description: 'Fetch upcoming fixtures for a specific FPL team.',
                inputSchema: z.object({
                    team: z.string().describe('Name of the team (e.g., Arsenal, Liverpool)'),
                }),
                execute: async ({ team }: { team: string }) => {
                    const res = await fetch(`${new URL(req.url).origin}/api/data/fixtures?team=${encodeURIComponent(team)}`);
                    return res.json();
                },
            },
        },
        onFinish: async ({ text, usage }) => {
            // Async persistence to Supabase
            try {
                const lastMessage = messages[messages.length - 1]; // This is the user message. Ideally we want AI response.
                // The 'text' argument is the AI response.
                await supabase.from('scouting_reports').insert({
                    tenant_id: '00000000-0000-0000-0000-000000000000',
                    prompt: lastMessage.content,
                    report_text: text,
                    metadata: {
                        source: 'vercel-ai-sdk-stream',
                        usage,
                        timestamp: new Date().toISOString()
                    }
                });
                console.log('[Stream] Report persisted to Supabase.');
            } catch (err) {
                console.error('[Stream] Persistence error:', err);
            }
        },
    });

    return result.toTextStreamResponse();
}
