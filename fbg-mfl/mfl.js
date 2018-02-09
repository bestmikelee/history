'use strict';

const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const redis = require('redis');
const _ = require('lodash');
const url = require('url');
const qs = require('querystring');
const fs = require('fs');
const path = require('path');
const parseString = bluebird.promisifyAll(require('xml2js')).parseStringAsync;
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const util = require('../../util');
const log = require('../../util/log');
const common = util.common;
const provider = require('../../../db/RedisInterface/Provider');

function MFL({ userId, username, password, sessionData, ffLeagueId, nosave }) {
    this.leagueId = '';
    this.teams = [];
    this.leagueRosters = {};
    this.leagueSettings = {};
    this.userId = userId;
    this.username = username;
    this.password = password;
    this.cookieString = sessionData;
    this.ffLeagueId = ffLeagueId;
    this.nosave = nosave;
}

MFL.prototype.ROOT_URL = 'http://www03.myfantasyleague.com/';
MFL.prototype.LOGIN_URL = 'https://www03.myfantasyleague.com/2017/public';
MFL.prototype.DASHBOARD_URL = 'http://www54.myfantasyleague.com/2017/dash';
MFL.prototype.LEAGUES_API =
    'http://www03.myfantasyleague.com/2017/export?TYPE=myleagues';
MFL.prototype.LEAGUE_INFO_API =
    'http://www62.myfantasyleague.com/2017/export?TYPE=league&JSON=1&L=';
MFL.prototype.ROSTER_API =
    'http://www51.myfantasyleague.com/2017/export?TYPE=rosters&W=&JSON=1&L=';
MFL.prototype.DRAFT_RESULTS =
    'http://www50.myfantasyleague.com/2017/export?TYPE=draftResults&L=';

MFL.prototype.login = function mflLogin() {
    const self = this;
    const j = request.jar();
    self._request = request
        .postAsync(this.LOGIN_URL, {
            jar: j,
            followRedirect: false,
            form: {
                XML: 1,
                O: '02',
                URL: 'dash',
                USERNAME: self.username,
                PASSWORD: self.password
            }
        })
        .then(res =>
            parseString(res.body).then(() => {
                const cookies = j.getCookies(self.LOGIN_URL);
                let mflUserId;
                cookies.forEach(cookie => {
                    if (cookie.key === 'MFL_USER_ID') {
                        mflUserId = cookie.value;
                    }
                });
                if (!mflUserId) {
                    return Promise.reject();
                }
                self.cookieString = `MFL_USER_ID="${mflUserId}"`;
                return Promise.resolve(self);
            })
        )
        .catch(err => {
            console.log('MFL AUTH ERROR', err);
            if (self.nosave) {
                return Promise.reject({
                    licaError: 'User Credentials Failure',
                    licaCode: -1
                });
            }
            return provider.authError(self.userId, self.ffLeagueId).then(() =>
                Promise.reject({
                    licaError: 'User Credentials Failure',
                    licaCode: -1
                })
            );
        });

    return this;
};

function leagueHasDrafted({ league, cookieString }) {
    const dashOptions = {
        url: `http://www50.myfantasyleague.com/2017/export?TYPE=draftResults&L=${league.id}`,
        headers: {
            Cookie: cookieString
        }
    };
    return request.getAsync(dashOptions).then(res =>
        parseString(res.body)
            .then(result => {
                let nextPick;
                if (!result.draftResults.draftUnit) {
                    league.drafted = 0;
                    return Promise.resolve(league);
                }
                result.draftResults.draftUnit.forEach(pick => {
                    if (!pick.draftPick) {
                        league.notDrafted = true;
                    } else {
                        pick.draftPick.forEach(dpick => {
                            if (!dpick.$.timestamp) {
                                if (!nextPick) {
                                    nextPick = dpick.$;
                                }
                                league.notDrafted = true;
                            }
                        });
                    }
                });
                if (league.notDrafted) {
                    league.drafted = 0;
                } else {
                    league.drafted = 1;
                }
                delete league.notDrafted;
                return Promise.resolve(league);
            })
            .catch(err => {
                console.log(league.id, league.name, err);
                league.drafted = 0;
                return Promise.resolve(league);
            })
    );
}

MFL.prototype.getValidLeagues = function getValidLeagues() {
    this._request = this._request.then(self => {
        const dashOptions = {
            url: self.LEAGUES_API,
            headers: {
                Cookie: self.cookieString
            }
        };
        return request.getAsync(dashOptions).then(res =>
            parseString(res.body)
                .then(result => {
                    console.log(result.leagues.league);
                    if (!Array.isArray(result.leagues.league)) {
                        return Promise.resolve([]);
                    }
                    self.teams = result.leagues.league.map(league => {
                        const urlArray = url
                            .parse(league.$.url)
                            .pathname.split('/');
                        league.$.id = urlArray[urlArray.length - 1];
                        return league.$;
                    });

                    return Promise.all(
                        self.teams.map(league =>
                            request
                                .getAsync(self.LEAGUE_INFO_API + league.id)
                                .then(data => {
                                    let body;
                                    try {
                                        body = JSON.parse(data.body);
                                    } catch (e) {
                                        console.log(league.id, data.body);
                                    }
                                    if (body) {
                                        return Promise.resolve(
                                            _.pick(body.league, [
                                                'franchises',
                                                'id',
                                                'name'
                                            ])
                                        );
                                    }
                                    return Promise.resolve();
                                })
                                .catch(e => {
                                    console.log(e);
                                })
                        )
                    );
                })
                .then(leagues => {
                    if (!leagues.length) {
                        self.leagues = [];
                        return Promise.resolve(self);
                    }
                    leagues = _.compact(leagues).map(league => {
                        league.sendId = league.id;
                        league.teams = league.franchises
                            ? league.franchises.franchise
                            : [];
                        league.leagueSecondaryId = null;
                        delete league.franchises;
                        return league;
                    });
                    return Promise.all(
                        leagues.map(league =>
                            leagueHasDrafted({
                                league,
                                cookieString: self.cookieString
                            })
                        )
                    ).then(leaguesWithDraftStatus => {
                        self.leagues = leaguesWithDraftStatus;
                        return Promise.resolve(self);
                    });
                })
                .catch(e =>
                    log
                        .writeToLog({
                            logType: 'mfl',
                            userId: self.userId,
                            location: 'getLeagues',
                            state: res.body,
                            result: '',
                            err: e.stack || e
                        })
                        .then(err => Promise.reject(err))
                )
        );
    });

    return this;
};

MFL.prototype.setLeagueId = function setLeagueId(leagueUrl) {
    // TODO: bunch of error checking
    let leaguePath;
    if (typeof leagueUrl === 'string') leaguePath = url.parse(leagueUrl).path;
    this.leagueId = leaguePath.split('/')[3];
    return this;
};

MFL.prototype.getCurrentAndLastWeeksLineups = function getLineup(leagueId) {
    const self = this;
    const weekNum = common.getWeekNumber();
    const currentAndLastWeekPaths = [
        `http://www73.myfantasyleague.com/2017/export?TYPE=weeklyResults&L=${leagueId}&W=${weekNum}&JSON=1`,
        `http://www73.myfantasyleague.com/2017/export?TYPE=weeklyResults&L=${leagueId}&W=${weekNum -
            1}&JSON=1`
    ];
    return Promise.all(
        currentAndLastWeekPaths.map(weekPath =>
            self.authRequestPromise(weekPath)
        )
    ).then(lineups => {
        self.lineupResults = lineups;
        return Promise.resolve(self);
    });
};

MFL.prototype.authRequestPromise = function reqObj(requestUrl) {
    return request
        .getAsync({
            url: requestUrl,
            headers: {
                Cookie: this.cookieString
            }
        })
        .then(res => Promise.resolve(JSON.parse(res.body).weeklyResults));
};
// TODO: NEED TO FIX THIS UP - SOMETIMES THEY USE MATCHUPS AND SOMETIMES NOT
function indexWeeklyLineup(lineups) {
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
}
// TODO: Error check if matchup.franchise is undefined
function indexFranchises(lineupObj) {
    const lineups = {};
    try {
        lineupObj.curr.forEach(matchup => {
            matchup.franchise = matchup.franchise.filter(team => team.starters);
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
                if (franchise && !lineups[franchise.id].starters) {
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
}

MFL.prototype.determineWeeklyLineups = function reconcileLineups(leagueId) {
    return this.getCurrentAndLastWeeksLineups(leagueId)
        .then(self => {
            const lineupObj = indexWeeklyLineup(self.lineupResults);
            self.lineups = indexFranchises(lineupObj);
            return Promise.resolve(self);
        })
        .catch(err => {
            console.log('MATCHUP ERROR', leagueId);
            return Promise.reject(err);
        });
};

MFL.prototype.createRequest = function createRequest(type, leagueId, week) {
    let year; // = new Date();
    let urlString = '';
    year = 2017; // temporary testing value
    if (week) {
        urlString = `${this
            .ROOT_URL}${year}/export?TYPE=${type}&L=${leagueId}&W=${week}&JSON=1'`;
    } else {
        urlString = `${this
            .ROOT_URL}${year}/export?TYPE=${type}&L=${leagueId}&JSON=1'`;
    }
    return urlString;
};

MFL.prototype.getLeagueOwners = function getOwners(leagueId, ownerId, userId) {
    // const weekNum = common.getWeekNumber();
    const urlPath = this.createRequest('league', leagueId);
    this._request = this._request.then(self =>
        request.getAsync(urlPath).then(res => {
            let body;
            try {
                body = JSON.parse(res.body).league;
            } catch (e) {
                return Promise.reject({
                    errorMsg:
                        'There was an error when gathering your league information.  Please contact us at apps@footballguys.com so we can look further into this for you.'
                });
            }
            // console.log(body);
            const conferenceDictionary = {};
            const leagueRosters = {};
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
                    division:
                        conferenceDictionary[team.division] || team.division
                };
                if (ownerId === team.id) {
                    self.ownerDivision =
                        conferenceDictionary[team.division] || team.division;
                }
            });
            self.indexedLeagueRosters = leagueRosters;
            return Promise.resolve(self);
        })
    );
    // .catch((err) => console.log(err));
    return this;
};

MFL.prototype.getLeagueRosters = function getTeams(
    leagueId,
    userId,
    ownerTeamId
) {
    // const weekNum = common.getWeekNumber();
    const me = this;
    const urlPath = this.createRequest('rosters', leagueId);
    me._request = me._request
        .then(self =>
            request
                .getAsync(urlPath)
                .then(res => {
                    let body;
                    let draftedBool = false;
                    try {
                        body = JSON.parse(res.body);
                    } catch (e) {
                        console.log(res.body, e);
                        if (res.body.indexOf('404') > -1) {
                            return Promise.reject({
                                errorMsg: `MFL's API seems to have trouble producing data for your leauge.  Please send them a support ticket saying their roster API is not working at the moment.
                                https://www75.myfantasyleague.com/2017/support?L=${leagueId}&USERNAME=${me.username}&FRANCHISE=${ownerTeamId}&SHOWFORM=1&USECAT=Rosters`
                            });
                        }
                    }
                    body.rosters.franchise.forEach(team => {
                        if (Array.isArray(team.player)) {
                            self.indexedLeagueRosters[
                                team.id
                            ].roster = team.player.map(spot => spot.id);
                            draftedBool = true;
                        } else if (typeof team.player === 'object') {
                            self.indexedLeagueRosters[team.id].roster = [
                                team.player.id
                            ];
                            draftedBool = true;
                        } else {
                            self.indexedLeagueRosters[team.id].roster = [];
                        }
                    });
                    if (!draftedBool) {
                        return Promise.reject({
                            errorMsg:
                                'We couldn\'t find any rosters for this league. Please make sure your draft results have been entered and finalized on the league host. It\'s possible rosters might even be showing but your commissioner has not finalized the draft results. Please double check with the commissioner that they are both entered and finalized; if so please contact us at apps@footballguys.com so we can look into this further for you'
                        });
                    }
                    let count = 0;
                    const allPlayers = common.allPlayersFromLeagueRosters(
                        self.indexedLeagueRosters
                    );
                    const playerPools = common.duplicatePlayers(allPlayers);
                    if (playerPools.size > 0 && playerPools.size < 20) {
                        console.log(
                            'MULTIPLE PLAYER POOLS',
                            common.translatePlayerIds([...playerPools], 'mfl')
                        );
                    }
                    if (playerPools.size > 15) {
                        // apply division separation
                        // TODO: if playerPool > division need to inspect further
                        Object.keys(self.indexedLeagueRosters)
                            .sort()
                            .forEach(teamId => {
                                if (
                                    self.indexedLeagueRosters[teamId]
                                        .division === self.ownerDivision
                                ) {
                                    self.leagueRosters[count] =
                                        self.indexedLeagueRosters[teamId];
                                    self.indexedLeagueRosters[
                                        teamId
                                    ].divIndex = count;
                                    count += 1;
                                }
                            });
                    } else {
                        Object.keys(self.indexedLeagueRosters)
                            .sort()
                            .forEach(teamId => {
                                self.leagueRosters[count] =
                                    self.indexedLeagueRosters[teamId];
                                self.indexedLeagueRosters[
                                    teamId
                                ].divIndex = count;
                                count += 1;
                            });
                    }
                    // remove this section below if lineups are corrected
                    Object.keys(self.leagueRosters).forEach(teamKey => {
                        self.leagueRosters[
                            teamKey
                        ].roster = common.translateRosters(
                            self.leagueRosters[teamKey].roster,
                            'mfl'
                        );
                    });
                    // self.leagueRosters = _.values(self.leagueRosters);

                    return Promise.resolve(self);
                })
                .catch(e =>
                    util.log
                        .writeToLog({
                            logType: 'mfl',
                            leagueId,
                            userId: self.userId,
                            location: 'getLeagueRosters',
                            state: self,
                            err: e.stack || e
                        })
                        .then(() => Promise.reject(e))
                )
        )
        .then(self =>
            self
                .determineWeeklyLineups(leagueId)
                .then(me2 => {
                    Object.keys(self.leagueRosters).forEach(id => {
                        if (me2.lineups[self.leagueRosters[id].id]) {
                            self.leagueRosters[
                                id
                            ].lineup = common.translateLineup(
                                me2.lineups[self.leagueRosters[id].id],
                                'mfl'
                            );
                        } else {
                            self.leagueRosters[id].lineup = {
                                STARTER: [],
                                BN: []
                            };
                        }
                    });
                    return Promise.resolve(self);
                })
                .catch(err =>
                    log
                        .writeToLog({
                            logType: 'mfl',
                            leagueId,
                            userId,
                            location: 'determineWeeklyLineups',
                            state: _.omit(self, ['_request', 'cookieJar']),
                            expect: {
                                STARTER: [],
                                BN: []
                            },
                            result: '',
                            err: err.stack || err
                        })
                        .then(() => Promise.resolve(self))
                )
        )
        .then(self => {
            if (!self.nosave) {
                return provider
                    .saveProviderData({
                        provider: 'mfl',
                        leagueId,
                        ffLeagueId: self.ffLeagueId,
                        className: 'FFLeague',
                        userId,
                        teamId: ownerTeamId,
                        teams: self.leagueRosters,
                        username: self.username,
                        password: self.password,
                        sessionData: self.cookieString
                    })
                    .then(() => Promise.resolve(self))
                    .catch(err => {
                        if (err.errorMsg && !err.errSave) {
                            return Promise.reject(err);
                        }
                        return log
                            .writeToLog({
                                logType: 'mfl',
                                leagueId,
                                userId,
                                location: 'Saving Provider Data',
                                state: _.omit(self, ['_request', 'cookieJar']),
                                result: '',
                                err: err.stack || err
                            })
                            .then(() => Promise.resolve(self));
                    });
            }
            return Promise.resolve(self);
        });
    return me;
};

MFL.prototype.getAllPlayers = function getAllMFLPlayers() {
    const self = this;
    const urlPath = this.createRequest('players');
    this._request = request.getAsync(urlPath).then(res => {
        self.players = res.body;
        return Promise.resolve(self);
    });
    return this;
};

MFL.prototype.exec = function mflExec() {
    return this._request.then(self =>
        Promise.resolve(_.omit(self, ['_request', 'cookieJar']))
    );
};

module.exports = MFL;
