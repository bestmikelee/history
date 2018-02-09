'use strict';
const _ = require('lodash');
const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));

const positionDictionary = [
    ['STARTER', 'STARTERS'],
    ['WR'],
    ['FLEX'],
    ['BN', 'BENCH', 'IR'],
    ['DST', 'TD', 'D/ST'],
    ['QB'],
    ['RB'],
    ['C'],
    ['HC', 'COACH'],
    ['K', 'PK'],
    ['DEF', 'D'],
    ['DB', 'S', 'CB'],
    ['DL', 'DE', 'DT', 'NT', 'ST'],
    ['G'],
    ['LB', 'ILB', 'OLB'],
    ['OFF'],
    ['P', 'PN'],
    ['T'],
    ['TE'],
    ['TMDB'],
    ['TMDL'],
    ['TMLB'],
    ['TMPK'],
    ['TMPN'],
    ['TMQB'],
    ['TMRB'],
    ['TMTE'],
    ['TMWR'],
    ['TQB']
];

module.exports.relevantPositions = [
    'qb',
    'rb',
    'wr',
    'te',
    'td',
    'pk',
    'de',
    'dt',
    'ilb',
    'olb',
    'cb',
    's'
];

module.exports.millisecondsTimesDays = days => {
    if (typeof days !== 'number') {
        throw new TypeError();
    }
    return 86400000 * days;
};

module.exports.getWeekNumber = () => {
    const today = new Date();
    const seasonStart = new Date('September 5 2017');
    const days = Math.floor((today - seasonStart) / 86400000);
    const weekNum = Math.floor(days / 7) + 1;
    return weekNum;
};

module.exports.getRange = stat => {
    const rangeArr = stat.match(/([0-9]+\s?-\s?[0-9]+)/)[0].split('-');
    return {
        range_min: rangeArr[0],
        range_max: rangeArr[1]
    };
};
module.exports.getInsideParens = stat => {
    let insideParens;
    try {
        insideParens = stat.match(/(\([A-Z0-9]+\))/)[0].slice(1, -1);
    } catch (e) {
        insideParens = undefined;
    }
    return insideParens;
};

module.exports.getFirstNum = stat => {
    let firstNum;
    try {
        firstNum = stat.match(/[0-9]+/)[0];
    } catch (e) {
        firstNum = undefined;
    }
    return firstNum;
};

module.exports.getLeagueYear = () => {
    const tempDate = new Date();
    const cutoffDate = Date.parse(`May 1 ${tempDate.getFullYear()}`);
    const currentDate = Date.now();
    const searchYear =
        currentDate > cutoffDate
            ? tempDate.getFullYear().toString()
            : (tempDate.getFullYear - 1).toString();
    return searchYear;
};

function normalizePosition(pos) {
    const capPos = pos.toUpperCase();
    for (let i = 0; i < positionDictionary.length; i++) {
        if (positionDictionary[i].indexOf(capPos) > -1) {
            return positionDictionary[i][0];
        }
    }
    return capPos;
}

function defineStarter(pos) {
    const capPos = pos.toUpperCase();
    for (let i = 0; i < positionDictionary.length; i++) {
        if (positionDictionary[i].indexOf(capPos) > -1) {
            if (positionDictionary[i][0] !== 'BN') {
                return 'STARTER';
            }
            return 'BN';
        }
    }
    return 'STARTER';
}

module.exports.countPlayerPools = players => {
    const countObj = {};
    players.forEach(player => {
        countObj[player] = countObj[player] ? ++countObj[player] : 1;
    });
    const maxCount = _.max(_.values(countObj));
    return maxCount;
};

module.exports.duplicatePlayers = players => {
    const countObj = {};
    const duplicatePlayers = new Set();
    players.forEach(player => {
        countObj[player] = countObj[player] ? ++countObj[player] : 1;
        if (countObj[player] > 1) {
            duplicatePlayers.add(player);
        }
    });
    return duplicatePlayers;
};

module.exports.allPlayersFromLeagueRosters = leagueRosters =>
    _.flatten(_.values(leagueRosters).map(team => team.roster));

module.exports.indexWeeklyLineup = lineups => {
    if (lineups[0].franchise) {
        return {
            prev:
                lineups[0].week > lineups[1].week
                    ? lineups[1].franchise
                    : lineups[0].franchise,
            curr:
                lineups[0].week > lineups[1].week
                    ? lineups[0].franchise
                    : lineups[1].franchise
        };
    }
    if (lineups[0].matchup) {
        return {
            prev:
                lineups[0].week > lineups[1].week
                    ? lineups[1].matchup
                    : lineups[0].matchup,
            curr:
                lineups[0].week > lineups[1].week
                    ? lineups[0].matchup
                    : lineups[1].matchup
        };
    }
};

module.exports.indexFranchises = lineupObj => {
    const lineups = {};
    try {
        lineupObj.curr.forEach(matchup => {
            // console.log(matchup.franchise);
            // matchup.franchise = matchup.franchise.filter(team => team.starters);

            matchup.franchise.forEach(franchise => {
                if (franchise) {
                    lineups[franchise.id] = {
                        starters: franchise.starters
                            ? franchise.starters.slice(0, -1).split(',')
                            : [],
                        BN: franchise.nonstarters
                            ? franchise.nonstarters.slice(0, -1).split(',')
                            : []
                    };
                }
            });
        });
        lineupObj.prev.forEach(matchup => {
            matchup.franchise = matchup.franchise.filter(team => team.starters);
            matchup.franchise.forEach(franchise => {
                if (
                    franchise &&
                    lineups[franchise.id] &&
                    !lineups[franchise.id].starters.length
                ) {
                    console.log(lineups[franchise.id]);
                    lineups[franchise.id] = {
                        starters: franchise.starters
                            ? franchise.starters.slice(0, -1).split(',')
                            : [],
                        BN: franchise.nonstarters
                            ? franchise.nonstarters.slice(0, -1).split(',')
                            : []
                    };
                }
            });
        });
    } catch (e) {
        console.log(e);
    }
    return lineups;
};

async function authRequest(requestUrl, cookieString) {
    const response = await request.getAsync({
        url: requestUrl,
        headers: {
            Cookie: cookieString
        }
    });
    return JSON.parse(response.body);
}

module.exports.authRequest = authRequest;
