'use strict';
const request = require('request');
const config = require('../../config.json');
const env = config.env;
const baseUrl = config[env].baseUrl;

module.exports.getLeagues = ({ access_token }) => {
    return new Promise((resolve, reject) => {
        const yahooRequest = request.defaults({
            protocol: 'http:',
            qs: { access_token }
        });
        yahooRequest.get(
            `${baseUrl}/api/yahoo/leagues`,
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

module.exports.getRosters = ({ access_token, teamId, ffLeagueId, force }) => {
    return new Promise((resolve, reject) => {
        const yahooRequest = request.defaults({
            protocol: 'http:',
            qs: { access_token, force, ffLeagueId }
        });
        yahooRequest.get(
            `${baseUrl}/api/yahoo/league/${teamId}/teams`,
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
