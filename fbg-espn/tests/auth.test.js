'use strict';

const auth = require('../lib/auth');
const errors = require('../lib/errors');

test('login returns a cookieObj', async () => {
    const cookieObj = await auth.login({
        username: '',
        password: ''
    });
    expect(cookieObj).toBeDefined();
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
