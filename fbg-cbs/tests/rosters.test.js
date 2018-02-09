'use strict';
const cookieString =
    'tpid=H:ZJ2vRV8E4WtpDurSH8dMc2w6wvGOkGgB%252FILvqGaOfRY%253D:1; pid=L:42:uM%252FrrHBNG%252BFqeEGzWkFqAA%253D%253D:1; ppid=22bd6c7e6d15bab6fc3a6e1ec67282d5; anon=FALSE; SportsLine=lname&Lee&userid&mikelee1111&fname&Michael; fly_device=desktop; fly_geo={"countryCode": "us"}';
const leagueId = 'sackoverflow';

const cookieString2 =
    'tpid=P:E%252Fwldzp2nefImsiQghp23IBcGXLjyvwPzF1DA4c6Xh4%253D:1; pid=L:235:Yxrya1yTw2pJKwnb6QiCfw%253D%253D:1; ppid=e69aa333a0e2eeb4777d828f8f921590; anon=FALSE; SessionID=-4021500692640963639; SportsLine=lname&hoover&userid&panamajack&fname&dwayne; fly_device=desktop; fly_geo={"countryCode": "us"}';
const leagueId2 = 'laguna';
const rosters = require('../lib/rosters');
const errors = require('../lib/errors');

test('able to get rosters', async () => {
    const grabbedRosters = await rosters.get({
        cookieString,
        leagueId
    });
    expect(grabbedRosters).toBeDefined();
});

test('able to get rosters', async () => {
    const grabbedRosters = await rosters.get({
        cookieString: cookieString2,
        leagueId: leagueId2
    });
    expect(grabbedRosters).toBeDefined();
});
