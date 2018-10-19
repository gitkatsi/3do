// Description:
//   Get info about docs from eoppy.
// Dependencies:
//   none
//
// Configuration:
//   LIST_OF_ENV_VARS_TO_SET
//
// Commands:
//   3do γιατρό + πόλη ή και νομό ή και ειδικότητα. Θα βρώ τι χρειάζεσαι αμέσως. 
//
// Notes:
//  Get info about doctors from ΕΟΠΥΥ
// Author:
//   palladas



const docDetails = require("./functions/eoppy/getDoctors.js");
const info = require("./functions/eoppy/eoppyGeneral");

module.exports = robot =>
    robot.respond(/γιατρό/i, msg =>
        docDetails.getDocsDetails(String(msg.message), function(details, duplies) {
            if (details.id === false) {
                details.id = -1;
                details.docName = "Χωρίς ειδικότητα";
            }
            let exit = false;
            if ((duplies !== null) & (exit === false)) {
                msg.send("Βρήκα παραπάνω από ένα αποτελέσματα για την πόλη " +
                `${details.city} Δοκίμασε να ζητήσεις την πόλη μαζί με ` +
                "έναν εκ των νομών που βρήκα " +
                `αντιστοιχία ${JSON.stringify(duplies)}`
                );
                return exit = true;
            } else if ((details.city === false) && (details.nomos !== false) && (exit === false)) {
                msg.send(`Δεν μπόρεσα να βρώ την πόλη για τον νομό ${details.nomos}.`);
                return exit = true;
            } else if ((details.nomos === false) && (duplies === null) && (exit === false)) {
                msg.send("Δεν βρήκα αποτελέσματα για πόλη η νόμό από αυτά που μου γράφεις. Sorry!!!");
                return exit = true;
            } else if (exit === false) {

                var urlAPI = `https://eopyy.gov.gr/api/v1/med/search/${details.id}/${details.nomos}/1/${details.city}`;
                var printUrl = `https://www.eopyy.gov.gr/suppliers/1/${details.id}/${details.nomos}/${details.city}`;
                console.log(urlAPI);
                return info.getValidDocs(urlAPI, function (expertiseExists) {
                    if (expertiseExists === false) {
                        msg.send("Δεν μπόρεσα να βρώ την" +
                        `ειδικότητα ${details.docName} \nΑκολουθούν` +
                        `τα στοιχεία όλων των γιατρών για την πόλη ${details.city}`
                        );
                        return msg.send(encodeURI(printUrl));
                    } else {
                        msg.send("Ακολουθούν τα στοιχεία των γιατρών για την πόλη " +
                        `${details.city} του νομού ${details.nomos} και ` +
                        `με ειδικότητα ${details.docName}`
                        );
                        return msg.send(encodeURI(printUrl));
                    }
                });
            }
        })
    )
;