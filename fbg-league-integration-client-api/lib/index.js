'use strict';
const request = require('request');
const config = require('../config.json');
const env = config.env;
const baseUrl = config[env].baseUrl;

module.exports.getLeagues = (host, { username, password, access_token }) => {
    const postData = {
        username,
        password
    };
    const requestPost = request.defaults({
        protocol: 'http:',
        headers: {
            'Content-Type': 'application/json'
        },
        qs: {
            access_token
        },
        body: JSON.stringify(postData)
    });
    return new Promise((resolve, reject) => {
        requestPost.post(
            `${baseUrl}/api/${host}/leagues`,
            (err, httpResponse, body) => {
                let respBody = {};
                if (err) {
                    respBody.errorMsg = err.message;
                    reject(respBody);
                } else if (httpResponse.statusCode === 417) {
                    respBody = JSON.parse(body);
                    respBody.errorMsg = 417;
                    reject(respBody);
                } else if (
                    httpResponse.statusCode.toString()[0] !== '2' &&
                    httpResponse.statusCode.toString()[0] !== '3'
                ) {
                    respBody = {};
                    respBody.errorMsg = httpResponse.statusCode;
                    reject(respBody);
                } else {
                    respBody = JSON.parse(body);
                    resolve(respBody);
                }
            }
        );
    });
};

module.exports.getRosters = (
    host,
    { username, password, force, leagueId, ffLeagueId, access_token }
) => {
    const postData = {
        username,
        password,
        force,
        ffLeagueId
    };
    const requestPost = request.defaults({
        protocol: 'http:',
        headers: {
            'Content-Type': 'application/json'
        },
        qs: {
            access_token
        },
        body: JSON.stringify(postData)
    });
    return new Promise((resolve, reject) => {
        requestPost.post(
            `${baseUrl}/api/${host}/league/${leagueId}/teams`,
            (err, httpResponse, body) => {
                let respBody = {};
                if (err) {
                    respBody.errorMsg = err.message;
                    reject(respBody);
                } else if (httpResponse.statusCode === 417) {
                    respBody = JSON.parse(body);
                    respBody.errorMsg = 417;
                    reject(respBody);
                } else if (
                    httpResponse.statusCode.toString()[0] !== '2' &&
                    httpResponse.statusCode.toString()[0] !== '3'
                ) {
                    respBody = {};
                    respBody.errorMsg = httpResponse.statusCode;
                    reject(respBody);
                } else {
                    respBody = JSON.parse(body);
                    resolve(respBody);
                }
            }
        );
    });
};

module.exports.unlink = ({ host, ffLeagueId, leagueId, access_token }) => {
    const postData = {
        host,
        ffLeagueId,
        leagueId
    };
    const requestPost = request.defaults({
        protocol: 'http:',
        headers: {
            'Content-Type': 'application/json'
        },
        qs: {
            access_token
        },
        body: JSON.stringify(postData)
    });
    return new Promise((resolve, reject) => {
        requestPost.post(
            `${baseUrl}/v2/provider/unlink`,
            (err, httpResponse, body) => {
                let respBody = {};
                if (err) {
                    respBody.errorMsg = err.message;
                    reject(respBody);
                } else if (httpResponse.statusCode === 417) {
                    respBody = JSON.parse(body);
                    respBody.errorMsg = 417;
                    reject(respBody);
                } else if (
                    httpResponse.statusCode.toString()[0] !== '2' &&
                    httpResponse.statusCode.toString()[0] !== '3'
                ) {
                    respBody = {};
                    respBody.errorMsg = httpResponse.statusCode;
                    reject(respBody);
                } else {
                    resolve(respBody);
                }
            }
        );
    });
};

module.exports.logout = ({ host, username, access_token }) => {
    const postData = {
        host,
        username
    };
    const requestPost = request.defaults({
        protocol: 'http:',
        headers: {
            'Content-Type': 'application/json'
        },
        qs: {
            access_token
        },
        body: JSON.stringify(postData)
    });
    return new Promise((resolve, reject) => {
        requestPost.post(
            `${baseUrl}/v2/provider/logout`,
            (err, httpResponse, body) => {
                let respBody = {};
                if (err) {
                    respBody.errorMsg = err.message;
                    reject(respBody);
                } else if (httpResponse.statusCode === 417) {
                    respBody = JSON.parse(body);
                    respBody.errorMsg = 417;
                    reject(respBody);
                } else if (
                    httpResponse.statusCode.toString()[0] !== '2' &&
                    httpResponse.statusCode.toString()[0] !== '3'
                ) {
                    respBody = {};
                    respBody.errorMsg = httpResponse.statusCode;
                    reject(respBody);
                } else {
                    resolve(respBody);
                }
            }
        );
    });
};
