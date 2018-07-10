fs          = require ("fs")
pathToFile  =  __dirname + "/configuration/"

exports.readFile = (fileName, cb) ->
    try
        #read file. if empty create an array and parse to to add 1st value
        if fs.existsSync pathToFile + fileName
            data = fs.readFileSync(pathToFile + fileName, 'utf8')
            if data is ""
                data = JSON.parse("[]")
            else
                data = JSON.parse(data)
            cb data, true
        else #if files does not exist create one and return an empty array
            try
                fs.writeFile pathToFile + fileName, "[]", (error) ->
                    data = JSON.parse("[]")
                    cb data, true
            catch error
                console.error error
                cb "File not found and couldn't create one", false
    catch error
        console.error error
        cb "It seems that i have misplaced the file #{fileName}. Sorry!!!", false

exports.writeFile = (newData, fileName, cb) ->
    newData = JSON.stringify(newData)
    try
      fs.writeFile pathToFile + fileName, newData, 'utf8', ()->
      cb true
    catch error
      console.error error
      false