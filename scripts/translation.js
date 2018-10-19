// Description:
//   Translates every message that is not in English language to English
//
// Dependencies:
//   none
//
// Configuration:
//   LIST_OF_ENV_VARS_TO_SET
//
// Commands:
//   No command needed. I will translate for you all the non english sentences. 
//
// Notes:
//
//
// Author:
//   Katsikiotis Georgios

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
