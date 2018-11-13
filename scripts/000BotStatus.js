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
//  No command needed. I will inform you if 000bot goes offline.
// Notes:
//
//
// Author:
//   Katsikiotis Georgios

module.exports = function (robot) {
  //set as constants the bot's discord ids room ids and user ids
  const roomID = "372833397346664451";
  const userID = "227833123897868289";
  const devBot = "436971323319779331";
  //client emits a presenceUpdate event. Check who is the user
  robot.client.on("presenceUpdate", (userBefore, userAfter) => {
    if (userAfter.id === devBot) {
      if (userAfter.presence.status === 'offline') {
        //sent message to room and user Palladas. 
        robot.messageRoom(roomID, "TripleZeroBot-Development went offline");
        robot.messageRoom(userID, "TripleZeroBot-Development went offline");
      } else if (userAfter.presence.status === 'online') {
        //sent message to room and user Palladas
        robot.messageRoom(roomID, "TripleZeroBot-Development Is back on line");
        robot.messageRoom(userID, "TripleZeroBot-Development Is back on line");
      }
    }
  });
};