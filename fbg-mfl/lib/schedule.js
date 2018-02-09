'use strict';

const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const _ = require('lodash');
const url = require('url');
const ref = require('./reference');
const errors = require('./errors');
const helper = require('./helper');
const auth = require('./auth');

async function getCurrentAndLastWeeksLineups(leagueId, cookieString) {
    const weekNum = helper.getWeekNumber();
    const currentAndLastWeekPaths = [
        ref.getWeeklyLineupUrl(leagueId, weekNum),
        ref.getWeeklyLineupUrl(leagueId, weekNum - 1)
    ];
    return Promise.all(
        currentAndLastWeekPaths.map(async weekPath => {
            const response = await auth.authRequestPromise(
                weekPath,
                cookieString
            );
            return response.weeklyResults;
        })
    );
}

async function getWeeklyMatchup({ leagueId, weekNum, cookieString }) {
    const weekUrl = ref.getWeeklyLineupUrl(leagueId, weekNum);
    const result = await auth.authRequestPromise(weekUrl, cookieString);
    return result.weeklyResults;
}

/**
 * Step 2 after getWeeklyMatchup
 * TODO: filter for regularSeason or postSeason
 * @param {object} weeklyResult 
 * @returns {object} matchupObj
 */
function processWeeklyResult(weeklyResult) {
    const matchups = weeklyResult.matchup;
    const weekNum = Number(weeklyResult.week);
    const weekObj = {
        weekNum
    };
    matchups.forEach(matchup => {
        const franchise = matchup.franchise;
        const regularSeason = matchup.regularSeason;
        weekObj.regularSeason = weekObj.regularSeason
            ? weekObj.regularSeason
            : regularSeason;
        if (franchise.length > 1) {
            weekObj[franchise[0].id] = {
                opp: franchise[1].id,
                starters: franchise[0].starters,
                BN: franchise[0].nonstarters
            };
            weekObj[franchise[1].id] = {
                opp: franchise[0].id,
                starters: franchise[1].starters,
                BN: franchise[1].nonstarters
            };
        }
        if (franchise.length === 1) {
            weekObj[franchise[0].id] = {
                opp: false,
                starters: franchise[0].starters,
                BN: franchise[0].nonstarters
            };
        }
    });
    return weekObj;
}

function ownerSchedule(processedWeeks, ownerId) {
    const ownerObj = {
        opponents: []
    };
    processedWeeks.forEach(weekData => {
        const ownerWeek = weekData[ownerId];
        // order of opponents in an array
        ownerObj.opponents[weekData.weekNum - 1] = ownerWeek.opp;
        ownerObj[weekData.weekNum] = ownerWeek;
    });
    return ownerObj;
}

async function getSeasonSchedule({ leagueId, cookieString, weeks }) {
    const weeklyMatchups = [];
    for (let i = 0; i < weeks; i++) {
        let weeklyResult = getWeeklyMatchup({
            leagueId,
            weekNum: i + 1,
            cookieString
        });
        weeklyMatchups.push(weeklyResult);
    }
    return Promise.all(weeklyMatchups);
}

module.exports.ownerSchedule = ownerSchedule;
module.exports.processWeeklyResult = processWeeklyResult;
module.exports.getSeasonSchedule = getSeasonSchedule;
module.exports.getWeeklyMatchup = getWeeklyMatchup;
module.exports.getCurrentAndLastWeeksLineups = getCurrentAndLastWeeksLineups;
