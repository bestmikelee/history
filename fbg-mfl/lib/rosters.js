'use strict';

const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const _ = require('lodash');
const url = require('url');
const ref = require('./reference');
const errors = require('./errors');
const helper = require('./helper');
const schedule = require('./schedule');

async function determineWeeklyLineups(leagueId, cookieString) {
    const lineupResults = await schedule.getCurrentAndLastWeeksLineups(
        leagueId,
        cookieString
    );
    const lineupObj = helper.indexWeeklyLineup(lineupResults);
    return helper.indexFranchises(lineupObj);
}

async function getOwners({ leagueId, ownerId, userId }) {
    // const weekNum = common.getWeekNumber();
    const conferenceDictionary = {};
    const leagueRosters = {};
    let body;
    let ownerDivision;

    const urlPath = ref.createRequest('league', leagueId);
    const res = await request.getAsync(urlPath);

    try {
        body = JSON.parse(res.body).league;
    } catch (e) {
        return errors.generic();
    }

    if (body.divisions && body.divisions.division) {
        body.divisions.division.forEach(division => {
            conferenceDictionary[division.id] = division.conference;
        });
    }
    body.franchises.franchise.forEach(team => {
        leagueRosters[team.id] = {
            id: team.id,
            owner: ownerId === team.id ? userId : '',
            name: team.name,
            division: conferenceDictionary[team.division] || team.division
        };
        if (ownerId === team.id) {
            ownerDivision =
                conferenceDictionary[team.division] || team.division;
        }
    });
    return {
        ownerDivision,
        leagueRosters
    };
}

async function getRosters({
    leagueId,
    ownerDivision,
    leagueRosters,
    cookieString
}) {
    const urlPath = ref.createRequest('rosters', leagueId);
    const response = await request.getAsync(urlPath);
    const orderedRosters = {};
    let body;
    let draftedBool = false;
    try {
        body = JSON.parse(response.body);
    } catch (e) {
        console.log(response.body, e);
        if (response.body.indexOf('404') > -1) {
            return errors.unavailable();
        }
    }
    body.rosters.franchise.forEach(team => {
        if (Array.isArray(team.player)) {
            leagueRosters[team.id].roster = team.player.map(spot => spot.id);
            draftedBool = true;
        } else if (typeof team.player === 'object') {
            leagueRosters[team.id].roster = [team.player.id];
            draftedBool = true;
        } else {
            leagueRosters[team.id].roster = [];
        }
    });
    if (!draftedBool) {
        return errors.undrafted();
    }
    let count = 0;
    const allPlayers = helper.allPlayersFromLeagueRosters(leagueRosters);
    const playerPools = helper.duplicatePlayers(allPlayers);

    if (playerPools.size > 0 && playerPools.size < 20) {
        // console.log(
        //     'MULTIPLE PLAYER POOLS',
        //     common.translatePlayerIds([...playerPools], 'mfl')
        // );
    }
    if (playerPools.size > 15) {
        // apply division separation
        // TODO: if playerPool > division need to inspect further
        Object.keys(leagueRosters)
            .sort()
            .forEach(teamId => {
                if (leagueRosters[teamId].division === ownerDivision) {
                    orderedRosters[count] = leagueRosters[teamId];
                    leagueRosters[teamId].divIndex = count;
                    count += 1;
                }
            });
    } else {
        Object.keys(leagueRosters)
            .sort()
            .forEach(teamId => {
                orderedRosters[count] = leagueRosters[teamId];
                leagueRosters[teamId].divIndex = count;
                count += 1;
            });
    }
    const lineups = await determineWeeklyLineups(leagueId, cookieString);
    return {
        lineups,
        leagueRosters,
        orderedRosters
    };
}

module.exports.getRosters = getRosters;
module.exports.getOwners = getOwners;
