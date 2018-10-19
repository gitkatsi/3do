// Description:
//   Funny module to hide commands from users
//
// Dependencies:
//   none
//
// Configuration:
//   LIST_OF_ENV_VARS_TO_SET
//
// Commands:
//   3do funnyhelp - Responds with random unhelpful phrases
//
// Notes:
//
//
// Author:
//   palladas

module.exports = robot =>
    robot.respond(/funnyhelp/i, function(res) {
        const resArray = ["I am not here to help you",
            "Go away",
            "I'm just a reminder protocol droid, nothing fancy here",
            "I won't help you",
            "Nothing to see here, move along",
            "I'm not talking to you",
            "I think i will shut myself down",
            "Pffffffff",
            "I am GROOT. Oh wrong universe.",
            "Stop bothering me."];
        

        return res.send(res.random(resArray));
    })
;
