// Description:
//   Translates every message that is not in english language to english
//
// Dependencies:
//   none
//
// Configuration:
//   LIST_OF_ENV_VARS_TO_SET
//
// Commands:
//   none
//
// Notes:
//
//
// Author:
//   palladas

module.exports = robot =>
    robot.catchAll(function(msg) {
        const transl =  String(msg.message);

        if (msg.message.room === "372833397346664451") {
            //Include source file of free google translate
            const translate = require("node-google-translate-skidz");
            return translate({ text: transl, source: 'auto', target: 'en' }, function(result) {
                if (result.src !== "en") {
                    msg.send("```This is an automated translated " +
                    `message of user: ${msg.message.user.name} \`\`\``
                    );
                    return msg.send(result.translation);
                }
            });
        }
    })
;
