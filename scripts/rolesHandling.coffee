# Description:
#   Adds and removes Roles to users
#
# Dependencies:
#   userPermissions.coffee
#
# Configuration:
#   LIST_OF_ENV_VARS_TO_SET
#
# Commands:
#   Roles <username> , <admin/poweruser/user> <add/remove>
#
# Notes:
#
#
# Author:
#   palladas



module.exports = (robot) ->
    robot.respond /role/i, (msg) ->
        user = require "./functions/userPermissions" #load the permissions script
        role = user.getUserRole(msg.message.user.id) #check user's role
        if String(role) is "admin"
            msg.send "Working on it..."
    #Split message string to check each string against valid inputs
            msgBody = String(msg.message).split(" ")
            roleObj = { username: "", id: "", role: "", action: "" }
            self = robot.adapter.client.user.username
            validCount = 0
    #Because of the nature of actions "security"
    #no regex was used but a helper message in case of error will be sent back
            #check if there is valid username in string
            for string in msgBody
                user = robot.adapter.client.users.find("username", string)
                if user? && string isnt self
                    roleObj.username = string
                    roleObj.id = robot.adapter.client.users.find("username", string).id
                    validCount = 1 #check if more than on username is found

            if validCount == 1
                for string in msgBody
                    if string.toLowerCase() is "admin"
                            roleObj.role = "admin"
                    if string.toLowerCase() is "poweruser"
                            roleObj.role = "poweruser"
                    if string.toLowerCase() is "user"
                            roleObj.role = "user"
                    if string.toLowerCase() is "add"
                            roleObj.action = "add"
                    if string.toLowerCase() is "remove"
                            roleObj.action = "remove"
            else if validCount > 1
                msg.send "I found more than one name that match users. Please be more specific"
            else if validCount == 0
                msg.send "No valid user. "+
                "Please look to the right of your screen and use the correct username."
            
            if validCount is 1 && roleObj.action != "remove"
                fewParamsMsg = "You didn't specify:"
                if roleObj.role is ""
                    fewParamsMsg = fewParamsMsg + "\nRole: " +
                    "You must include a role of Admin, Poweruser, or user."
                if roleObj.action is ""
                    fewParamsMsg = fewParamsMsg + "\nAction: " +
                    "You must tell me to add or delete user's role."
                if fewParamsMsg != "You didn't specify:"
                    msg.send fewParamsMsg

            if validCount is 1 && roleObj.role != "" && roleObj.action is "add"
                actionRole = require "./functions/userPermissions"
                actionRole.addRole roleObj.username, roleObj.id, roleObj.role, (status) ->
                    if status is true
                        msg.send "Role added."
                    else if status is false
                        msg.send "I failed you my Master"
            
            if validCount is 1 && roleObj.action is "remove"
                actionRole = require "./functions/userPermissions"
                actionRole.removeRole roleObj.id, (status) ->
                    if status is true
                        msg.send "Role Removed"
                    else if status is false
                        msg.send "I failed you my Master"
        else
            msg.send "I cannot allow you to do that!"

        