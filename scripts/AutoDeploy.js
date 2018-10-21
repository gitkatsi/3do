// Description:
//   AutoDeploy message
//
// Dependencies:
//   none
//
// Configuration:
//   none
//
// Commands:
//   No command needed. I Will backup and deploy the 000bot pushing info about the procedure in this chatrooom
//
// Notes:
//
//
// Author:
//   Katsikiotis Georgios


//todo. start from here the nodejs autodeployment tool

const fs = require("fs");
const event = require("events"); //add event module
var eventEmitter = new event; //create new event emitter
const path = require("path")

watchPath = path.join(__dirname, "..", "..", "..", "bot")
function fileWatchOneEvent() {
const watcher = fs.watch(watchPath, (event, filename) => {
  watcher.close();
  if (event === "change") {
    eventEmitter.emit("change", filename)
  }
  else if(event === "rename"){
    eventEmitter.emit("rename", filename)
  }
  
  setTimeout(fileWatchOneEvent, 5000)
})
}
//fire up the folder watcher
fileWatchOneEvent();


console.log("Initiating auto deploy module")
module.exports = function (robot) {
  const roomid = "372833397346664451"; //Test room.
  const tsitaId = "370484667087978496"

  eventEmitter.on("change", filename => {
    const messageChange = `AutoDeploy has been completed`
    robot.messageRoom(roomid, messageChange)
    robot.messageRoom(userID, "AutoDeploy has been completed");
  });
    eventEmitter.on("rename", filename => {
      const messageAddRemove = `AutoDeploy has been completed`
      robot.messageRoom(roomid, messageAddRemove)
      robot.messageRoom(userID, "AutoDeploy has been completed");
    });

  };