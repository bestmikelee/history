'use strict';
const url = require('url');
const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const cheerio = require('cheerio');
const reference = require('./reference');
const _ = require('lodash');

function scrapeRosterPage(leagueId, body) {
    const $ = cheerio.load(body);
    const $tableRows = $('table.rosterGrid').children();
    const $rosterFields = $tableRows.first().children();
    const rosterFields = [];
    $rosterFields.each((i, el) => {
        rosterFields.push($(el).text());
    });
    const ownerTeamName = $('.teamName').text();
    const rosterDictionary = {};
    // each team, including headers
    $tableRows.each((i, team) => {
        if (i) {
            let teamId;
            const $team = $(team);
            $team.children().each((jj, field) => {
                const $field = $(field);
                if (jj === 0) {
                    const teamName = $field.text();
                    const href = $field
                        .children()
                        .first()
                        .attr('href');
                    teamId = href.split('/')[2];
                    rosterDictionary[teamId] = {
                        id: teamId,
                        href: `http://${leagueId}${reference.LEAGUE_HOST}${
                            href
                        }`,
                        name: teamName,
                        owner: teamName === ownerTeamName,
                        roster: [],
                        lineup: {
                            BN: []
                        }
                    };
                } else {
                    $field.children('br').replaceWith('|');
                    const rosterLineup = $field
                        .text()
                        .split('|')
                        .filter(player => ~player.indexOf('(R)'))
                        .map(player => player.replace(' (R)', ''));
                    $field
                        .children()
                        .not('br')
                        .each((k, player) => {
                            const $player = $(player);
                            const href = $player.attr('href');
                            const playerId = href.split('/')[3];
                            const playerText = $player.text();
                            rosterDictionary[teamId].roster.push(playerId);
                            rosterDictionary[teamId].lineup[rosterFields[jj]] =
                                rosterDictionary[teamId].lineup[
                                    rosterFields[jj]
                                ] || [];
                            if (~rosterLineup.indexOf(playerText)) {
                                rosterDictionary[teamId].lineup.BN.push(
                                    playerId
                                );
                            } else {
                                rosterDictionary[teamId].lineup[
                                    rosterFields[jj]
                                ].push(playerId);
                            }
                        });
                }
            });
        }
    });
    const sortedTeams = _.sortBy(_.values(rosterDictionary), ['id']);
    const indexedLeagueRosters = {};
    sortedTeams.forEach((team, i) => {
        indexedLeagueRosters[i] = team;
    });
    return indexedLeagueRosters;
}

async function getRosters({ leagueId, cookieString, raw }) {
    const path = url.format({
        protocol: 'http',
        slashes: true,
        host: leagueId + reference.LEAGUE_HOST
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
    const refreshedCookie = await request.getAsync(options).then(() => {
        cookieString = `${cookieString}; ${j.getCookieString(options.url)};`;
        return Promise.resolve(cookieString);
    });

    const optionsRedirect = {
        url: options.url + reference.ROSTER_GRID_PATH,
        followAllRedirects: true,
        jar: j,
        headers: {
            Cookie: refreshedCookie
        }
    };
    let response = await request.getAsync(optionsRedirect);
    let res;
    if (response.request.href.indexOf('notices/read') > -1) {
        const ackRedirect = {
            url: response.request.href.replace('notices/read', 'notices/ack'),
            followAllRedirects: true,
            jar: j,
            headers: {
                Cookie: refreshedCookie
            }
        };
        const ack = await request.getAsync(ackRedirect);
        res = await request.getAsync(optionsRedirect);
    } else {
        res = await request.getAsync(optionsRedirect);
    }
    if (raw) {
        return res;
    }
    const indexedLeagueRosters = scrapeRosterPage(leagueId, res.body);
    return indexedLeagueRosters;
}

module.exports.get = getRosters;
