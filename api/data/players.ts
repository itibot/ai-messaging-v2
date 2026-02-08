
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    if (!name) {
        return new Response(JSON.stringify({ error: 'Player name is required' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
        });
    }

    try {
        // 1. Try to fetch from Supabase Cache first
        if (supabaseUrl && supabaseKey) {
            const searchTerm = `%${name}%`;
            const { data: cachedRows, error: dbError } = await supabase
                .from('player_cache')
                .select('data')
                .ilike('name', searchTerm)
                .limit(1);

            if (!dbError && cachedRows && cachedRows.length > 0) {
                console.log(`[Supabase] Cache Hit: ${name}`);
                return new Response(JSON.stringify(cachedRows[0].data), {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                });
            }
        }

        // 2. Fallback to Official FPL API
        console.log(`[API] Fetching live data for: ${name}`);
        const response = await fetch(`https://fantasy.premierleague.com/api/bootstrap-static/`);
        const data = await response.json();

        const player = data.elements.find((p: any) =>
            `${p.first_name} ${p.second_name}`.toLowerCase().includes(name.toLowerCase())
        );

        if (!player) {
            return new Response(JSON.stringify({ error: 'Player not found' }), {
                status: 404,
                headers: { 'content-type': 'application/json' },
            });
        }

        const team = data.teams.find((t: any) => t.id === player.team).name;
        const position = data.element_types.find((et: any) => et.id === player.element_type).singular_name_short;

        // Map to our internal PlayerStats type
        const stats = {
            id: player.id,
            name: `${player.first_name} ${player.second_name}`,
            team: team,
            position: position,
            price: player.now_cost / 10,
            points: player.total_points,
            goals: player.goals_scored,
            assists: player.assists,
            cleanSheets: player.clean_sheets,
            ownership: `${player.selected_by_percent}%`,
            form: parseFloat(player.form),
            ictIndex: parseFloat(player.ict_index)
        };

        // 3. Update Supabase Cache asynchronously
        if (supabaseUrl && supabaseKey) {
            supabase
                .from('player_cache')
                .upsert({
                    fpl_id: player.id,
                    name: stats.name,
                    team: team,
                    position: position,
                    data: stats,
                    last_updated: new Date().toISOString()
                }, { onConflict: 'fpl_id' })
                .then(({ error }) => {
                    if (error) console.warn('[Supabase] Failed to update cache:', error);
                });
        }

        return new Response(JSON.stringify(stats), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error: ' + error.message }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
