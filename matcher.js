const db = require("./db");

module.exports = (user) => {
    ;(async () => {
        // the below arrays will contain the id's of other users
        let citymatches = [];
        let matches = [];
        // get client from connection pool
        const client = await db.connect();
        // query for all users with the opposite type of the user passed in the argument
        const res = await client.query('SELECT * FROM users WHERE type = $1',[user.type === "RU"]);
        // loop through those users
        for (let n=0;n<res.rows.length;n++) {
            let r = res.rows[n];
            if (r.type === true) {
                // query for getting the sponsor information of the user previously queried for.
                const sponsorres = await client.query('SELECT * FROM sponsors WHERE id = $1', [r.sponsorid]);
                let sr = sponsorres.rows[0];
                // add to match variables if matching
                if (sr.city === user.prefcity) {
                    citymatches += r.id;
                }
                let familycompcheck = true;
                if (r.familycomp === "SM") {
                    familycompcheck = (user.familycomp !== "SF");
                }
                if (sr.country === user.prefcountry &&
                    sr.accommodatenum >= user.accommodatenum &&
                    sr.pets >= user.pets && familycompcheck) {
                    matches += r.id;
                }
            } else {
                // query for getting the sponsor information of the user previously queried for.
                const refugeeres = await client.query('SELECT * FROM refugees WHERE id = $1', [r.refugeeid])
                let rr = refugeeres.rows[0];
                // add to match variables if matching
                if (rr.prefcity === user.city) {
                    citymatches += r.id;
                }
                let familycompcheck = true;
                if (user.familycomp === "SM") {
                    familycompcheck = (r.familycomp !== "SF");
                }
                if (rr.prefcountry === user.country &&
                    user.accommodatenum >= rr.persons &&
                    user.pets >= rr.pets && familycompcheck) {
                    matches += r.id;
                }
            }
        }

        // now that the match variables are populated, an entry will be made in the matches table for each match
        // this will loop through all matches
        for (let n=0;n<matches.length;n++) {
            let matchScore = 0; // default matchScore for only matching country
            if (citymatches.indexOf(matches[n]) !== -1) matchScore++; // adds to matchScore if city also matches
            // this is the query for getting the id of the last match entry
            const lastMatchRes = await client.query('SELECT id FROM matches ORDER BY id DESC LIMIT 1');
            // if the query returns no results, the new id should be 1
            let matchId = (lastMatchRes.rows[0]) ? lastMatchRes.rows[0].id + 1 : 1;
            client.query('INSERT INTO matches (id,matchscore,firstUserId,secondUserId) values ($1,$2,$3,$4)', [matchId, matchScore, user.id, matches[n]])
        }
        client.release() // releases client back to the connection pool
    })()
}