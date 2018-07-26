# Description:
#   retrieves status of predefined services and can restart them
#
# Dependencies:
#   child_process": "<module version>"
#   configuration/services.json
#
# Configuration:
#   LIST_OF_ENV_VARS_TO_SET
#
# Commands:
#   hubot <status> - shows the status of predefined services as Active/Inactive
#   hubot <restart> <service> - Restarts the service.
# Notes:
#
#
# Author:
#   Palladas

#-----------------Set variables----------------#
statusCommand   = "systemctl is-active "
ResponseActive  = ": is active"
ResponseOther   = ": Seems to have a problem. If you would like me " +
                    "to restart the service type 3do restart <service name>"
ResponseError   = "My circuits seems to be broken. I cannot fetch the info you asked."
restartMsg      = "I will try to restart the "
prohibitMessage = "I cannot allow you to do that. I will report this to my Master "
fileError       = "I encountered an error while looking on my files. Sorry!!!"

#---------------call external js--------------#
exec        = require('child_process').exec
cronJob     = require('cron').CronJob
services    = null

#call valid services from external file
readServiceJson = (cb) ->
    try
        fs = require ("fs")
        pathToFile =  __dirname + "/configuration/services.json"

        services = JSON.parse(fs.readFileSync(pathToFile, 'utf8'))
        cb services, true
    catch error
        console.error error
        cb "It seems that i have misplaced the file services.json. Sorry!!!", false
#restart a service. Check if service is within scope of bot to avoid abuse
#TODO check on error or stderr

restartService = (service, password, cb) ->
    
    restartServCommand = "echo #{password} | sudo -S systemctl restart "
    cmd = restartServCommand + service
    exec cmd, (error, stdout, stderr) ->
        cb "I have restarted the " + service

getServiceStatus = (service, cb) ->
    cmd = statusCommand + service
    exec cmd, (error, stdout, stderr) ->
#command "systemctl is-active" returns error code on inactive.
#We have to check on error stdout for string
        if error
            if String(stdout) is String("inactive\n") #output is followed by new line
                msg = service + ResponseOther
                cb msg, null
            else
                msg = service + ResponseOther
                cb null, error
        else if stderr
            msg = service + ResponseOther
            cb null, stderr
        else if String(stdout) is String("active\n") #output is followed by new line
            msg = service + ResponseActive
            cb msg, null

#Check if user is valid for given command
checkUser = (userID, cb) ->
    user = require "./functions/userPermissions"
    role = user.getUserRole(userID)
    #shell room id
    #validID = "1"
    if String(role) is "admin"
        cb true
        return
    else
        cb false
        return

#Check if command to restart is a valid one and approved
checkCommandToExec = (cmd, cb) ->
    readServiceJson (services, status) ->
        password = services.sudoSettings.password
        if status is false
            cb fileError, false
        else
            for value in services.serviceName
                if String(cmd) is String(value)
                    serviceExists = true
                    break
            if serviceExists is true
                restartService cmd, password, (cb) ->
                cb "I restarted " + cmd, true
            else
                cb "Maybe you should check status and see exactly " +
                "which service i can restart", false

#------------------Robot Section-----------------#
#Hear and respond to status message
#Todo Make a better regex
module.exports = (robot) ->
    robot.respond /status/i, (msg) ->

#get userID of discord and check if it's ok to run the command
        checkUser msg.message.user.id, (check) ->
            if check is true
                readServiceJson (services, status) ->
                    if status is true
                        for service in services.serviceName
                            getServiceStatus service, (response, error) ->
                                if response
                                    msg.send response
                                else if error
                                    msg.send ResponseError
                    else
                        msg.send fileError
            else
                msg.send prohibitMessage

#Hear and respond to restart message
#if it contains restart and after that is followed by .service then do
    robot.respond /restart (.*)/i, (msg) ->
        service = msg.match[1]
        if (
            String(service.toLowerCase()) is "you" or
            String(service.toLowerCase()) is "yourself" or
            String(service.toLowerCase()) is "3do"
            )
            service = "3do.service"

#get userID of discord and check if it's ok to run the command
        checkUser msg.message.user.id, (check) ->
            if check is true
                if String(service) is "3do.service"
                   msg.send "I'll be back"
            
                checkCommandToExec service, (cb, status) ->
                    if status is true
                        msg.send cb
                    else
                        msg.send cb
            else
                msg.send prohibitMessage
