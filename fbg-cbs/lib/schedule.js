'use strict';
const bluebird = require('bluebird');
const cheerio = require('cheerio');
const request = bluebird.promisifyAll(require('request'));
const url = require('url');
const reference = require('./reference');

async function getSchedule({ leagueObj, cookieString, raw }) {
    const leagueId = leagueObj.id;
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
    const refreshedCookie = await request
        .getAsync(options)
        .then(() => `${cookieString}; ${j.getCookieString(options.url)};`);

    const optionsRedirect = {
        url: `http://${leagueId}${reference.LEAGUE_HOST}${
            reference.SCHEDULE_PATH
        }${leagueObj.teamId}/2017`,
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
    const $ = cheerio.load(res.body);
    const schedule = [];
    const ownerTeamUrl = $('option')
        .first()
        .attr('value');
    const ownerTeamId = ownerTeamUrl.split('/')[3];
    $('tr').each((i, tr) => {
        const trEl = $(tr);
        if (trEl.hasClass('row1') || trEl.hasClass('row2')) {
            const td = trEl.children();
            const weekNum = td.eq(0).text();
            const oppTeam = td
                .eq(1)
                .find('a')
                .attr('href');
            const scheduleUrl = td
                .eq(2)
                .find('a')
                .attr('href');
            const opp = oppTeam.split('/')[2];
            schedule.push({
                weekNum,
                opp,
                scheduleUrl
            });
        }
    });
    return Promise.resolve({
        ownerTeamId,
        schedule
    });
}

module.exports.getSchedule = getSchedule;
