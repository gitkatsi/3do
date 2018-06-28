# Description:
#  Add and remove user roles and permissions.
#
#
###ExportFunctions
    getUserIDByName(<name>) returns id
    getUserNameByID(<id>) returns name
    getUserRole(<name> or <id>) returns role
    getUsersforRole(<role>) returns objct.name objct.id
    addRole(<name> or <id>) adds in json the name id and role returns true on success.
    ###

fs = require ("fs")
file =  "roles.json"
pathToFile =  __dirname + "/../configuration/" + file

readRolesFile = (cb) ->
    try
        #read file. if empty create an array and parse to to add 1st value
        if fs.existsSync pathToFile
            user = fs.readFileSync(pathToFile, 'utf8')
            if user is ""
                user = JSON.parse("[]")
            else
                user = JSON.parse(user)
            cb user, true
        else #if files does not exist create one and return an empty array
            try
                fs.writeFile pathToFile, "[]", (error) ->
                    user = JSON.parse("[]")
                    cb user, true
            catch error
                console.error error
                cb "File not found and couldn't create one", false
    catch error
        console.error error
        cb "It seems that i have missplaced the file #{file}. Sorry!!!", false

writeRolesFile = (newdata, cb) ->
    newdata = JSON.stringify(newdata)
    try
        fs.writeFile pathToFile, newdata, 'utf8', (cb) ->
        cb true
    catch error
        console.error error
        false

#Get user id from name takes as input the Name
exports.getUserIDByName = (name_In, cb) ->
    readRolesFile (users, status) ->
        if status is true
            i = 0
            found = false
            #traverse the array to find the value and exit while with found flag
            while i < users.length && found is false
                if users[i].name is name_In
                    found = true
                    ret = users[i].id
                else
                    ret = -1
                    i = i + 1
        else
            ret = -1
        return ret



#Get username from id takes as input the ID
exports.getUserNameByID = (id_In, cb) ->
    readRolesFile (users, status) ->
        if status is true
            i = 0
            found = false
            #traverse the array to find the value and exit while with found flag
            while i < users.length && found is false
                if users[i].name is id_In
                    found = true
                    ret = users[i].id
                else
                    i = i + 1
                    ret = -1

        else
            ret = -1
        return ret
                    

#get user Role by name  or ID
exports.getUserRole = (id_or_name, cb) ->
    readRolesFile (users, status) ->
        if status is true
            i = 0
            found = false
            #traverse the array to find the value and exit while with found flag
            while i <= users.length && found is false
                if users[i].name is id_or_name || users[i].id is id_or_name
                    users[i].role
                    found = true
                    ret = users[i].role
                else
                    ret = -1
                    i = i + 1
        else
            ret = -1
        ret


#get which users have a certain role. Returns an objct.name and objct.id

exports.getUsersforRole = (role_in, cb) ->
    readRolesFile (users, status) ->
        name = ""
        id = ""
        obj = {}
        objArray = []
        if status is true
            i = 0
            found = false
            #traverse the array to find the value and exit while with found flag

            while i < users.length && found is false
        
                if users[i].role is role_in
                    objArray.push({ "name": users[i].name, "id": users[i].id })
                i = i + 1
            ret = objArray
        else
            ret = -1
        return ret

exports.addRole = (name_in, id_in, role_in, cb) ->
    obj = {}
    objArray = []
    obj.name = name_in
    obj.id = id_in
    obj.role = role_in
    objArray.push ({ "name": obj.name, "id": obj.id, "role": obj.role })
    readRolesFile (users, status) ->
        if status is true
            i = 0
            found = false
            towrite = false
            while i < users.length && found is false
                if users[i].id is obj.id
                    found = true
                    console.log "Found in: " + i
                    users.splice(i, 1)
                else
                    i = i + 1
            users.push ({ "name": obj.name, "id": obj.id, "role": obj.role })
            writeRolesFile users, (status) ->
                cb status


exports.removeRole = (id_in, cb) ->
    readRolesFile (users, status) ->
        found = false
        i = 0
        if status is true
            while i < users.length && found is false
                if users[i].id is id_in
                    found = true
                    #"i doesn't increase and used as index. While, will exit with found value"
                    users.splice(i, 1) #remove the object from array'
                    writeRolesFile users, (status) -> #save to file
                        cb status
                else
                    i = i + 1


