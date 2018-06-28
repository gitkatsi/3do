# Description:
#   Translates every message that is not in english language to english
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

module.exports = (robot) ->
    robot.catchAll (msg) ->
        transl =  String(msg.message)

        if msg.message.room is "372833397346664451"
            #Include source file of free google translate
            translate = require("node-google-translate-skidz")
            translate { text: transl, source: 'auto', target: 'en' }, (result) ->
                if result.src != "en"
                    msg.send "```This is an automated translated " +
                    "message of user: #{msg.message.user.name} ```"
                    msg.send result.translation
