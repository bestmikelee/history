'use strict';

const mapped = require('../download/scoringMapped.json');
const path = require('path');
const fs = require('fs');

const indexed = {};
mapped.forEach(rule => {
    if (rule.valid) {
        indexed[rule.abbrev] = rule.fbg;
    }
});

fs.writeFileSync(
    path.join(__dirname, '../lib/scoring/cachedScoringMap.json'),
    JSON.stringify(indexed, null, 4)
);
