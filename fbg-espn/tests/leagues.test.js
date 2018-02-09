'use strict';

const swid = '';
const leagues = require('../lib/leagues');
const errors = require('../lib/errors');

test('able to get leagues', async () => {
    const grabbedLeagues = await leagues.getLeagues({
        swid
    });
    expect(grabbedLeagues).toBeDefined();
});
