'use strict';
const auth = require('./lib/auth');
const leagues = require('./lib/leagues');
const rosters = require('./lib/rosters');
const settings = require('./lib/settings');
const schedule = require('./lib/schedule');

async function getLeagues({ username, password, cookieString, raw }) {
    if (!cookieString) {
        cookieString = await auth.login({ username, password });
    }
    try {
        return await leagues.get({ cookieString, raw });
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function getRosters({ username, password, leagueId, cookieString, raw }) {
    if (!cookieString) {
        cookieString = await auth.login({ username, password });
        return await rosters.get({ leagueId, cookieString, raw });
    }
    return await rosters.get({ leagueId, cookieString, raw });
}

async function getScoring({
    username,
    password,
    leagueObj,
    cookieString,
    raw
}) {
    if (!cookieString) {
        cookieString = await auth.login({ username, password });
        return await settings.getLeagueSettings({
            leagueObj,
            cookieString,
            raw
        });
    }
    return await settings.getLeagueSettings({ leagueObj, cookieString, raw });
}

async function getSchedule({
    username,
    password,
    leagueObj,
    cookieString,
    raw
}) {
    if (!cookieString) {
        cookieString = await auth.login({ username, password });
        return await schedule.getSchedule({ leagueObj, cookieString, raw });
    }
    return await schedule.getSchedule({ leagueObj, cookieString, raw });
}

module.exports.getLeagues = getLeagues;
module.exports.getRosters = getRosters;
module.exports.getScoring = getScoring;
module.exports.getSchedule = getSchedule;
module.exports.login = auth.login;
