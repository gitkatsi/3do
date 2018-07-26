const fs = require(("fs"));
const file =  "roles.json";
const pathToFile =  __dirname + "/../configuration/" + file;

const readRolesFile = function(cb) {
    let error;
    try {
        //read file. if empty create an array and parse to to add 1st value
        let user;
        if (fs.existsSync(pathToFile)) {
            user = fs.readFileSync(pathToFile, 'utf8');
            if (user === "") {
                user = JSON.parse("[]");
            } else {
                user = JSON.parse(user);
            }
            return cb(user, true);
        } else { //if files does not exist create one and return an empty array
            try {
                return fs.writeFile(pathToFile, "[]", function(error) {
                    user = JSON.parse("[]");
                    return cb(user, true);
                });
            } catch (error1) {
                error = error1;
                console.error(error);
                return cb("File not found and couldn't create one", false);
            }
        }
    } catch (error2) {
        error = error2;
        console.error(error);
        return cb(`It seems that i have misplaced the file ${file}. Sorry!!!`, false);
    }
};

const writeRolesFile = function(newData, cb) {
    newData = JSON.stringify(newData);
    try {
        fs.writeFile(pathToFile, newData, 'utf8', function(cb) {});
        return cb(true);
    } catch (error) {
        console.error(error);
        return false;
    }
};

//Get user id from name takes as input the Name
exports.getUserIDByName = (name_In, cb) =>
    readRolesFile(function(users, status) {
        let ret;
        if (status === true) {
            let i = 0;
            let found = false;
            //traverse the array to find the value and exit while with found flag
            while ((i < users.length) && (found === false)) {
                if (users[i].name === name_In) {
                    found = true;
                    ret = users[i].id;
                } else {
                    ret = -1;
                    i = i + 1;
                }
            }
        } else {
            ret = -1;
        }
        return ret;
    })
;



//Get username from id takes as input the ID
exports.getUserNameByID = (id_In, cb) =>
    readRolesFile(function(users, status) {
        let ret;
        if (status === true) {
            let i = 0;
            let found = false;
            //traverse the array to find the value and exit while with found flag
            while ((i < users.length) && (found === false)) {
                if (users[i].name === id_In) {
                    found = true;
                    ret = users[i].id;
                } else {
                    i = i + 1;
                    ret = -1;
                }
            }

        } else {
            ret = -1;
        }
        return ret;
    })
;
                    

//get user Role by name  or ID
exports.getUserRole = (id_or_name, cb) =>
    readRolesFile(function(users, status) {
        let ret;
        if (status === true) {
            let i = 0;
            let found = false;
            //traverse the array to find the value and exit while with found flag
            while ((i <= users.length) && (found === false)) {
                if ((users[i].name === id_or_name) || (users[i].id === id_or_name)) {
                    users[i].role;
                    found = true;
                    ret = users[i].role;
                } else {
                    ret = -1;
                    i = i + 1;
                }
            }
        } else {
            ret = -1;
        }
        return ret;
    })
;


//get which users have a certain role. Returns an obj.name and obj.id

exports.getUsersForRole = (role_in, cb) =>
    readRolesFile(function(users, status) {
        let ret;
        const name = "";
        const id = "";
        const obj = {};
        const objArray = [];
        if (status === true) {
            let i = 0;
            const found = false;
            //traverse the array to find the value and exit while with found flag

            while ((i < users.length) && (found === false)) {
        
                if (users[i].role === role_in) {
                    objArray.push({ "name": users[i].name, "id": users[i].id });
                }
                i = i + 1;
            }
            ret = objArray;
        } else {
            ret = -1;
        }
        return ret;
    })
;

exports.addRole = function(name_in, id_in, role_in, cb) {
    const obj = {};
    const objArray = [];
    obj.name = name_in;
    obj.id = id_in;
    obj.role = role_in;
    objArray.push(({ "name": obj.name, "id": obj.id, "role": obj.role }));
    return readRolesFile(function(users, status) {
        if (status === true) {
            let i = 0;
            let found = false;
            const toWrite = false;
            while ((i < users.length) && (found === false)) {
                if (users[i].id === obj.id) {
                    found = true;
                    console.log(`Found in: ${i}`);
                    users.splice(i, 1);
                } else {
                    i = i + 1;
                }
            }
            users.push(({ "name": obj.name, "id": obj.id, "role": obj.role }));
            return writeRolesFile(users, status => cb(status));
        }
    });
};


exports.removeRole = (id_in, cb) =>
    readRolesFile(function(users, status) {
        let found = false;
        let i = 0;
        if (status === true) {
            return (() => {
                const result = [];
                while ((i < users.length) && (found === false)) {
                    if (users[i].id === id_in) {
                        found = true;
                        //"i doesn't increase and used as index. While, will exit with found value"
                        users.splice(i, 1); //remove the object from array'
                        result.push(writeRolesFile(users, status => //save to file
                            cb(status)
                        ));
                    } else {
                        result.push(i = i + 1);
                    }
                }
                return result;
            })();
        }
    })
;


