// Description:
//   retrieves status of predefined services and can restart them
//
// Dependencies:
//   child_process": "<module version>"
//   configuration/services.json
//
// Configuration:
//   LIST_OF_ENV_VARS_TO_SET
//
// Commands:
//   hubot <status> - shows the status of predefined services as Active/Inactive
//   hubot <restart> <service> - Restarts the service.
//   hubot <restart> you - I will restart myself.
// Notes:
//
//
// Author:
//   Katsikiotis Georgios

//-----------------Set variables----------------#
const statusCommand = "systemctl is-active";
const ResponseActive = ": is active";
const ResponseOther = ": Seems to have a problem. If you would like me " +
                "to restart the service type 3do restart <service name>";
const ResponseError = "My circuits seems to be broken. I cannot fetch the info you asked.";
const restartMsg = "I will try to restart the ";
const prohibitMessage = "I cannot allow you to do that. I will report this to my Master ";
const fileError = "I encountered an error while looking on my files. Sorry!!!";

//---------------call external js--------------#
const { exec } = require('child_process');
let services = null;

//call valid services from external file
const readServiceJson = function(cb) {
    try {
        const fs = require(("fs"));
        const pathToFile =  __dirname + "/configuration/services.json";

        services = JSON.parse(fs.readFileSync(pathToFile, 'utf8'));
        return cb(services, true);
    } catch (error) {
        console.error(error);
        return cb("It seems that i have misplaced the file services.json. Sorry!!!", false);
    }
};
//restart a service. Check if service is within scope of bot to avoid abuse
//TODO check on error or stderr

const restartService = function(service, password, cb) {
    
    const restartServCommand = `echo ${password} | sudo -S systemctl restart `;
    const cmd = restartServCommand + service;
    return exec(cmd, (error, stdout, stderr) => cb(`I have restarted the ${service}`));
};

const getServiceStatus = function(service, cb) {
    const cmd = statusCommand + service;
    return exec(cmd, function(error, stdout, stderr) {
//command "systemctl is-active" returns error code on inactive.
//We have to check on error stdout for string
        let msg;
        if (error) {
            if (String(stdout) === String("inactive\n")) { //output is followed by new line
                msg = service + ResponseOther;
                return cb(msg, null);
            } else {
                msg = service + ResponseOther;
                return cb(null, error);
            }
        } else if (stderr) {
            msg = service + ResponseOther;
            return cb(null, stderr);
        } else if (String(stdout) === String("active\n")) { //output is followed by new line
            msg = service + ResponseActive;
            return cb(msg, null);
        }
    });
};

//Check if user is valid for given command
const checkUser = function(userID, cb) {
    const user = require("./functions/userPermissions");
    const role = user.getUserRole(userID);
    //shell room id
    //validID = "1"
    if (String(role) === "admin") {
        cb(true);
        return;
    } else {
        cb(false);
        return;
    }
};

//Check if command to restart is a valid one and approved
const checkCommandToExec = (cmd, cb) =>
    readServiceJson(function(services, status) {
        const { password } = services.sudoSettings;
        if (status === false) {
            return cb(fileError, false);
        } else {
            let serviceExists;
            for (let value of Array.from(services.serviceName)) {
                if (String(cmd) === String(value)) {
                    serviceExists = true;
                    break;
                }
            }
            if (serviceExists === true) {
                restartService(cmd, password, function(cb) {});
                return cb(`I restarted ${cmd}`, true);
            } else {
                return cb("Maybe you should check status and see exactly " +
                "which service i can restart", false);
            }
        }
    })
;

//------------------Robot Section-----------------#
//Hear and respond to status message
//Todo Make a better regex
module.exports = function(robot) {
    robot.respond(/status/i, msg =>

//get userID of discord and check if it's ok to run the command
        checkUser(msg.message.user.id, function(check) {
            if (check === true) {
                return readServiceJson(function(services, status) {
                    if (status === true) {
                        return Array.from(services.serviceName).map((service) =>
                            getServiceStatus(service, function(response, error) {
                                if (response) {
                                    return msg.send(response);
                                } else if (error) {
                                    return msg.send(ResponseError);
                                }
                            }));
                    } else {
                        return msg.send(fileError);
                    }
                });
            } else {
                return msg.send(prohibitMessage);
            }
        })
    );

//Hear and respond to restart message
//if it contains restart and after that is followed by .service then do
    return robot.respond(/restart (.*)/i, function(msg) {
        let service = msg.match[1];
        if (
            (String(service.toLowerCase()) === "you") ||
            (String(service.toLowerCase()) === "yourself") ||
            (String(service.toLowerCase()) === "3do")
            ) {
            service = "3do.service";
        }

//get userID of discord and check if it's ok to run the command
        return checkUser(msg.message.user.id, function(check) {
            if (check === true) {
                if (String(service) === "3do.service") {
                   msg.send("I'll be back");
               }
            
                return checkCommandToExec(service, function(cb, status) {
                    if (status === true) {
                        return msg.send(cb);
                    } else {
                        return msg.send(cb);
                    }
                });
            } else {
                return msg.send(prohibitMessage);
            }
        });
    });
};
