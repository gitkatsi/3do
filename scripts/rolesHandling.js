// Description:
//   Adds and removes Roles to users
//
// Dependencies:
//   userPermissions.js
//
// Configuration:
//   LIST_OF_ENV_VARS_TO_SET
//
// Commands:
//   Roles <username> , <admin/poweruser/user> <add/remove> I will handle roles for you. 
//
// Notes:
//
//
// Author:
//   Katsikiotis Georgios



module.exports = robot =>
    robot.respond(/role/i, function(msg) {
        let user = require("./functions/userPermissions.js"); //load the permissions script
        const role = user.getUserRole(msg.message.user.id); //check user's role
        if (String(role) === "admin") {
            let actionRole;
            msg.send("Working on it...");
    //Split message string to check each string against valid inputs
            const msgBody = String(msg.message).split(" ");
            const roleObj = { username: "", id: "", role: "", action: "" };
            const self = robot.adapter.client.user.username;
            let validCount = 0;
    //Because of the nature of actions "security"
    //no regex was used but a helper message in case of error will be sent back
            //check if there is valid username in string
            for (var string of Array.from(msgBody)) {
                user = robot.adapter.client.users.find("username", string);
                if ((user != null) && (string !== self)) {
                    roleObj.username = string;
                    roleObj.id = robot.adapter.client.users.find("username", string).id;
                    validCount = 1; //check if more than on username is found
                }
            }

            if (validCount === 1) {
                for (string of Array.from(msgBody)) {
                    if (string.toLowerCase() === "admin") {
                            roleObj.role = "admin";
                        }
                    if (string.toLowerCase() === "poweruser") {
                            roleObj.role = "poweruser";
                        }
                    if (string.toLowerCase() === "user") {
                            roleObj.role = "user";
                        }
                    if (string.toLowerCase() === "add") {
                            roleObj.action = "add";
                        }
                    if (string.toLowerCase() === "remove") {
                            roleObj.action = "remove";
                        }
                }
            } else if (validCount > 1) {
                msg.send("I found more than one name that match users. Please be more specific");
            } else if (validCount === 0) {
                msg.send("No valid user. "+
                "Please look to the right of your screen and use the correct username."
                );
            }
            
            if ((validCount === 1) && (roleObj.action !== "remove")) {
                let fewParamsMsg = "You didn't specify:";
                if (roleObj.role === "") {
                    fewParamsMsg = fewParamsMsg + "\nRole: " +
                    "You must include a role of Admin, Poweruser, or user.";
                }
                if (roleObj.action === "") {
                    fewParamsMsg = fewParamsMsg + "\nAction: " +
                    "You must tell me to add or delete user's role.";
                }
                if (fewParamsMsg !== "You didn't specify:") {
                    msg.send(fewParamsMsg);
                }
            }

            if ((validCount === 1) && (roleObj.role !== "") && (roleObj.action === "add")) {
                actionRole = require("./functions/userPermissions");
                actionRole.addRole(roleObj.username, roleObj.id, roleObj.role, function(status) {
                    if (status === true) {
                        return msg.send("Role added.");
                    } else if (status === false) {
                        return msg.send("I failed you my Master");
                    }
                });
            }
            
            if ((validCount === 1) && (roleObj.action === "remove")) {
                actionRole = require("./functions/userPermissions");
                return actionRole.removeRole(roleObj.id, function(status) {
                    if (status === true) {
                        return msg.send("Role Removed");
                    } else if (status === false) {
                        return msg.send("I failed you my Master");
                    }
                });
            }
        } else {
            return msg.send("I cannot allow you to do that!");
        }
    })
;

        