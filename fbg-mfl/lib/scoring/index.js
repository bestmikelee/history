'use strict';

const translate = require('./translate');
const transform = require('./transform');
const condition = require('./condition');

function interpretScoring({ positions, rule }) {
    const formattedScoring = {};
    let pos_limit = translate.positions(positions);
    // if (condition.isPositionSensitive(positions)) {
    //     pos_limit = translate.positions(positions);
    // }
    if (Array.isArray(rule)) {
        rule.forEach(r => {
            // interpret here
            const details = {
                pts: translate.pointValue(r.points.$t),
                range: translate.rangeValue(r.range.$t),
                positions: pos_limit,
                src_pos: positions
            };
            if (Array.isArray(formattedScoring[r.event.$t])) {
                formattedScoring[r.event.$t].push(details);
            } else {
                formattedScoring[r.event.$t] = [details];
            }
        });
    } else {
        formattedScoring[rule.event.$t] = [
            {
                pts: translate.pointValue(rule.points.$t),
                range: translate.rangeValue(rule.range.$t),
                positions: pos_limit
            }
        ];
    }

    return formattedScoring;
}

function spreadScoring(scoringRules) {
    // scoringRules as seen in '../../download/formattedScoring.json'
    return transform.spreadScoring(scoringRules);
}

function translateScoring(spreadScoring) {
    return transform.toFBG(spreadScoring);
}

module.exports.spreadScoring = spreadScoring;
module.exports.translateScoring = translateScoring;
module.exports.interpretScoring = interpretScoring;
