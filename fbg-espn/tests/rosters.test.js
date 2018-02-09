'use strict';
// apparently s2 isn't needed???
const cookieObj = {};
const leagueId = '';
const userId = '';
const ownerTeamId = '10';
const rosters = require('../lib/rosters');

test('able to get rosters', async () => {
    const grabbedRosters = await rosters.getRosters({
        leagueId,
        ownerTeamId,
        userId,
        cookieObj
    });
    expect(grabbedRosters).toBeDefined();
});
