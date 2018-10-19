// Description:
//   Gets info from http://swgohh.gg and reminds players of their payout position
//   It does not respond to commands and once per day broadcasts info on channel
//
// Dependencies:
//   none
//
// Configuration:
//   LIST_OF_ENV_VARS_TO_SET
//
// Commands:
//   No command needed. I will print your leaderboard places in every day base. 
//
// Notes:
//
//
// Author:
//   Katsikiotis Georgios

const parsePage = require(("./functions/pageParser"));
const playerInfo = require(("./configuration/players.json"));


//Setting up the message strings and class locator

//Set the class to look for in parser
const parseClass = '<div class="current-rank-value">';

// Set strings to print
const messageStart = "**Hello gents... This is your payout order for today. \n\n**";

const wrongPositionText =  " Cannot compute!!! Palladas promised me to fix my code!";

//Get last valid leaderboard position
const callPlace = (url, name, cb) =>
//call parser with url, class and get position as callback
    parsePage(url, parseClass, function(position) {
        try {
            let x;
            position = parseInt(position); //always convert to integer numbers from parsing
            let positionTd = null;
            if (position === 1) {
                positionTd = 2;
            } else if (position === 2) {
                positionTd = 1;
            }
            else {}
            if (positionTd === null) {
                x = `**${name}:**${wrongPositionText}`;
            } else {
                x = `**${name}**: Your position today is ${positionTd}`;
            }
            return cb(x, true);
        } catch (error) {
            console.error(error);
            return cb("false", false);
        }
    })
;

//start the robot
module.exports = function(robot) {

    //set a cronjob for every day post of position assignments
    let spamChat;
    const cronJob = require('cron').CronJob;
    //set the correct timezone
    const tz = 'Europe/Athens';
    new cronJob('00 00 13 * * 0-6', (function() { return spamChat(); }), null, true, tz);
    //test cronjob for every minute operation
    //new cronJob('0 */1 * * * *', (-> do spamChat), null, true, tz)
    return spamChat = function() {
        const roomid = "442259527438565378"; //public working room
        //roomid = "372833397346664451" #private room for testing
        robot.messageRoom(roomid, messageStart);
        //fetch info for every player(key) of object playerInfo
        return (() => {
            const result = [];
            for (let players in playerInfo) {
                const value = playerInfo[players];
                result.push(callPlace(value.url, players, function(cb, status) {
                    if (status === false) {
                        return robot.messageRoom(roomid, "I encountered an error. Sorry!!!!");
                    } else if (status === true) {
                        return robot.messageRoom(roomid, cb);
                    }
                }));
            }
            return result;
        })();
    };
};



