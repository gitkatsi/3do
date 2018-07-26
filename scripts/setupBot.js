// Description:
//   startup info, setup and event printer.
//
// Dependencies:
//   none
//
// Configuration:
//   none
//
// Commands:
//   none
//
// Notes:
//
//
// Author:
//   palladas

const server = require("./functions/gitListener.js");
const em = server.emitter;
module.exports = function(robot) {
    const roomid = "372833397346664451"; //Test room..
    robot.messageRoom(roomid, "I just woke up! Give me a break!");
    robot.adapter.client.user.setGame("Yoda is our Lord and Saviour");
    //catch emit from gitListener and print the message
    return em.on("gitEvent", message => robot.messageRoom(roomid, message));
};

    