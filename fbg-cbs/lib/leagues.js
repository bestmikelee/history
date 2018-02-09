'use strict';
const url = require('url');
const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const cheerio = require('cheerio');
const reference = require('./reference');
const _ = require('lodash');
const settings = require('./settings');

function extractLeagueIdFromHost(host) {
    const leagueId = _.replace(host, '.football.cbssports.com', '');
    if (leagueId === host) {
        throw new Error('league id cannot be parsed');
    }
    return leagueId;
}

async function getCBSLeagues({ cookieString, raw }) {
    const j = request.jar();
    const options = {
        url: 'http://www.cbssports.com/my-teams/content/xhr/',
        qs: {
            tid: Date.now(),
            _: Date.now() + 2
        },
        useQuerystring: true,
        // followAllRedirects: true,
        jar: j,
        headers: {
            'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
            Pragma: 'no-cache',
            Expires: 'Fri, 01 Jan 1990 00:00:00 GMT',
            'Content-Type': 'text/html',
            Referer: 'http://www.cbssports.com/fantasy/games/my-teams/',
            DNT: 1,
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest',
            Cookie: cookieString
        }
    };
    const data = await request.getAsync(options);
    if (raw) {
        return data;
    }
    const body = data.body;
    const $ = cheerio.load(body);
    const teams = [];
    $('#team-football')
        .children()
        .each((i, el) => {
            const linkEl = $(el)
                .find('.user-teams')
                .children('a');
            const link = linkEl.attr('href');
            const parsedLink = url.parse(link);
            if (link.indexOf(reference.LEAGUE_HOST) !== -1 && parsedLink.host) {
                const leagueId = extractLeagueIdFromHost(parsedLink.host);
                const teamLeague = $(linkEl).children();
                const teamName = $(teamLeague[0]).text();
                const leagueName = $(teamLeague[1]).text();
                // Best way to get team id?
                // Option 1: Roster-grid: match name with team
                if (leagueId !== 'mockdraft') {
                    teams.push({
                        id: leagueId,
                        sendId: leagueId,
                        name: leagueName,
                        userTeamName: teamName
                    });
                }
            }
        });
    return await Promise.all(
        teams.map(
            async team =>
                await settings.getDraftStatus({
                    teamObj: team,
                    cookieString
                })
        )
    );
}

module.exports.get = getCBSLeagues;
