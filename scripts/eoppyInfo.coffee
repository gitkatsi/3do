# Description:
#   Get info about docs from eoppy.
# Dependencies:
#   none
#
# Configuration:
#   LIST_OF_ENV_VARS_TO_SET
#
# Commands:
#   γιατρό + free text. I can understand you message
#
# Notes:
#
# Author:
#   palladas



docDetails = require "./functions/eoppy/getDoctors.coffee"

module.exports = (robot) ->
    robot.respond /γιατρό/i, (msg) ->
        docDetails.getDocsDetails String(msg.message), (details, duplies) ->
            if details.id is false
                details.id = ""
                details.docName = "Χωρίς ειδικότητα"
            exit = false
            if duplies != null & exit is false
                msg.send "Βρήκα παραπάνω από ένα αποτελέσματα για την πόλη " +
                "#{details.city} Δοκίμασε να ζητήσεις την πόλη μαζί με " +
                "έναν εκ των νομών που βρήκα " +
                "αντιστοιχία #{JSON.stringify(duplies)}"
                exit = true
            else if details.city is false && details.nomos != false && exit is false
                msg.send "Δεν μπόρεσα να βρώ την πόλη για τον νομό #{details.nomos}."
                exit = true
            else if details.nomos is false && duplies is null && exit is false
                msg.send "Δεν βρήκα αποτελέσματα για πόλη η νόμό από αυτά που μου γράφεις. Sorry!!!"
                exit = true
            else if exit is false
                info = require "./functions/eoppy/eoppyGeneral.coffee"
                url = "http://www.eopyy.gov.gr/MedSupplier/SelectNomosAndTypeFromCurrent?id=" +
                "#{details.nomos}&a_City=#{details.city}" +
                "&a_MedSupplierTypeID=1&a_MedDoctorEidikotitaID="
                info.getValidDocs url, (id) ->
                    if id.indexOf(details.id) < 0
                        msg.send "Δεν μπόρεσα να βρώ την" +
                        "ειδικότητα #{details.docName} \nΑκολουθούν" +
                        "τα στοιχεία όλων των γιατρών για την πόλη #{details.city}"
                        msg.send encodeURI(url + details.id)
                    else
                        msg.send "Ακολουθούν τα στοιχεία των γιατρών για την πόλη " +
                        "#{details.city} του νομού #{details.nomos} και " +
                        "με ειδικότητα #{details.docName}"
                        msg.send encodeURI(url + details.id)