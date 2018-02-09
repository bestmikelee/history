'use strict';

const cookieString = '';
const leagues = require('../lib/leagues');
const errors = require('../lib/errors');

test('able to get leagues', async () => {
    const grabbedLeagues = await leagues.get({
        cookieString
    });
    expect(grabbedLeagues.length).toBe(2);
});

test('able to get leagues', async () => {
    const grabbedLeagues = await leagues.get({
        username: '',
        password: ''
    });
    expect(grabbedLeagues).toBeDefined();
});
