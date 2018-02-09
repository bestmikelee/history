'use strict';

const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const _ = require('lodash');
const url = require('url');
const ref = require('./reference');
const errors = require('./errors');
const helper = require('./helper');
const path = require('path');
const fs = require('fs');
const scoringHelper = require('./scoring');
const fbgScoring = require('fbg-scoring-integration');

function customizer(objValue, srcValue) {
    if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}

async function getScoringRules({ leagueId, cookieString }) {
    const requestUrl = ref.SCORING_RULES + leagueId;
    const body = await helper.authRequest(requestUrl, cookieString);
    const rules = Array.isArray(body.rules.positionRules)
        ? body.rules.positionRules
        : [body.rules.positionRules];
    try {
        const formattedRules = rules.map(ruleObj =>
            scoringHelper.interpretScoring(ruleObj)
        );
        const justPrint = formattedRules.reduce((ruleSet1, ruleSet2) =>
            _.mergeWith(ruleSet1, ruleSet2, customizer)
        );
        const spreadScoring = scoringHelper.spreadScoring(justPrint);
        const transformed = scoringHelper.translateScoring(spreadScoring);
        return transformed;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function getAllScoringRules() {
    const requestUrl = ref.ALL_SCORING_RULES;
    const response = await request.getAsync(requestUrl);
    const body = JSON.parse(response.body);
    const formattedBody = body.allRules.rule.map(rule => {
        const description = {
            abbrev: rule.abbreviation.$t,
            short: rule.shortDescription.$t,
            long: rule.detailedDescription.$t,
            valid: Number(rule.isTeam) || Number(rule.isPlayer),
            fbg: {
                cat: '',
                stat: '',
                op: '',
                range: false,
                instance: false
            }
        };
        return description;
    });
    return formattedBody;
}

module.exports.getAllRules = getAllScoringRules;
module.exports.getScoring = getScoringRules;
