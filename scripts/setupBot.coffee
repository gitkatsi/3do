# Description:
#   startup info, setup and event printer.
#
# Dependencies:
#   none
#
# Configuration:
#   none
#
# Commands:
#   none
#
# Notes:
#
#
# Author:
#   palladas

server = require("./functions/gitListener.js")
em = server.emitter
module.exports = (robot) ->
    roomid = "372833397346664451" #Test room..
    robot.messageRoom roomid, "I just woke up! Give me a break!"
    robot.adapter.client.user.setGame("Yoda is our Lord and Saviour")
    #catch emit from gitListener and print the message
    em.on "gitEvent", (message) ->
        robot.messageRoom roomid, message

    