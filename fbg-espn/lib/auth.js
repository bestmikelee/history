'use strict';
const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const errors = require('./errors');
const reference = require('./reference');

async function login({ username, password }) {
    const credentials = {
        loginValue: username,
        password: password
    };
    const loginOptions = {
        url: reference.LOGIN_URL,
        withCredentials: true,
        body: JSON.stringify(credentials),
        headers: {
            'Content-type': 'application/json'
        }
    };

    const res = await request.postAsync(loginOptions);
    const loginResponse = JSON.parse(res.body).data;
    if (loginResponse) {
        return {
            swid: loginResponse.token.swid,
            s2: loginResponse.s2,
            cookieShortString: `SWID=${loginResponse.token.swid}`
        };
    }
    return errors.unauthorized();
}

async function passAuthToSite({ leagueUrl, leagueId, cookieObj }) {
    const j = request.jar();
    const options = {
        url: leagueUrl + leagueId,
        followRedirect: false,
        jar: j,
        headers: {
            Cookie: `SWID=${cookieObj.swid}`
        }
    };

    const res = await request.getAsync(options);
    const cookieString =
        `SWID=${cookieObj.swid}; ` +
        `${res.headers['set-cookie']}; ` +
        `espn_s2=${cookieObj.s2}; ` +
        `espnAuth=${cookieObj.swid};`;

    const optionsRedirect = {
        url: leagueUrl + leagueId,
        followAllRedirects: true,
        jar: j,
        headers: {
            Cookie: cookieString
        }
    };
    const redirectResponse = await request.getAsync(optionsRedirect);
    return redirectResponse.body;
}

module.exports.login = login;
module.exports.passAuthToSite = passAuthToSite;
