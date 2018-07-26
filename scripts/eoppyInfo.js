// Description:
//   Get info about docs from eoppy.
// Dependencies:
//   none
//
// Configuration:
//   LIST_OF_ENV_VARS_TO_SET
//
// Commands:
//   γιατρό + free text. I can understand you message
//
// Notes:
//
// Author:
//   palladas



const docDetails = require("./functions/eoppy/getDoctors.js");

module.exports = robot =>
    robot.respond(/γιατρό/i, msg =>
        docDetails.getDocsDetails(String(msg.message), function(details, duplies) {
            if (details.id === false) {
                details.id = "";
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
                const info = require("./functions/eoppy/eoppyGeneral");
                var url = `https://eopyy.gov.gr/api/v1/med/search/-1/${details.nomos}/1/${details.city}`;
                return info.getValidDocs(url, function(id) {
                    if (id.indexOf(details.id) < 0) {
                        msg.send("Δεν μπόρεσα να βρώ την" +
                        `ειδικότητα ${details.docName} \nΑκολουθούν` +
                        `τα στοιχεία όλων των γιατρών για την πόλη ${details.city}`
                        );
                        return msg.send(encodeURI(url + details.id));
                    } else {
                        msg.send("Ακολουθούν τα στοιχεία των γιατρών για την πόλη " +
                        `${details.city} του νομού ${details.nomos} και ` +
                        `με ειδικότητα ${details.docName}`
                        );
                        return msg.send(encodeURI(url + details.id));
                    }
                });
            }
        })
    )
;