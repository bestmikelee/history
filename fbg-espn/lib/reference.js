'use strict';

module.exports.LOGIN_URL = 'https://registerdisney.go.com/jgc/v2/client/ESPN-FANTASYLM-PROD/guest/login?langPref=en-US';
module.exports.FRONTPAGE_URL = 'http://games.espn.go.com/frontpage/football';
module.exports.LEAGUE_ROSTERS_URL = 'http://games.espn.go.com/ffl/leaguerosters?leagueId=';
module.exports.TEAM_OWNER_URL = 'http://games.espn.go.com/ffl/leaguesetup/ownerinfo?leagueId=';
module.exports.LEAGUE_OFFICE_URL = 'http://games.espn.go.com/ffl/leagueoffice?seasonId=2017&leagueId=';
module.exports.LEAGUE_DRAFT_SETTINGS_URL = 'http://games.espn.com/ffl/leaguesetup/settings?view=draft&leagueId=';
module.exports.NFL_TEAM_ROSTER_URL = 'http://espn.go.com/nfl/team/roster/_/name/';
module.exports.NFL_TEAMS_URL = 'http://espn.go.com/nfl/standings';
module.exports.NFL_PLAYER_URL = 'http://espn.go.com/nfl/player/_/id/';
module.exports.DOB_REGEX = /Born([A-Za-z0-9 ,])+ [0-9]{4}/;
module.exports.FAN_API = 'http://fan.api.espn.go.com/apis/v2/fans/';
module.exports.LEAGUE_SETTINGS = 'http://games.espn.go.com/ffl/leaguesetup/settings?leagueId=';
module.exports.PLAYERDB_URL = 'http://games.espn.go.com/ffl/freeagency?leagueId=92365&teamId=9&seasonId=2017&avail=-1&context=freeagency&view=overview&version=projections&startIndex=';
module.exports.PLAYERDB_WITH_QB = 'http://games.espn.go.com/ffl/freeagency?leagueId=62854&teamId=8&seasonId=2017&avail=-1&context=freeagency&view=overview&version=projections&startIndex=';

module.exports.FBG_SCORING_DICTIONARY = {
    passing: {
        PY(label, abbrev, points) {
            // ex: 2 pts every 25 yds should be a number
            const yards = Number(abbrev.slice(2));
            const pts = (yards / Number(points)).toString();
            return {
                cat: 'PASS',
                stat: 'YDS',
                op: '/',
                pts
            };
        },
        P300(label, abbrev, points) {
            return {
                cat: 'PASS',
                stat: 'YDS',
                op: '+',
                pts: points,
                range_min: '300',
                range_mix: '399'
            };
        },
        P400(label, abbrev, points) {
            return {
                cat: 'PASS',
                stat: 'YDS',
                op: '+',
                pts: points,
                range_min: '400'
            };
        },
        PC(label, abbrev, points) {
            return {
                cat: 'PASS',
                stat: 'CMP',
                op: '*',
                pts: points
            };
        },
        INC(label, abbrev, points) {
            return {
                cat: 'PASS',
                stat: 'INC',
                op: '*',
                pts: points
            };
        },
        IP(label, abbrev, points) {
            // Incomplete Passes
            const numTimes = Number(abbrev.slice(2));
            const pts = (numTimes / Number(points)).toString();
            return {
                cat: 'PASS',
                stat: 'INC',
                op: '/',
                pts
            };
        },
        PTD(label, abbrev, points) {
            const yards = abbrev.slice(3);
            if (yards) {
                return {
                    cat: 'PASS',
                    stat: 'TD',
                    instance: true,
                    op: '*',
                    pts: points,
                    range_min: yards
                };
            }
            return {
                cat: 'PASS',
                stat: 'TD',
                op: '*',
                pts: points
            };
        },
        INT(label, abbrev, points) {
            return {
                cat: 'PASS',
                stat: 'INT',
                op: '*',
                pts: points
            };
        },
        PA(label, abbrev, points) {
            return {
                cat: 'PASS',
                stat: 'ATT',
                op: '*',
                pts: points
            };
        },
        SK(label, abbrev, points) {
            return {
                cat: 'PASS',
                stat: 'SCK',
                op: '*',
                pts: points
            };
        },
        '2PC'(label, abbrev, points) {
            return {
                cat: 'PASS',
                stat: '2PT',
                op: '*',
                pts: points
            };
        }
    },
    rushing: {
        RY(label, abbrev, points) {
            // ex: 2 pts every 25 yds should be a number
            const yards = Number(abbrev.slice(2));
            const pts = (yards / Number(points)).toString();
            return {
                cat: 'RUSH',
                stat: 'YDS',
                op: '/',
                pts
            };
        },
        RY100(label, abbrev, points) {
            return {
                cat: 'RUSH',
                stat: 'YDS',
                op: '+',
                pts: points,
                range_min: '100',
                range_mix: '199'
            };
        },
        RY200(label, abbrev, points) {
            return {
                cat: 'RUSH',
                stat: 'YDS',
                op: '+',
                pts: points,
                range_min: '200'
            };
        },
        RTD(label, abbrev, points) {
            const yards = abbrev.slice(3);
            if (yards) {
                // ESPN does not specify max range
                return {
                    cat: 'RUSH',
                    stat: 'TD',
                    instance: true,
                    op: '*',
                    pts: points,
                    range_min: yards
                };
            }
            return {
                cat: 'RUSH',
                stat: 'TD',
                op: '*',
                pts: points
            };
        },
        RA(label, abbrev, points) {
            return {
                cat: 'RUSH',
                stat: 'CAR',
                op: '*',
                pts: points
            };
        },
        '2PR'(label, abbrev, points) {
            return {
                cat: 'RUSH',
                stat: '2PT',
                op: '*',
                pts: points
            };
        }
    },
    receiving: {
        REY(label, abbrev, points) {
            // ex: 2 pts every 25 yds should be a number
            const yards = Number(abbrev.slice(2));
            const pts = (yards / Number(points)).toString();
            return {
                cat: 'REC',
                stat: 'YDS',
                op: '/',
                pts
            };
        },
        REY100(label, abbrev, points) {
            return {
                cat: 'REC',
                stat: 'YDS',
                op: '+',
                pts: points,
                range_min: '100',
                range_mix: '199'
            };
        },
        REY200(label, abbrev, points) {
            return {
                cat: 'REC',
                stat: 'YDS',
                op: '+',
                pts: points,
                range_min: '200'
            };
        },
        RETD(label, abbrev, points) {
            const yards = abbrev.slice(3);
            if (yards) {
                // ESPN does not specify max range
                return {
                    cat: 'REC',
                    stat: 'TD',
                    instance: true,
                    op: '*',
                    pts: points,
                    range_min: yards
                };
            }
            return {
                cat: 'REC',
                stat: 'TD',
                op: '*',
                pts: points
            };
        },
        REC(label, abbrev, points) {
            const numTimes = abbrev.slice(3);
            const pts = (numTimes / Number(points)).toString();
            if (numTimes) {
                return {
                    cat: 'REC',
                    stat: 'REC',
                    op: '*',
                    pts
                };
            }
            return {
                cat: 'REC',
                stat: 'REC',
                op: '*',
                pts: points
            };
        },
        RET(label, abbrev, points) {
            // Additional
            return {
                cat: 'REC',
                stat: 'TGT',
                op: '*',
                pts: points
            };
        },
        '2PRE'(label, abbrev, points) {
            return {
                cat: 'REC',
                stat: '2PT',
                op: '*',
                pts: points
            };
        }
    },
    miscellaneous: {
        FUML(label, abbrev, points) {
            return {
                cat: 'FUM',
                stat: 'LOST',
                op: '*',
                pts: points
            };
        },
        FUM(label, abbrev, points) {
            // Additional
            return {
                cat: 'FUM',
                stat: 'REC',
                op: '*',
                pts: points
            };
        },
        KR(label, abbrev, points) {
            // individual
            // multiplied by decimal
            return {
                cat: 'KR',
                stat: 'YDS',
                op: '*',
                pts: points
            };
        },
        KRTD(label, abbrev, points) {
            return {
                cat: 'KR',
                stat: 'TD',
                op: '*',
                pts: points
            };
        },
        PR(label, abbrev, points) {
            return {
                cat: 'PR',
                stat: 'YDS',
                op: '*',
                pts: points
            };
        },
        PRTD(label, abbrev, points) {
            return {
                cat: 'PR',
                stat: 'TD',
                op: '*',
                pts: points
            };
        },
        TW(label, abbrev, points) {
            // Additional
            return {
                cat: 'TEAM',
                stat: 'WIN',
                op: '+',
                pts: points
            };
        },
        TL(label, abbrev, points) {
            // Additional
            return {
                cat: 'TEAM',
                stat: 'LOSS',
                op: '+',
                pts: points
            };
        },
        FTD(label, abbrev, points) {
            // Additional
            return {
                cat: 'IDP',
                stat: 'FTD',
                op: '*',
                pts: points
            };
        },
        FRTD(label, abbrev, points) {
            // Additional
            return {
                cat: 'IDP',
                stat: 'FRTD',
                op: '*',
                pts: points
            };
        },
        INTTD(label, abbrev, points) {
            // Additional
            return {
                cat: 'IDP',
                stat: 'ITD',
                op: '*',
                pts: points
            };
        },
        BLKKRTD(label, abbrev, points) {
            // Additional
            return {
                cat: 'IDP',
                stat: 'BLKTD',
                op: '*',
                pts: points
            };
        },
        '1PSF'(label, abbrev, points) {
            // Additional
            return {
                cat: 'IDP',
                stat: '1SF',
                op: '*',
                pts: points
            };
        },
        '2PTRET'(label, abbrev, points) {
            // Additional
            return {
                cat: 'IDP',
                stat: '2PR',
                op: '*',
                pts: points
            };
        }

    },
    kicking: {
        PAT(label, abbrev, points) {
            return {
                cat: 'KCK',
                stat: 'XPC',
                op: '*',
                pts: points
            };
        },
        PATM(label, abbrev, points) {
            return {
                cat: 'KCK',
                stat: 'XPM',
                op: '*',
                pts: points
            };
        },
        PATA(label, abbrev, points) {
            // Additional
            return {
                cat: 'KCK',
                stat: 'XPA',
                op: '*',
                pts: points
            };
        },
        FG(label, abbrev, points) {
            const yards = abbrev.slice(2);
            let rangeMax;
            switch (yards) {
                case '':
                    return {
                        cat: 'KCK',
                        stat: 'FGC',
                        op: '*',
                        pts: points
                    };
                case '0':
                    rangeMax = 39;
                    break;
                case '50':
                    rangeMax = 0;
                    break;
                default:
                    rangeMax = yards + 9;
            }
            return {
                cat: 'KCK',
                stat: 'FGC',
                op: '*',
                pts: points,
                instance: true,
                range_min: yards,
                range_max: rangeMax
            };
        },
        FGM(label, abbrev, points) {
            const yards = abbrev.slice(3);
            let rangeMax;
            switch (yards) {
                case '':
                    return {
                        cat: 'KCK',
                        stat: 'FGM',
                        op: '*',
                        pts: points
                    };
                case '0':
                    rangeMax = 39;
                    break;
                case '50':
                    rangeMax = 0;
                    break;
                default:
                    rangeMax = yards + 9;
            }
            return {
                cat: 'KCK',
                stat: 'FGM',
                op: '*',
                pts: points,
                instance: true,
                range_min: yards,
                range_max: rangeMax
            };
        },
        FGA(label, abbrev, points) {
            // Additional
            const yards = abbrev.slice(3);
            let rangeMax;
            switch (yards) {
                case '':
                    return {
                        cat: 'KCK',
                        stat: 'FGA',
                        op: '*',
                        pts: points
                    };
                case '9':
                    rangeMax = 39;
                    break;
                case '50':
                    rangeMax = 0;
                    break;
                default:
                    rangeMax = yards + 9;
            }
            return {
                cat: 'KCK',
                stat: 'FGA',
                op: '*',
                pts: points,
                instance: true,
                range_min: yards,
                range_max: rangeMax
            };
        }
    },
    'team defense / special teams': {
        KR(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: 'KRYD',
                op: '*',
                pts: points
            };
        },
        PR(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: 'PRYD',
                op: '*',
                pts: points
            };
        },
        SK(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'SCK',
                op: '*',
                pts: points
            };
        },
        TK(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'TCK',
                op: '*',
                pts: points
            };
        },
        INTTD(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: 'ITD',
                op: '*',
                pts: points
            };
        },
        FRTD(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: 'FRTD',
                op: '*',
                pts: points
            };
        },
        KRTD(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: 'KRTD',
                op: '*',
                pts: points
            };
        },
        PRTD(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: 'PRTD',
                op: '*',
                pts: points
            };
        },
        BLKKRTD(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: 'BLKTD',
                op: '*',
                pts: points
            };
        },
        BLKK(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: 'BLK',
                op: '*',
                pts: points
            };
        },
        INT(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'INT',
                op: '*',
                pts: points
            };
        },
        FR(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'FMR',
                op: '*',
                pts: points
            };
        },
        FF(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'FMF',
                op: '*',
                pts: points
            };
        },
        SF(label, abbrev, points) {
            if (label.indexOf('Stuffs') > -1) {
                return {
                    cat: 'TMD',
                    stat: 'STF',
                    op: '*',
                    pts: points
                };
            }
            return {
                cat: 'TMD',
                stat: 'SAF',
                op: '*',
                pts: points
            };
        },
        PD(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: 'PD',
                op: '*',
                pts: points
            };
        },
        PA(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'PD',
                op: '*',
                pts: points
            };
        },
        PA0(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'PA',
                op: '+',
                pts: points,
                range_min: '0',
                range_mix: '0'
            };
        },
        PA1(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'PA',
                op: '+',
                pts: points,
                range_min: '1',
                range_mix: '6'
            };
        },
        PA7(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'PA',
                op: '+',
                pts: points,
                range_min: '7',
                range_mix: '13'
            };
        },
        PA14(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'PA',
                op: '+',
                pts: points,
                range_min: '14',
                range_mix: '17'
            };
        },
        PA18(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'PA',
                op: '+',
                pts: points,
                range_min: '18',
                range_mix: '21'
            };
        },
        PA22(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'PA',
                op: '+',
                pts: points,
                range_min: '22',
                range_mix: '27'
            };
        },
        PA28(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'PA',
                op: '+',
                pts: points,
                range_min: '28',
                range_mix: '34'
            };
        },
        PA35(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'PA',
                op: '+',
                pts: points,
                range_min: '35',
                range_mix: '45'
            };
        },
        PA46(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'PA',
                op: '+',
                pts: points,
                range_min: '46'
            };
        },
        YA(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'YA',
                op: '*',
                pts: points
            };
        },
        YA100(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'YA',
                op: '+',
                pts: points,
                range_min: '0',
                range_mix: '99'
            };
        },
        YA199(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'YA',
                op: '+',
                pts: points,
                range_min: '100',
                range_mix: '199'
            };
        },
        YA299(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'YA',
                op: '+',
                pts: points,
                range_min: '200',
                range_mix: '299'
            };
        },
        YA349(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'YA',
                op: '+',
                pts: points,
                range_min: '300',
                range_mix: '349'
            };
        },
        YA399(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'YA',
                op: '+',
                pts: points,
                range_min: '350',
                range_mix: '399'
            };
        },
        YA449(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'YA',
                op: '+',
                pts: points,
                range_min: '400',
                range_mix: '449'
            };
        },
        YA499(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'YA',
                op: '+',
                pts: points,
                range_min: '450',
                range_mix: '499'
            };
        },
        YA549(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'YA',
                op: '+',
                pts: points,
                range_min: '500',
                range_mix: '549'
            };
        },
        YA550(label, abbrev, points) {
            return {
                cat: 'TMD',
                stat: 'YA',
                op: '+',
                pts: points,
                range_min: '550'
            };
        },
        '1PSF'(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: '1SF',
                op: '*',
                pts: points
            };
        },
        '2PTRET'(label, abbrev, points) {
            // Additional
            return {
                cat: 'TMD',
                stat: '2PR',
                op: '*',
                pts: points
            };
        }
    },
    'defensive players': {
        SK(label, abbrev, points) {
            return {
                cat: 'IDP',
                stat: 'SCK',
                op: '*',
                pts: points
            };
        },
        TK(label, abbrev, points) {
            return {
                cat: 'IDP',
                stat: 'TAC',
                op: '*',
                pts: points
            };
        },
        BLKK(label, abbrev, points) {
            // Additional
            return {
                cat: 'IDP',
                stat: 'BLK',
                op: '*',
                pts: points
            };
        },
        INT(label, abbrev, points) {
            return {
                cat: 'IDP',
                stat: 'INT',
                op: '*',
                pts: points
            };
        },
        FR(label, abbrev, points) {
            return {
                cat: 'IDP',
                stat: 'FMR',
                op: '*',
                pts: points
            };
        },
        FF(label, abbrev, points) {
            return {
                cat: 'IDP',
                stat: 'FMF',
                op: '*',
                pts: points
            };
        },
        SF(label, abbrev, points) {
            if (label.indexOf('Stuffs') > -1) {
                // Additional
                return {
                    cat: 'IDP',
                    stat: 'STF',
                    op: '*',
                    pts: points
                };
            }
            return {
                cat: 'IDP',
                stat: 'SAF',
                op: '*',
                pts: points
            };
        },
        TKA(label, abbrev, points) {
            // Additional
            return {
                cat: 'IDP',
                stat: 'TKA',
                op: '*',
                pts: points
            };
        },
        TKS(label, abbrev, points) {
            // Additional
            return {
                cat: 'IDP',
                stat: 'TKS',
                op: '*',
                pts: points
            };
        },
        PD(label, abbrev, points) {
            return {
                cat: 'IDP',
                stat: 'PD',
                op: '*',
                pts: points
            };
        }
    }
};

module.exports.SCORING_DEFAULT = [{
    cat: 'PASS',
    stat: 'YDS',
    op: '/',
    pts: '25'
}, {
    cat: 'PASS',
    stat: 'CMP',
    op: '*',
    pts: '0'
}, {
    cat: 'PASS',
    stat: 'TD',
    op: '*',
    pts: '4'
}, {
    cat: 'PASS',
    stat: 'INT',
    op: '*',
    pts: '-2'
}, {
    cat: 'PASS',
    stat: '2PT',
    op: '*',
    pts: '2'
}, {
    cat: 'PASS',
    stat: 'YDS',
    op: '+',
    pts: '0',
    range_min: '300',
    range_mix: '399'
}, {
    cat: 'PASS',
    stat: 'YDS',
    op: '+',
    pts: '0',
    range_min: '400'
}, {
    cat: 'PASS',
    stat: 'TD',
    instance: true,
    op: '*',
    pts: '0',
    range_min: '40',
    range_max: '49'
}, {
    cat: 'PASS',
    stat: 'TD',
    instance: true,
    op: '*',
    pts: '0',
    range_min: '50'
}, {
    cat: 'PASS',
    stat: 'ATT',
    op: '*',
    pts: '0'
}, {
    cat: 'PASS',
    stat: 'SCK',
    op: '*',
    pts: '0'
}, {
    cat: 'RUSH',
    stat: 'YDS',
    op: '/',
    pts: '10'
}, {
    cat: 'RUSH',
    stat: 'CAR',
    op: '*',
    pts: '0'
}, {
    cat: 'RUSH',
    stat: 'TD',
    op: '*',
    pts: '6'
}, {
    cat: 'RUSH',
    stat: '2PT',
    op: '*',
    pts: '2'
}, {
    cat: 'RUSH',
    stat: 'YDS',
    op: '+',
    pts: '0',
    range_min: '100',
    range_mix: '199'
}, {
    cat: 'RUSH',
    stat: 'YDS',
    op: '+',
    pts: '0',
    range_min: '200'
}, {
    cat: 'RUSH',
    stat: 'TD',
    instance: true,
    op: '*',
    pts: '0',
    range_min: '40',
    range_mix: '49'
}, {
    cat: 'RUSH',
    stat: 'TD',
    instance: true,
    op: '*',
    pts: '0',
    range_min: '50'
}, {
    cat: 'REC',
    stat: 'YDS',
    op: '/',
    pts: '10'
}, {
    cat: 'REC',
    stat: 'REC',
    op: '*',
    pts: '0'
}, {
    cat: 'REC',
    stat: 'TD',
    op: '*',
    pts: '6'
}, {
    cat: 'REC',
    stat: '2PT',
    op: '*',
    pts: '2'
}, {
    cat: 'REC',
    stat: 'YDS',
    op: '+',
    pts: '0',
    range_min: '100',
    range_mix: '199'
}, {
    cat: 'REC',
    stat: 'YDS',
    op: '+',
    pts: '0',
    range_min: '200'
}, {
    cat: 'REC',
    stat: 'TD',
    instance: true,
    op: '*',
    pts: '0',
    range_min: '40',
    range_mix: '49'
}, {
    cat: 'REC',
    stat: 'TD',
    instance: true,
    op: '*',
    pts: '0',
    range_min: '50'
}, {
    cat: 'FUM',
    stat: 'LOST',
    op: '*',
    pts: '-2'
}, {
    cat: 'KCK',
    stat: 'XPC',
    op: '*',
    pts: '1'
}, {
    cat: 'KCK',
    stat: 'XPM',
    op: '*',
    pts: '0'
}, {
    cat: 'KCK',
    stat: 'FGM',
    op: '*',
    pts: '-1'
}, {
    cat: 'KCK',
    stat: 'FGC',
    op: '*',
    pts: '3',
    instance: true,
    range_min: '0',
    range_mix: '39'
}, {
    cat: 'KCK',
    stat: 'FGC',
    op: '*',
    pts: '4',
    instance: true,
    range_min: '40',
    range_mix: '49'
}, {
    cat: 'KCK',
    stat: 'FGC',
    op: '*',
    pts: '5',
    instance: true,
    range_min: '50'
}, {
    cat: 'IDP',
    stat: 'TAC',
    op: '*',
    pts: '1'
}, {
    cat: 'IDP',
    stat: 'AST',
    op: '*',
    pts: '0.5'
}, {
    cat: 'IDP',
    stat: 'SCK',
    op: '*',
    pts: '2'
}, {
    cat: 'IDP',
    stat: 'FMF',
    op: '*',
    pts: '2'
}, {
    cat: 'IDP',
    stat: 'FMR',
    op: '*',
    pts: '2'
}, {
    cat: 'IDP',
    stat: 'PD',
    op: '*',
    pts: '1'
}, {
    cat: 'IDP',
    stat: 'SAF',
    op: '*',
    pts: '2'
}, {
    cat: 'IDP',
    stat: 'INT',
    op: '*',
    pts: '2'
}, {
    cat: 'IDP',
    stat: 'TD',
    op: '*',
    pts: '6'
}, {
    cat: 'TMD',
    stat: 'SCK',
    op: '*',
    pts: '1'
}, {
    cat: 'TMD',
    stat: 'FMF',
    op: '*',
    pts: '0'
}, {
    cat: 'TMD',
    stat: 'FMR',
    op: '*',
    pts: '2'
}, {
    cat: 'TMD',
    stat: 'SAF',
    op: '*',
    pts: '2'
}, {
    cat: 'TMD',
    stat: 'INT',
    op: '*',
    pts: '2'
}, {
    cat: 'TMD',
    stat: 'BLK',
    op: '*',
    pts: '2'
}, {
    cat: 'TMD',
    stat: 'TD',
    op: '*',
    pts: '6'
}, {
    cat: 'TMD',
    stat: 'PA',
    op: '+',
    pts: '5',
    range_min: '0',
    range_mix: '0'
}, {
    cat: 'TMD',
    stat: 'PA',
    op: '+',
    pts: '4',
    range_min: '1',
    range_mix: '6'
}, {
    cat: 'TMD',
    stat: 'PA',
    op: '+',
    pts: '3',
    range_min: '7',
    range_mix: '13'
}, {
    cat: 'TMD',
    stat: 'PA',
    op: '+',
    pts: '1',
    range_min: '14',
    range_mix: '17'
}, {
    cat: 'TMD',
    stat: 'PA',
    op: '+',
    pts: '0',
    range_min: '18',
    range_mix: '21'
}, {
    cat: 'TMD',
    stat: 'PA',
    op: '+',
    pts: '0',
    range_min: '22',
    range_mix: '27'
}, {
    cat: 'TMD',
    stat: 'PA',
    op: '+',
    pts: '-1',
    range_min: '28',
    range_mix: '34'
}, {
    cat: 'TMD',
    stat: 'PA',
    op: '+',
    pts: '-3',
    range_min: '35',
    range_mix: '45'
}, {
    cat: 'TMD',
    stat: 'PA',
    op: '+',
    pts: '-5',
    range_min: '46'
}, {
    cat: 'TMD',
    stat: 'YA',
    op: '+',
    pts: '5',
    range_min: '0',
    range_mix: '99'
}, {
    cat: 'TMD',
    stat: 'YA',
    op: '+',
    pts: '3',
    range_min: '100',
    range_mix: '199'
}, {
    cat: 'TMD',
    stat: 'YA',
    op: '+',
    pts: '2',
    range_min: '200',
    range_mix: '299'
}, {
    cat: 'TMD',
    stat: 'YA',
    op: '+',
    pts: '0',
    range_min: '300',
    range_mix: '349'
}, {
    cat: 'TMD',
    stat: 'YA',
    op: '+',
    pts: '-1',
    range_min: '350',
    range_mix: '399'
}, {
    cat: 'TMD',
    stat: 'YA',
    op: '+',
    pts: '-3',
    range_min: '400',
    range_mix: '449'
}, {
    cat: 'TMD',
    stat: 'YA',
    op: '+',
    pts: '-5',
    range_min: '450',
    range_mix: '499'
}, {
    cat: 'TMD',
    stat: 'YA',
    op: '+',
    pts: '-6',
    range_min: '500',
    range_mix: '549'
}, {
    cat: 'TMD',
    stat: 'YA',
    op: '+',
    pts: '-7',
    range_min: '550'
}, {
    cat: 'KR',
    stat: 'TD',
    op: '*',
    pts: '0'
}, {
    cat: 'KR',
    stat: 'YDS',
    op: '/',
    pts: '0'
}, {
    cat: 'PR',
    stat: 'TD',
    op: '*',
    pts: '0'
}, {
    cat: 'PR',
    stat: 'YDS',
    op: '/',
    pts: '0'
}];
