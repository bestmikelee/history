'use strict';
const cookieString = '';

const rosters = require('../lib/rosters');
const teamId = '';
const userId = '';
const leagueId = '';
let ownerObj;

test('able to assign team ownership', async () => {
    ownerObj = await rosters.getOwners({
        leagueId,
        ownerId: teamId,
        userId
    });
    expect(ownerObj).toHaveProperty('ownerDivision');
    expect(ownerObj).toHaveProperty('leagueRosters');
    expect(Object.keys(ownerObj.leagueRosters)).toContain(teamId);
    expect(ownerObj.leagueRosters[teamId].owner).toEqual(userId);
});

test('able to get rosters', async () => {
    const rosterObj = await rosters.getRosters({
        leagueId,
        ownerId: teamId,
        ownerDivision: ownerObj.ownerDivision,
        leagueRosters: ownerObj.leagueRosters,
        cookieString
    });
    console.log(rosterObj.lineups);
    expect(rosterObj).toHaveProperty('lineups');
    expect(rosterObj).toHaveProperty('orderedRosters');
    expect(Object.keys(rosterObj.orderedRosters)).toContain('0');
});
