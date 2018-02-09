/* global describe it*/
'use strict';
const fs = require('fs');

describe('CBS Test', () => {
    const credentials = require('./credentials/fantasyCredentials.json').cbs;

    const CBS = require('../lib/cbs');
    const username = credentials.username;
    const password = credentials.password;

    const cbs = CBS(username, password);
    let leagues;
    it('should retrieve leagues and teams of user', done => {
        cbs
            .getLeagues()
            .then(data => {
                if (Object.keys(data.teams).length) {
                    leagues = data.teams;
                    fs.writeFileSync(
                        './test/dump/cbs/getLeagues.json',
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
        Promise.all(leagues.map(league => cbs.getRosters(league.id)))
            .then(data => {
                fs.writeFileSync(
                    './test/dump/cbs/getRosters.json',
                    JSON.stringify(data, null, 4)
                );
                done();
            })
            .catch(err => {
                done(err);
            });
    });
});
