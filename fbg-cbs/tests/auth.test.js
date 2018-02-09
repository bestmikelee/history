'use strict';

const auth = require('../lib/auth');
const errors = require('../lib/errors');

test('login returns a cookieString', async () => {
    const cookieString = await auth.login({
        username: '',
        password: ''
    });
    console.log(cookieString);
    expect(cookieString).toBeDefined();
});

test('incorrect login throws error', async () => {
    try {
        await auth.login({
            username: '',
            password: 'wrongpassword'
        });
    } catch (e) {
        expect(e).toMatch('INCORRECT USERNAME OR PASSWORD');
    }
});
