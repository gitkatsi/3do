/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require(("fs"));
const pathToFile = __dirname + "/configuration/";

exports.readFile = function (fileName, cb) {
  let error;
  try {
    //read file. if empty create an array and parse to to add 1st value
    let data;
    if (fs.existsSync(pathToFile + fileName)) {
      data = fs.readFileSync(pathToFile + fileName, 'utf8');
      if (data === "") {
        data = JSON.parse("[]");
      } else {
        data = JSON.parse(data);
      }
      return cb(data, true);
    } else { //if files does not exist create one and return an empty array
      try {
        return fs.writeFile(pathToFile + fileName, "[]", function (error) {
          data = JSON.parse("[]");
          return cb(data, true);
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
    return cb(`It seems that i have misplaced the file ${fileName}. Sorry!!!`, false);
  }
};

exports.writeFile = function (newData, fileName, cb) {
  newData = JSON.stringify(newData);
  try {
    fs.writeFileSync(pathToFile + fileName, newData, 'utf8', function () {});
    return cb(true);
  } catch (error) {
    console.error(error);
    return false;
  }
};