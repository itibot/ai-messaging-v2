
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
        // Official FPL API URL (requires proxying normally)
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

        // Map to our internal PlayerStats type
        const stats = {
            id: player.id,
            name: `${player.first_name} ${player.second_name}`,
            team: data.teams.find((t: any) => t.id === player.team).name,
            position: data.element_types.find((et: any) => et.id === player.element_type).singular_name_short,
            price: player.now_cost / 10,
            points: player.total_points,
            goals: player.goals_scored,
            assists: player.assists,
            cleanSheets: player.clean_sheets,
            ownership: `${player.selected_by_percent}%`,
            form: parseFloat(player.form),
            ictIndex: parseFloat(player.ict_index)
        };

        return new Response(JSON.stringify(stats), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch player stats' }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
