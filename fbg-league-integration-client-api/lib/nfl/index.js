'use strict';
const request = require('request');
const config = require('../../config.json');
const env = config.env;
const baseUrl = config[env].baseUrl;

module.exports.getLeagues = ({ username, password, access_token }) => {
    const postData = {
        username,
        password
    };
    const requestPost = request.defaults({
        protocol: 'http:',
        headers: {
            'Content-Type': 'application/json'
        },
        qs: { access_token },
        body: JSON.stringify(postData)
    });
    return new Promise((resolve, reject) => {
        requestPost.post(
            `${baseUrl}/api/nfl/leagues`,
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

module.exports.getRosters = ({
    username,
    password,
    leagueId,
    teamId,
    access_token,
    force,
    ffLeagueId
}) => {
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
        qs: { access_token },
        body: JSON.stringify(postData)
    });
    return new Promise((resolve, reject) => {
        requestPost.post(
            `${baseUrl}/api/nfl/league/${leagueId}/${teamId}`,
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
