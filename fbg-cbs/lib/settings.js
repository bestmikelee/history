'use strict';
const bluebird = require('bluebird');
const cheerio = require('cheerio');
const request = bluebird.promisifyAll(require('request'));
const url = require('url');
const reference = require('./reference');
const _ = require('lodash');
const moment = require('moment');
const scoringHelper = require('./scoring');

function formatTimeZone(tz) {
    if (tz.length === 2) {
        switch (tz[0]) {
            case 'E':
                return 'EST';
            case 'C':
                return 'CST';
            case 'M':
                return 'MST';
            case 'P':
                return 'PST';
            default:
                return tz;
        }
    }
    return tz;
}

function customizer(objValue, srcValue) {
    if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}

function getScoringRules(scoringRules, isIDP) {
    const formattedRules = scoringRules.map(ruleObj =>
        scoringHelper.interpretScoring(ruleObj)
    );
    const concatRules = formattedRules.reduce((ruleSet1, ruleSet2) =>
        _.mergeWith(ruleSet1, ruleSet2, customizer)
    );
    const spreadScoring = scoringHelper.spreadScoring(concatRules, isIDP);
    const transformed = scoringHelper.translateScoring(spreadScoring);
    return transformed;
}

function interpretRulesPage(body) {
    const leagueSettings = {};
    const $ = cheerio.load(body);
    $('.featureComponentContainer').each((i, el) => {
        const containerHeader = $(el)
            .children()
            .first()
            .text()
            .trim();
        const subheaderTextMap = reference.LEAGUE_HEADERS[containerHeader];
        if (subheaderTextMap) {
            leagueSettings[subheaderTextMap] = [];
            let header;
            $(el)
                .children()
                .last()
                .find('tr')
                .each((jj, rowElement) => {
                    if (
                        $(rowElement)
                            .attr('class')
                            .indexOf('row') === -1
                    ) {
                        header = $(rowElement)
                            .children()
                            .map((k, head) => $(head).text())
                            .get();
                    } else {
                        const row = $(rowElement)
                            .children()
                            .map((k, data) => {
                                if ($(data).children().length) {
                                    // TODO:
                                    // break up bonuses to array and
                                    // use regex to parse string to an object
                                    return $(data)
                                        .html()
                                        .split('<br>')
                                        .join('|');
                                }
                                return $(data).text();
                            })
                            .get();
                        const detailObj = {};
                        if (header.length < row.length) {
                            // EDGE CASE:
                            // bonus points don't use the same headers
                            header[0] = `bonus: ${header[0]
                                .toLowerCase()
                                .replace('special scoring for ', '')
                                .trim()}`;
                            header.push('description');
                            header.push('bonus');
                        }
                        row.forEach((data, ii) => {
                            if (
                                header[ii] === 'Offensive' ||
                                header[ii] === 'Defensive'
                            ) {
                                detailObj.positions = header[ii];
                                detailObj.stat = data;
                            } else {
                                detailObj[header[ii]] = data;
                            }
                        });
                        leagueSettings[subheaderTextMap].push(detailObj);
                    }
                });
            // TODO:
            // transform array to object for 'general' and
            // 'schedule' and use description as key
        }
    });
    return leagueSettings;
}

async function getDraftStatus({ teamObj, cookieString }) {
    console.log(teamObj);
    const leagueId = teamObj.id;
    const path = url.format({
        protocol: 'http',
        slashes: true,
        host: `${leagueId}${reference.LEAGUE_HOST}`
    });
    const j = request.jar();
    const options = {
        url: path,
        followAllRedirects: true,
        jar: j,
        headers: {
            Cookie: cookieString
        }
    };
    const refreshedCookie = await request
        .getAsync(options)
        .then(() => `${cookieString}; ${j.getCookieString(options.url)};`);

    const optionsRedirect = {
        url: `${options.url}${reference.LEAGUE_RULES_PATH}`,
        followAllRedirects: true,
        jar: j,
        headers: {
            Cookie: refreshedCookie
        }
    };
    const res = await request.getAsync(optionsRedirect);
    const leagueSettings = interpretRulesPage(res.body);
    teamObj.drafted = 1;
    teamObj.leagueSettings = leagueSettings;
    return Promise.resolve(teamObj);
}

async function getLeagueSettings({ leagueObj, cookieString, raw }) {
    const leagueId = leagueObj.id;
    const path = url.format({
        protocol: 'http',
        slashes: true,
        host: `${leagueId}${reference.LEAGUE_HOST}`
    });
    const j = request.jar();
    const options = {
        url: path,
        followAllRedirects: true,
        jar: j,
        headers: {
            Cookie: cookieString
        }
    };
    const refreshedCookie = await request
        .getAsync(options)
        .then(() => `${cookieString}; ${j.getCookieString(options.url)};`);

    const optionsRedirect = {
        url: `${options.url}${reference.LEAGUE_RULES_PATH}`,
        followAllRedirects: true,
        jar: j,
        headers: {
            Cookie: refreshedCookie
        }
    };
    const res = await request.getAsync(optionsRedirect);
    if (raw) {
        return res;
    }
    const leagueSettings = interpretRulesPage(res.body);
    const rosterPositions = leagueSettings.roster
        .filter(rosterLimitObj => rosterLimitObj.Position)
        .map(filteredRosterObjs => filteredRosterObjs.Position);
    const isIDP = rosterPositions.indexOf('DST') > -1;
    leagueObj.scoring = getScoringRules(leagueSettings.scoring, isIDP);
    leagueObj.drafted = 1;
    leagueObj.leagueSettings = leagueSettings;

    return Promise.resolve(leagueObj);
}

module.exports.getLeagueSettings = getLeagueSettings;
module.exports.getDraftStatus = getDraftStatus;
