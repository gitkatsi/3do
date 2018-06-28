# Description:
#   Gets info from swgohh and reminds players of their payout position
#   It does not respond to commands and once per day broadcasts info on channel
#
# Dependencies:
#   none
#
# Configuration:
#   LIST_OF_ENV_VARS_TO_SET
#
# Commands:
#   none
#
# Notes:
#
#
# Author:
#   palladas

parsepage = require ("./functions/pageparser")
playerinfo = require ("./configuration/players.json")


#Seting up the message strings and class locator

#Set the class to look for in parser
parseClass = '<div class="current-rank-value">'

# Set strings to print
messageStart = "**Hello gents... This is your payout order for today. \n\n**"

wrongPostitionText =  " Cannot compute!!! Palladas promised me to fix my code!"

#Get last valid leaderboard position
callplace = (url, name, cb) ->
#call parser with url, class and get position as callback
    parsepage url, parseClass, (position) ->
        try
            position = parseInt(position) #always convert to integer numbers from parsing
            positiontd = null
            if position is 1
                positiontd = 2
            else if position is 2
                positiontd = 1
            else
            if positiontd is null
                x = "**" + name + ":**" + wrongPostitionText
            else
                x = "**" + name + "**" + ": Your position today is " + positiontd
            cb x, true
        catch error
            console.error error
            cb "false", false

#start the robot
module.exports = (robot) ->

    #set a cronjob for every day post of position assignments
    cronJob = require('cron').CronJob
    #set the correct timezone
    tz = 'Europe/Athens'
    new cronJob('00 00 13 * * 0-6', (-> do spamChat), null, true, tz)
    #test cronjob for every minute operation
    #new cronJob('0 */1 * * * *', (-> do spamChat), null, true, tz)
    spamChat = ->
        roomid = "442259527438565378" #public working room
        #roomid = "372833397346664451" #private room for testing
        robot.messageRoom roomid, messageStart
        #fetch info for every player(key) of object playerinfo
        for players, value of playerinfo
            callplace value.url, players, (cb, status) ->
                if status is false
                    robot.messageRoom roomid, "I encountered an error. Sorry!!!!"
                else if status is true
                    robot.messageRoom roomid, cb


