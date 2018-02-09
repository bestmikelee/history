'use strict';
// apparently s2 isn't needed???
const cookieObj = {
    swid: '{2E50B216-C627-4A91-A6CB-D276B4E240BC}',
    s2:
        'AEA3A%2Bw502vf5V1XRD8Rz%2FMWfWRLRvG%2FZuf5DJtEM1HM5AIvNewTgGeR6nOGZzcGSxzMaS8I4YBe2%2Bv60Ay3%2BDyARc6m46Xld3hu%2BYzHIpF8hoi1shdhy0IgUHNnMp671Xd9xi6yj8dTgG9gB8gXBp%2FV%2BgQ9Q9WQGtwOCAK7gS%2FuoOd%2FvoC%2B1P%2BxFQellaIv2koMcGwh1DNzSbeqNM1T9R%2FVwmjer2A1qb0vhJUwDkW2vdRPORom5l5F52316%2F9ycrDbMfAtnCQCE9UKSxUxr06q'
};
const leagueId = '984329';
const userId = '92456';
const ownerTeamId = '10';
const settings = require('../lib/settings');

test('able to get settings', async () => {
    const scoring = await settings.getLeagueSettings({
        leagueId,
        cookieObj
    });
    console.log(scoring);
    expect(scoring).toBeDefined();
});
