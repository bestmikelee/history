'use strict';
const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const errors = require('./errors');
const reference = require('./reference');

async function login({ username, password, raw }) {
    const j = request.jar();
    const loginOptions = {
        url: reference.LOGIN_URL,
        followRedirect: false,
        jar: j,
        formData: {
            'dummy::login_form': '1',
            'form::login_form': 'login_form',
            xurl: 'http://www.cbssports.com/?',
            master_product: '150',
            vendor: 'cbssports',
            form_location: 'log_in_page',
            userid: username,
            password: password,
            _submit: 'Sign In'
        }
    };
    const res = await request.postAsync(loginOptions);

    const firstCookieString = j.getCookieString(loginOptions.url);

    if (firstCookieString.indexOf('pid=') === -1) {
        return errors.unauthorized();
    }
    const secondJar = request.jar();
    const redirectOptions = {
        url: reference.ROOT_URL + res.headers.location,
        jar: secondJar,
        headers: {
            Cookie: firstCookieString
        }
    };
    const cookieStringReq = await request.getAsync(redirectOptions);
    if (raw) {
        return {
            initial: res,
            redirect: cookieStringReq
        };
    }
    const secondCookieString = secondJar.getCookieString(redirectOptions.url);
    const combinedCookies = firstCookieString + secondCookieString;
    console.log(combinedCookies);
    return combinedCookies;
}

module.exports.login = login;
