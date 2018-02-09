'use strict';

const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const _ = require('lodash');
const url = require('url');
const parseString = bluebird.promisifyAll(require('xml2js')).parseStringAsync;
const ref = require('./reference');

function leagueHasDrafted({ league, cookieString }) {
    const dashOptions = {
        url: `http://www50.myfantasyleague.com/2017/export?TYPE=draftResults&L=${
            league.id
        }`,
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

async function getValidLeagues({ cookieString }) {
    const dashOptions = {
        url: ref.LEAGUES_API,
        headers: {
            Cookie: cookieString
        }
    };
    const responseBody = await request.getAsync(dashOptions);
    const result = await parseString(responseBody.body);

    if (!Array.isArray(result.leagues.league)) {
        // No Leagues found
        return [];
    }
    const teams = result.leagues.league.map(league => {
        const urlArray = url.parse(league.$.url).pathname.split('/');
        league.$.id = urlArray[urlArray.length - 1];
        return league.$;
    });

    const leagues = await Promise.all(
        teams.map(league =>
            request
                .getAsync(ref.LEAGUE_INFO_API + league.id)
                .then(data => {
                    let body;
                    try {
                        body = JSON.parse(data.body);
                    } catch (e) {
                        console.log(league.id, data.body);
                    }
                    if (body) {
                        return Promise.resolve(
                            _.pick(body.league, ['franchises', 'id', 'name'])
                        );
                    }
                    return Promise.resolve();
                })
                .catch(e => {
                    console.log(e);
                })
        )
    );
    if (!leagues.length) {
        return [];
    }
    const totalLeagues = _.compact(leagues).map(league => {
        league.sendId = league.id;
        league.teams = league.franchises ? league.franchises.franchise : [];
        league.leagueSecondaryId = null;
        delete league.franchises;
        return league;
    });
    const leaguesWithDraftStatus = await Promise.all(
        totalLeagues.map(league =>
            leagueHasDrafted({
                league,
                cookieString
            })
        )
    );
    return leaguesWithDraftStatus;
}

module.exports.getValidLeagues = getValidLeagues;
