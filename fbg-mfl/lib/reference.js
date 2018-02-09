'use strict';
const year = '2017';

module.exports.ROOT_URL = 'http://www59.myfantasyleague.com/';
module.exports.LOGIN_URL = `https://www03.myfantasyleague.com/${year}/public`;
module.exports.DASHBOARD_URL = `http://www54.myfantasyleague.com/${year}/dash`;
module.exports.LEAGUES_API = `http://www03.myfantasyleague.com/${year}/export?TYPE=myleagues`;
module.exports.LEAGUE_INFO_API = `http://www62.myfantasyleague.com/${year}/export?TYPE=league&JSON=1&L=`;
module.exports.ROSTER_API = `http://www51.myfantasyleague.com/${year}/export?TYPE=rosters&W=&JSON=1&L=`;
module.exports.DRAFT_RESULTS = `http://www50.myfantasyleague.com/${year}/export?TYPE=draftResults&L=`;
module.exports.SCORING_RULES = `http://www50.myfantasyleague.com/${year}/export?TYPE=rules&JSON=1&L=`;
module.exports.ALL_SCORING_RULES = `http://www50.myfantasyleague.com/${year}/export?TYPE=allRules&JSON=1`;
module.exports.getWeeklyLineupUrl = (leagueId, week) =>
    `http://www50.myfantasyleague.com/${year}/export?TYPE=weeklyResults&L=${leagueId}&W=${week}&JSON=1`;

module.exports.createRequest = (type, leagueId, week) => {
    let urlString = '';
    if (week) {
        urlString = `${this
            .ROOT_URL}${year}/export?TYPE=${type}&L=${leagueId}&W=${week}&JSON=1`;
    } else {
        urlString = `${this
            .ROOT_URL}${year}/export?TYPE=${type}&L=${leagueId}&JSON=1`;
    }
    return urlString;
};
