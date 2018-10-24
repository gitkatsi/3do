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
//   No command needed. I will alert you about git events and server problems
//
// Notes:
//
//
// Author:
//   Katsikiotis Georgios

const server = require("./functions/gitListener.js");
const em = server.emitter;
module.exports = function(robot) {
    const roomid = "372833397346664451"; //Test room..
    robot.messageRoom(roomid, "Ahhhhh!!! I just woke up.");
    robot.adapter.client.user.setGame("Judgment day is here");
    //catch emit from gitListener and print the message
    return em.on("gitEvent", message => robot.messageRoom(roomid, message));
};

    