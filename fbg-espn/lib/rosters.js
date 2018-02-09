'use strict';
const _ = require('lodash');
const cheerio = require('cheerio');
const errors = require('./errors');
const reference = require('./reference');
const auth = require('./auth');
const url = require('url');

async function getRosters({ leagueId, ownerTeamId, userId, cookieObj }) {
    let $;
    const leagueRosters = {};
    const responseBody = await auth.passAuthToSite({
        leagueUrl: reference.LEAGUE_ROSTERS_URL,
        leagueId,
        cookieObj
    });
    try {
        $ = cheerio.load(responseBody);
    } catch (e) {
        console.log(e);
        return errors.unavailable();
    }
    if (
        $('.games-error-red-alert').text() ===
        'Your league has not drafted yet.'
    ) {
        return errors.undrafted();
    }

    if (
        $('.rightArea') &&
        $('.rightArea')
            .text()
            .indexOf('Activate') > -1
    ) {
        return errors.undrafted();
    }
    $('.playerTableTable').each((i, el) => {
        const tableHead = $(el)
            .find('.tableHead')
            .children('th')
            .children('a');
        const href = tableHead.attr('href');
        const teamId = url.parse(href, true).query.teamId;
        const teamName = tableHead.text();
        const players = [];
        const lineup = {};
        const playerRow = $(el).find('.pncPlayerRow');
        leagueRosters[teamId] = {
            id: teamId,
            name: teamName,
            owner: ownerTeamId === teamId.toString() ? userId : ''
        };

        playerRow.each((ii, row) => {
            const $row = $(row);
            const position = $row.children('.playerSlot').text();
            lineup[position] = lineup[position] || [];
            const player = $row
                .children('.playertablePlayerName')
                .children('.flexpop')
                .first();
            if (player.attr('playerid')) {
                const playerId = Number.parseInt(player.attr('playerid'), 10);
                players.push(playerId);
                lineup[position].push(playerId);
            } else {
                lineup[position].push(null);
            }
        });
        leagueRosters[teamId].roster = _.uniq(players);
        leagueRosters[teamId].lineup = lineup;
    });
    return leagueRosters;
}

module.exports.getRosters = getRosters;
