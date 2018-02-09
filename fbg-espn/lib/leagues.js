'use strict';
const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const errors = require('./errors');
const reference = require('./reference');

async function getLeagues({ swid }) {
    const userTeam = {};
    const j = request.jar();
    const frontPageOptions = {
        url: `${reference.FAN_API}${swid}?userId=${swid}`,
        followAllRedirects: true,
        jar: j
    };
    const res = await request.getAsync(frontPageOptions);
    let responseBody;
    try {
        responseBody = JSON.parse(res.body);
    } catch (e) {
        console.log(e);
        return errors.generic();
    }
    const teams = responseBody.preferences
        .filter(el => el.type.code === 'fantasy')
        .map(el => {
            const idSplit = el.id.split(':');
            const league = {};
            league.id = idSplit[1];
            league.sendId = idSplit[1];
            league.teamId = idSplit[0];
            league.name = el.metaData.entry.groups[0].groupName;
            league.drafted =
                el.metaData.entry.groups[0].leagueStatus === 3 ? 1 : 0;
            league.userTeamName =
                `${el.metaData.entry.entryLocation} ` +
                `${el.metaData.entry.entryNickname}`;
            return league;
        });
    teams.forEach(team => {
        userTeam[team.id] = team.teamId;
    });
    return {
        teams,
        userTeam
    };
}

module.exports.getLeagues = getLeagues;
