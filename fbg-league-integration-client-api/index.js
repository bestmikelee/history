import 'babel-polyfill';
import * as yahoo from './lib/yahoo';
import * as lib from './lib';
import * as nfl from './lib/nfl';
import * as mfl from './lib/mfl';
import * as rtsports from './lib/rtsports';

window.LICA = (function() {
    function bindHost(host) {
        return {
            getLeagues: lib.getLeagues.bind(undefined, host),
            getRosters: lib.getRosters.bind(undefined, host)
        };
    }
    const hosts = {
        esp: bindHost('espn'),
        cbs: bindHost('cbs'),
        ffpc: bindHost('ffpc'),
        yahoo,
        mfl,
        flea: bindHost('fleaflicker'),
        nfl,
        rt: rtsports
    };
    /* 
        {
            host: @string,
            type: @string,
            username: @string,
            email: @string - only for RTSports
            password: @string,
            leagueId: @string
            access_token: @string - to bind userId,
            leagueSecondaryId: @string - for yah, mfl, nfl, rtsports,
            force: @boolean - forcing roster response
        }
    */
    const getFunc = function(obj) {
        obj.teamId = obj.leagueSecondaryId;
        let returnFunc;
        if (obj.type === 'rosters') {
            returnFunc = hosts[obj.host].getRosters(obj);
        } else if (obj.type === 'leagues') {
            returnFunc = hosts[obj.host].getLeagues(obj);
        } else {
            returnFunc = Promise.reject({
                licaError:
                    'type parameter should be either \'rosters\' or \'leagues\''
            });
        }
        return returnFunc;
    };

    function unlink({ host, ffLeagueId, leagueId, access_token }) {
        return lib.unlink.bind(undefined, {
            host,
            ffLeagueId,
            leagueId,
            access_token
        });
    }

    return {
        get: getFunc,
        unlink,
        logout: lib.logout
    };
})();
