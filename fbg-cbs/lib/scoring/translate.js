'use strict';
const fbgScoring = require('fbg-scoring-integration');

function isRangeStat(cbsPointValue) {
    return cbsPointValue.indexOf('=') > -1;
}

function trimCategoryFromEndOfString(str, cat) {
    return str.slice(0, str.lastIndexOf(cat)).trim();
}

function isLastPartOfString(str, substr) {
    return str.length - substr.length === str.lastIndexOf(substr);
}

function pickNumbersIntoArray(str) {
    let lastWasNum = true;
    let temp = '';
    const numArray = [];
    str.split('').forEach((char, i) => {
        if (char !== ' ' && Number.isInteger(Number(char))) {
            temp += char;
            lastWasNum = true;
            if (str.length - 1 === i) {
                numArray.push(Number(temp));
            }
        } else {
            if (lastWasNum || str.length - 1 === i) {
                if (temp !== '') {
                    numArray.push(Number(temp));
                }
                temp = '';
            }
            lastWasNum = false;
        }
    });
    return numArray;
}

function parseRangeCondition(rangeCondition) {
    let range;
    // accepts string that would normally have a range condition and spits out an object
    if (rangeCondition.indexOf('-') > -1) {
        const rangeArr = pickNumbersIntoArray(rangeCondition);
        range = {
            min: rangeArr[0],
            max: rangeArr[1]
        };
    }
    if (rangeCondition.indexOf('+') > -1) {
        const rangeArr = pickNumbersIntoArray(rangeCondition);
        range = {
            min: rangeArr[0]
        };
    }
    if (range && range.min === 0 && !range.max) {
        return;
    }
    return range;
}

function parseRangeStat(cbsPointValue, stat) {
    const splitValue = cbsPointValue.split('=');
    const rangeObj = {
        range: trimCategoryFromEndOfString(splitValue[0], stat),
        points: splitValue[1]
    };
    if (isLastPartOfString(rangeObj.points, 'points')) {
        rangeObj.points = trimCategoryFromEndOfString(
            rangeObj.points,
            'points'
        );
    } else {
        // 'point for every'
        const pointArr = pickNumbersIntoArray(rangeObj.points);
        if (rangeObj.points.indexOf('for every') > -1) {
            rangeObj.points = pointArr[0] / pointArr[1];
        } else {
            // TODO: 'might need adjusting for other categories'
            rangeObj.points = pointArr[0];
        }
    }
    rangeObj.range = parseRangeCondition(rangeObj.range);
    return rangeObj;
}

function isBonusStat(cbsPointValue) {
    return cbsPointValue.indexOf('Plus') > -1;
}

function parseBonusStat(cbsPointValue, stat) {
    // left side = number of points
    // right side = condition
    const bonusSplit = cbsPointValue.split(stat);
    const points = pickNumbersIntoArray(bonusSplit[0])[0];
    const range = parseRangeCondition(bonusSplit[1]);
    return {
        points,
        range,
        instance: true
    };
}

function pointValue(cbsPointValue, stat) {
    if (
        isLastPartOfString(cbsPointValue, 'points') ||
        isLastPartOfString(cbsPointValue, 'point')
    ) {
        const pointVal = trimCategoryFromEndOfString(cbsPointValue, 'point');
        if (Number(pointVal)) {
            return {
                points: Number(pointVal)
            };
        }
    } else {
        if (isRangeStat(cbsPointValue)) {
            return parseRangeStat(cbsPointValue, stat);
        }
        if (isBonusStat(cbsPointValue)) {
            return parseBonusStat(cbsPointValue, stat);
        }
    }
    throw 'point value cannot be parsed';
}

function positions(cbsPositions) {
    switch (cbsPositions) {
        case 'Offensive':
            return fbgScoring.positions.off;
        case 'Defensive':
            return fbgScoring.positions.def;
        default:
            return fbgScoring.positions.all;
    }
}

module.exports.pointValue = pointValue;
module.exports.positions = positions;
