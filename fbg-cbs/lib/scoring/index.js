'use strict';

const translate = require('./translate');
const transform = require('./transform');
const _ = require('lodash');
const condition = require('./condition');

function interpretScoring({ positions, Settings, stat }) {
    const formattedScoring = {};
    let rules = [];
    let pos_limit = translate.positions(positions);
    // if (condition.isPositionSensitive(positions)) {
    //     pos_limit = translate.positions(positions);
    // }
    if (Settings.indexOf('|') > -1) {
        rules = _.compact(Settings.split('|'));
    } else {
        rules.push(Settings);
    }
    if (Array.isArray(rules)) {
        rules.forEach(r => {
            // interpret here
            const details = translate.pointValue(r, stat);
            details.positions = pos_limit;
            details.src_pos = positions;
            if (Array.isArray(formattedScoring[stat])) {
                formattedScoring[stat].push(details);
            } else {
                formattedScoring[stat] = [details];
            }
        });
    } else {
        console.log(rules);
        throw 'why not array?';
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
