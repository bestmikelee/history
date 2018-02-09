'use strict';
const _ = require('lodash');
const rangeAdjustmentMap = {
    PY: ['P20', 'P30', 'P40', 'P50'],
    RY: ['R20', 'R40'],
    CY: ['C20', 'C40']
};

function isPositionSensitive(positionString) {
    const allOffensivePositions = ['QB', 'RB', 'WR', 'TE'];
    const positions = positionString.split('|');
    if (
        allOffensivePositions.length === positions.length &&
        _.difference(allOffensivePositions, positions).length === 0
    ) {
        return false;
    }
    if (_.intersection(allOffensivePositions, positions).length > 0) {
        return true;
    }
    return false;
}

function needsRangeAdjustment(positionRules) {
    // compare rules to cached scoring map
    // if conditions property exists,
}

function isTeamDefense(positionString) {
    if (positionString === 'def') {
        return true;
    }
    return false;
}

module.exports.isTeamDefense = isTeamDefense;
module.exports.isPositionSensitive = isPositionSensitive;
