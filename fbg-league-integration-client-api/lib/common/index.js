'use strict';

module.exports = {
    relevantPositions: [
        'qb',
        'rb',
        'wr',
        'te',
        'td',
        'pk',
        'de',
        'dt',
        'ilb',
        'olb',
        'cb',
        's'
    ],
    getWeekNumber() {
        const today = new Date();
        const seasonStart = new Date('September 10 2016');
        const days = (today - seasonStart) / 86400000;
        let weekNum = 0;
        if (days % 7 > 4) {
            // next week
            weekNum = days / 7 + 1;
        } else {
            // this week
            weekNum = days / 7;
        }
        if (!weekNum) return 1;
        return weekNum;
    },
    getRange(stat) {
        const rangeArr = stat.match(/([0-9]+\s?-\s?[0-9]+)/)[0].split('-');
        return {
            range_min: rangeArr[0],
            range_max: rangeArr[1]
        };
    },
    getInsideParens(stat) {
        let insideParens;
        try {
            insideParens = stat.match(/(\([A-Z0-9]+\))/)[0].slice(1, -1);
        } catch (e) {
            insideParens = undefined;
        }
        return insideParens;
    },
    getFirstNum(stat) {
        let firstNum;
        try {
            firstNum = stat.match(/[0-9]+/)[0];
        } catch (e) {
            firstNum = undefined;
        }
        return firstNum;
    },
    singleArrayToValue(obj) {
        if (obj) {
            Object.keys(obj).forEach(key => {
                if (Array.isArray(obj[key]) && obj[key].length === 1) {
                    obj[key] = obj[key][0];
                    return obj;
                }
                if (typeof obj[key] === 'object') {
                    this.singleArrayToValue(obj[key]);
                }
            });
        }
        return obj;
    }
};
