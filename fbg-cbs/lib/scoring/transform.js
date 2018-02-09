'use strict';

const scoringDef = require('./cachedScoringMap.json');
const fbgScoring = require('fbg-scoring-integration');

function spreadScoringDetails(formattedScoring, isIDP) {
    const scoringAbbreviations = Object.keys(formattedScoring);
    const scoringRules = [];
    scoringAbbreviations.forEach(abbrev => {
        formattedScoring[abbrev].forEach(cbsScoreDetails => {
            console.log(abbrev, cbsScoreDetails);
            if (!scoringDef[abbrev] || !scoringDef[abbrev].stat) {
                // ignore
                return;
            }
            const fbgTemplate = Object.assign({}, scoringDef[abbrev]);
            fbgTemplate.positions = cbsScoreDetails.positions;
            if (
                fbgTemplate.range === true &&
                cbsScoreDetails.range &&
                cbsScoreDetails.range.min > 0
            ) {
                fbgTemplate.range = cbsScoreDetails.range;
            } else {
                fbgTemplate.range = false;
            }
            if (!fbgTemplate.instance) {
                delete fbgTemplate.instance;
            }
            delete fbgTemplate.op;

            fbgTemplate.pts = cbsScoreDetails.points;
            if (Array.isArray(fbgTemplate.cat)) {
                if (isIDP) {
                    fbgTemplate.cat = 'IDP';
                } else {
                    fbgTemplate.cat = 'TMD';
                }
            }
            scoringRules.push(fbgTemplate);
        });
    });
    return scoringRules;
}

function toFBG(spreadScoring) {
    const fbgConversion = [];
    spreadScoring.forEach(scoreObj => {
        const fbgCatFunc = fbgScoring.categories[scoreObj.cat];
        const fbgStandard = fbgCatFunc[scoreObj.stat](scoreObj);
        fbgConversion.push(fbgStandard);
    });
    return fbgConversion;
}
module.exports.spreadScoring = spreadScoringDetails;
module.exports.toFBG = toFBG;
