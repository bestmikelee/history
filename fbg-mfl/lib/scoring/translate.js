'use strict';
const fbgScoring = require('fbg-scoring-integration');

function pointValue(mflPointValue) {
    if (mflPointValue.indexOf('/') > -1) {
        const fractionalValue = mflPointValue.split('/').map(pointValue);
        return fractionalValue[0] / fractionalValue[1];
    }
    if (mflPointValue.indexOf('-') === 0 || mflPointValue.indexOf('.') === 0) {
        return Number(mflPointValue);
    }
    if (mflPointValue[0] === '*') {
        return Number(mflPointValue.slice(1));
    }
    return Number(mflPointValue);
}

function rangeValue(mflRangeValue) {
    const hyphenIndex = mflRangeValue.lastIndexOf('-');
    return {
        min: mflRangeValue.slice(0, hyphenIndex),
        max: mflRangeValue.slice(hyphenIndex + 1)
    };
}

function positions(mflPositions) {
    const positionArr = mflPositions.split('|');
    return positionArr.map(pos => {
        const lowered = pos.toLowerCase();
        if (lowered === 'def') {
            return 'td';
        }
        if (fbgScoring.validPositions.indexOf(lowered) > -1) {
            return lowered;
        }
        throw 'not a valid position';
    });
}

module.exports.pointValue = pointValue;
module.exports.rangeValue = rangeValue;
module.exports.positions = positions;
