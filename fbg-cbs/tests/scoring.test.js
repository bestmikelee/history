'use strict';

const settings = require('../lib/settings');
const index = require('../index.js');
const cookieString =
    'tpid=H:ZJ2vRV8E4WtpDurSH8dMc2w6wvGOkGgB%252FILvqGaOfRY%253D:1; pid=L:42:uM%252FrrHBNG%252BFqeEGzWkFqAA%253D%253D:1; ppid=22bd6c7e6d15bab6fc3a6e1ec67282d5; anon=FALSE; SportsLine=lname&Lee&userid&mikelee1111&fname&Michael; fly_device=desktop; fly_geo={"countryCode": "us"}';
const leagueId = 'sackoverflow';

const leagueObj = {
    id: 'sackoverflow'
};
// test('able to assign get scoring settings', async () => {
//     let leagueSettings = await settings.getLeagueSettings({
//         leagueObj,
//         cookieString
//     });
//     expect(leagueSettings.scoring).toBeDefined();
// });

test('able to assign get scoring settings', async () => {
    let leagueSettings = await index.getScoring({
        leagueObj: {
            id: 'laguna'
        },
        username: 'panamajack',
        password: '8Finedays!'
    });
    console.log(leagueSettings.scoring);
    expect(leagueSettings.scoring).toBeDefined();
});
