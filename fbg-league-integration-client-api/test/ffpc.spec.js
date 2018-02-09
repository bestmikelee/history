/* global describe it*/
'use strict';
const fs = require('fs');

describe('FFPC Test', () => {
    const credentials = require('./credentials/fantasyCredentials.json').ffpc;

    const FFPC = require('../lib/ffpc');
    const email = credentials.email;

    const ffpc = FFPC(email);
    let leagues;
    it('should retrieve leagues and teams of user', done => {
        ffpc
            .getLeagues()
            .then(data => {
                if (Object.keys(data.leagues).length) {
                    leagues = data.leagues;
                    fs.writeFileSync(
                        './test/dump/ffpc/getLeagues.json',
                        JSON.stringify(data.leagues, null, 4)
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
        Promise.all(leagues.map(league => ffpc.getRosters(league.id)))
            .then(data => {
                fs.writeFileSync(
                    './test/dump/ffpc/getRosters.json',
                    JSON.stringify(data, null, 4)
                );
                done();
            })
            .catch(err => {
                done(err);
            });
    });
});
