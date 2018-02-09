'use strict';

const rosters = require('./lib/rosters');
const leagues = require('./lib/leagues');
const settings = require('./lib/settings');
const auth = require('./lib/auth');

module.exports = {
    getRosters: rosters.getRosters,
    getOwners: rosters.getOwners,
    getLeagues: leagues.getValidLeagues,
    getScoring: settings.getScoring,
    login: auth.login
};
