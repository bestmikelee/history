/* global describe it*/
'use strict';
const fs = require('fs');

describe('ESPN Test', () => {
    const credentials = require('./credentials/fantasyCredentials.json').espn;

    const ESPN = require('../lib/espn');
    const username = credentials.username;
    const password = credentials.password;

    const espn = ESPN(username, password);
    let leagues;
    it('should retrieve leagues and teams of user', done => {
        espn
            .getLeagues()
            .then(data => {
                if (Object.keys(data.teams).length) {
                    leagues = data.teams;
                    fs.writeFileSync(
                        './test/dump/espn/getLeagues.json',
                        JSON.stringify(data.teams, null, 4)
                    );
                    done();
                } else {
                    done(new Error('fail'));
                }
            })
            .catch(err => {
                done(err);
            });
    });

    it('should retrieve rosters of teams in leagues', done => {
        Promise.all(leagues.map(league => espn.getRosters(league.id)))
            .then(data => {
                fs.writeFileSync(
                    './test/dump/espn/getRosters.json',
                    JSON.stringify(data, null, 4)
                );
                done();
            })
            .catch(err => {
                done(err);
            });
    });
});
