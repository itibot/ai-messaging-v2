
export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get('position');
    const limit = parseInt(searchParams.get('limit') || '5');

    try {
        const response = await fetch(`https://fantasy.premierleague.com/api/bootstrap-static/`);
        const data = await response.json();

        let players = data.elements;

        if (position) {
            const type = data.element_types.find((et: any) => et.singular_name_short === position);
            if (type) {
                players = players.filter((p: any) => p.element_type === type.id);
            }
        }

        const topPlayers = players
            .sort((a: any, b: any) => b.total_points - a.total_points)
            .slice(0, limit)
            .map((player: any) => ({
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
            }));

        return new Response(JSON.stringify(topPlayers), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch top players' }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
