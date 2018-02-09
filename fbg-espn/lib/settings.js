'use strict';
const _ = require('lodash');
const cheerio = require('cheerio');
const errors = require('./errors');
const reference = require('./reference');
const auth = require('./auth');
const url = require('url');

function getInsideParens(stat) {
    let insideParens;
    try {
        insideParens = stat.match(/(\([A-Z0-9]+\))/)[0].slice(1, -1);
    } catch (e) {
        insideParens = undefined;
    }
    return insideParens;
}

async function getLeagueSettings({ leagueId, cookieObj }) {
    const responseBody = await auth.passAuthToSite({
        leagueUrl: reference.LEAGUE_SETTINGS,
        leagueId,
        cookieObj
    });
    const leagueSettings = { roster: [] };
    const $ = cheerio.load(responseBody);
    const rosterTable = $('.leagueSettingsTable.viewable')
        .first()
        .children()
        .last();
    const rosterTotalLimits = rosterTable.first().find('p');
    const rosterPositionLimits = rosterTable.last().find('tr');

    leagueSettings.roster_size = Number(
        rosterTotalLimits
            .eq(0)
            .text()
            .split(':')[1]
    );

    leagueSettings.starting_roster_size = Number(
        rosterTotalLimits
            .eq(1)
            .text()
            .split(':')[1]
    );

    leagueSettings.bench_size = Number(
        rosterTotalLimits
            .eq(2)
            .text()
            .split(':')[1]
    );

    // Roster
    rosterPositionLimits.each((i, el) => {
        if (i > 0) {
            const td = $(el).find('td');
            let poses = td
                .eq(0)
                .text()
                .match(/\([A-Z/]+\)/)[0];
            const numStarters = Number(td.eq(1).text());
            const maxNum =
                td
                    .eq(2)
                    .text()
                    .trim() === 'N/A'
                    ? 0
                    : Number(td.eq(2).text());

            const rosterObj = {
                num: numStarters,
                max: maxNum,
                min: 0,
                bench: 0
            };

            poses = poses.slice(1, -1);
            switch (poses) {
                case 'D/ST':
                    rosterObj.poses = 'td';
                    leagueSettings.roster.push(rosterObj);
                    break;
                case 'K':
                    rosterObj.poses = 'pk';
                    leagueSettings.roster.push(rosterObj);
                    break;
                default:
                    rosterObj.poses =
                        poses.indexOf('/') > -1
                            ? poses
                                .split('/')
                                .join(',')
                                .toLowerCase()
                            : poses.toLowerCase();
                    leagueSettings.roster.push(rosterObj);
            }
        }
    });

    // Scoring
    // TODO: Address duplicates and consolidate scoring to FBG fields
    const scoringTable = $('.leagueSettingsTable.viewable')
        .eq(1)
        .children();
    const scoringSettings = [];
    scoringTable.each((i, el) => {
        if (i > 0) {
            const cat = $(el)
                .children()
                .first()
                .text()
                .toLowerCase()
                .trim();
            const scoring = $(el)
                .children()
                .last();
            let params = [];
            let abbrev;
            scoring.children().each((j, tr) => {
                // console.log(tr);
                $(tr)
                    .find('td')
                    .each((k, td) => {
                        const stat = $(td).text();
                        abbrev = getInsideParens(stat)
                            ? getInsideParens(stat)
                            : abbrev;
                        if ($(td).hasClass('statName')) {
                            params.push(stat);
                            params.push(abbrev);
                        }
                        if ($(td).hasClass('statPoints')) {
                            params.push(stat);
                        }
                        if (params.length === 3) {
                            if (reference.FBG_SCORING_DICTIONARY[cat][abbrev]) {
                                scoringSettings.push(
                                    reference.FBG_SCORING_DICTIONARY[cat][
                                        abbrev
                                    ].apply(null, params)
                                );
                                params = [];
                            } else {
                                const noNums = abbrev.replace(/([0-9]+)/, '');
                                scoringSettings.push(
                                    reference.FBG_SCORING_DICTIONARY[cat][
                                        noNums
                                    ].apply(null, params)
                                );
                                params = [];
                            }
                        }
                    });
            });
        }
    });
    return {
        leagueSettings,
        scoringSettings
    };
}

module.exports.getLeagueSettings = getLeagueSettings;
