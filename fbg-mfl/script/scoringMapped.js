'use strict';

const mapped = require('../download/scoringMapped.json');
const path = require('path');
const fs = require('fs');

mapped.forEach(rule => {
    // adjustments here
    // rule.fbg.positions = [];
    // rule.fbg.priority = 0;
});

fs.writeFileSync(
    path.join(__dirname, '../download/scoringMapped.json'),
    JSON.stringify(mapped, null, 4)
);
