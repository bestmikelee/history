'use strict';
const cookieString = '';

const settings = require('../lib/settings');
const leagueId = '';

test('able to assign get scoring settings', async () => {
    const responseBody = await settings.getScoring({
        leagueId,
        cookieString
    });
    expect(responseBody).toBeDefined();
});

test('get all scoring rules', async () => {
    const responseBody = await settings.getAllRules();
    expect(responseBody).toBeDefined();
});
