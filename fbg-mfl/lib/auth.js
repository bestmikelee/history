'use strict';

const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const ref = require('./reference');
const errors = require('./errors');

async function login({ username, password }) {
    const j = request.jar();
    const responseBody = await request.postAsync(ref.LOGIN_URL, {
        jar: j,
        followRedirect: false,
        form: {
            XML: 1,
            O: '02',
            URL: 'dash',
            USERNAME: username,
            PASSWORD: password
        }
    });
    const cookies = j.getCookies(ref.LOGIN_URL);
    let mflUserId;
    cookies.forEach(cookie => {
        if (cookie.key === 'MFL_USER_ID') {
            mflUserId = cookie.value;
        }
    });
    if (!mflUserId) {
        return errors.unauthorized();
    }
    return `MFL_USER_ID="${mflUserId}"`;
}

async function authRequestPromise(requestUrl, cookieString) {
    const response = await request.getAsync({
        url: requestUrl,
        headers: {
            Cookie: cookieString
        }
    });
    return JSON.parse(response.body);
}

module.exports.login = login;
module.exports.authRequestPromise = authRequestPromise;
