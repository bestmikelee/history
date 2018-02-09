'use strict';

module.exports.unauthorized = () => {
    throw 'INCORRECT USERNAME OR PASSWORD';
};

module.exports.unavailable = () => {
    throw 'MFL\'s API seems to have trouble producing data for your leauge.  Please send them a support ticket saying their roster API is not working at the moment.';
};

module.exports.undrafted = () => {
    throw 'We couldn\'t find any rosters for this league. Please make sure your draft results have been entered and finalized on the league host. It\'s possible rosters might even be showing but your commissioner has not finalized the draft results. Please double check with the commissioner that they are both entered and finalized; if so please contact us at apps@footballguys.com so we can look into this further for you';
};

module.exports.generic = () => {
    throw 'There was an error when gathering your league information.  Please contact us at apps@footballguys.com so we can look further into this for you.';
};
