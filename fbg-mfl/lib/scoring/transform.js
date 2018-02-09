'use strict';

const scoringDef = require('./cachedScoringMap.json');
const fbgScoring = require('fbg-scoring-integration');

function spreadScoringDetails(formattedScoring) {
    const scoringAbbreviations = Object.keys(formattedScoring);
    const scoringRules = [];
    scoringAbbreviations.forEach(abbrev => {
        formattedScoring[abbrev].forEach(mflScoreDetails => {
            if (!scoringDef[abbrev] || !scoringDef[abbrev].stat) {
                console.log(abbrev);
                // ignore
                return;
            }
            const fbgTemplate = Object.assign({}, scoringDef[abbrev]);
            fbgTemplate.positions = mflScoreDetails.positions;
            if (fbgTemplate.range === true && mflScoreDetails.range.min > 0) {
                fbgTemplate.range = mflScoreDetails.range;
            }
            if (!fbgTemplate.instance) {
                delete fbgTemplate.instance;
            }
            delete fbgTemplate.op;

            fbgTemplate.pts = mflScoreDetails.pts;
            if (Array.isArray(fbgTemplate.cat)) {
                if (mflScoreDetails.src_pos === 'Def') {
                    fbgTemplate.cat = 'TMD';
                } else {
                    fbgTemplate.cat = 'IDP';
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
