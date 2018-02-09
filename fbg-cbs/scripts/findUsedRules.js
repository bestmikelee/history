// find rules for each league in accounts

const fs = require('fs');
const path = require('path');
const accounts = require('../download/accounts.json');
const auth = require('../lib/auth');
const settings = require('../lib/settings');
const _ = require('lodash');

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
(async () => {
    const accountsWithCookieString = [];
    const accountsWithScoring = [];
    const scoringErrors = [];

    await asyncForEach(_.values(accounts).slice(100, 150), async account => {
        try {
            const cookieString = await auth.login(account);
            console.log(account.leagueId);
            account.cookieString = cookieString;
            accountsWithCookieString.push(account);
        } catch (e) {
            console.log(account.leagueId, e);
        }
    });

    await asyncForEach(accountsWithCookieString, async account => {
        if (account.cookieString) {
            try {
                account.id = account.leagueId;
                const scoringSettings = await settings.getLeagueSettings({
                    leagueObj: account,
                    cookieString: account.cookieString
                });
                account.scoring = scoringSettings.scoring;
                accountsWithScoring.push(account);
            } catch (e) {
                console.log(account.leagueId, e);
                account.errorMessage = e.message;
                scoringErrors.push(account);
            }
        }
    });

    fs.writeFileSync(
        path.join(__dirname, '../download/accountsWithScoring.json'),
        JSON.stringify(accountsWithScoring, null, 2)
    );
    fs.writeFileSync(
        path.join(__dirname, '../download/accountsWithScoringError.json'),
        JSON.stringify(scoringErrors, null, 2)
    );
    process.exit();
})();
