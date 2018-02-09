'use strict';
const schedule = require('../lib/schedule');
const cookieString =
    'tpid=P:E%252Fwldzp2nefImsiQghp23IBcGXLjyvwPzF1DA4c6Xh4%253D:1; pid=L:235:Yxrya1yTw2pJKwnb6QiCfw%253D%253D:1; ppid=e69aa333a0e2eeb4777d828f8f921590; anon=FALSE; SessionID=-4021500692640963639; SportsLine=lname&hoover&userid&panamajack&fname&dwayne; fly_device=desktop; fly_geo={"countryCode": "us"}';

const leagueObj = {
    id: 'laguna',
    teamId: '5'
};
test('able to obtain season schedule', async () => {
    let schedObj = await schedule.getSchedule({
        leagueObj,
        cookieString
    });
    console.log(schedObj);
    expect(schedObj).toBeDefined();
});
