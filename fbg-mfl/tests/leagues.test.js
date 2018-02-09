'use strict';
const cookieString = '';

const leagues = require('../lib/leagues');
const errors = require('../lib/errors');

test('able to get leagues', async () => {
    const allleagues = await leagues.getValidLeagues({
        cookieString
    });
    expect(allleagues).toBeDefined();
});
