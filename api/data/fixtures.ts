
export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const { searchParams } = new URL(req.url);
    const teamName = searchParams.get('team');

    try {
        const response = await fetch(`https://fantasy.premierleague.com/api/bootstrap-static/`);
        const data = await response.json();

        const team = data.teams.find((t: any) => t.name.toLowerCase().includes(teamName?.toLowerCase() || ''));

        if (!team) {
            return new Response(JSON.stringify({ error: 'Team not found' }), {
                status: 404,
                headers: { 'content-type': 'application/json' },
            });
        }

        const fixturesResponse = await fetch(`https://fantasy.premierleague.com/api/fixtures/`);
        const allFixtures = await fixturesResponse.json();

        const teamFixtures = allFixtures
            .filter((f: any) => f.team_h === team.id || f.team_a === team.id)
            .filter((f: any) => !f.finished)
            .slice(0, 5)
            .map((f: any) => {
                const isHome = f.team_h === team.id;
                const opponentId = isHome ? f.team_a : f.team_h;
                const opponent = data.teams.find((t: any) => t.id === opponentId).name;

                return {
                    gameweek: f.event,
                    opponent,
                    difficulty: isHome ? f.team_h_difficulty : f.team_a_difficulty,
                    isHome
                };
            });

        return new Response(JSON.stringify(teamFixtures), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch fixtures' }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
