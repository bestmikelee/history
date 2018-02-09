'use strict';
const cookieString = '';

const schedule = require('../lib/schedule');
const leagueId = '';
let weeklyResults;
let processedWeeks;
let ownerSchedule;

test('able to obtain week 1 schedule', async () => {
    const responseBody = await schedule.getWeeklyMatchup({
        leagueId,
        weekNum: 1,
        cookieString
    });
    expect(responseBody).toBeDefined();
});

test('able to obtain season schedule', async () => {
    weeklyResults = await schedule.getSeasonSchedule({
        leagueId,
        weeks: 13,
        cookieString
    });
    expect(weeklyResults).toBeDefined();
});

test('able to process weeklyResults', async () => {
    processedWeeks = weeklyResults.map(weeklyResult =>
        schedule.processWeeklyResult(weeklyResult)
    );
    expect(processedWeeks).toBeDefined();
});

test('able to isolate owners schedule', async () => {
    ownerSchedule = schedule.ownerSchedule(processedWeeks, '0004');
    expect(ownerSchedule).toBeDefined();
});
