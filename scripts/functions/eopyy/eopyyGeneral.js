let request = require("request");
const fileManage = require("./fileManage");
const emitter = require("events");
const em = new emitter();



//Function to post to page with parameters.
//Headers where needed to be set in order to prevent redirect loops
// Host Origin and Referer must be set or else API returns error. 
function getPageOptions(url, cb) {
  request = require('request');
  return request({
    method: 'GET',
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux i686) " +
        "AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.",
      "Host": "eopyy.gov.gr",
      "Origin": "https://www.eopyy.gov.gr",
      "Referer": "https://www.eopyy.gov.gr/suppliers/-1/-1/ALL/ALL"
    },
    uri: url,
    jar: true,

  }, function (error, response, body) {
    cb(error, response, body);
    if (error != null) {
      return console.error(`Error for url: \n\r ${url}`);
    }
  });
};


//EOPYY page changed. Preserve the format for other functions to avoid refactoring.

function getLocations(url, cb) {
  return new Promise(resolve => {
    url = "https://eopyy.gov.gr/api//v1/Customs/CountiesWithCities"
    getPageOptions(url, function (error, response, body) {
      var obj = JSON.parse(body);
      var locArray = new Array;
      let i = 0;
      var city = null;
      var cityNm = null;

      for (let i = 0; i < obj.length; i++) {
        var nomos = obj[i].Name;
        city = obj[i].Cities;
        //dont use value for nomos where nomos is not specified.
        if (nomos != "ΑΚΑΘΟΡΙΣΤΟΣ ΝΟΜΟΣ") {
          for (let j = 0; j < city.length; j++) {
            let locationObj = {};
            cityNm = city[j].Name;
            locationObj.nomosName = nomos;
            locationObj.cityName = cityNm;
            locArray.push(locationObj);
          }

        }
      }
      resolve(locArray)
    })
  })
}

function getExpertise(url, cb) {
  return new Promise(resolve => {
    url = "https://eopyy.gov.gr/api/v1/med/specialties/1"
    getPageOptions(url, function (error, response, body) {
      //console.log(body);
      let expertise = JSON.parse(body);
      const expertiseArray = [];
      let i = 0;
      while (i < expertise.length) {
        const id = expertise[i].ID;
        const name = expertise[i].Description;
        i = i + 1;
        expertiseArray.push({
          "id": id,
          "name": name
        });
      }
      resolve(expertiseArray)
    })
  })
}

function getValidDocs(urlin, cb) {
  urlin = encodeURI(urlin);
  getPageOptions(urlin, function (error, response, body) {
    console.log(body);
    if (JSON.parse(body).length > 0) {
      cb(true);
    } else {
      cb(false);
    }

  })
}

async function getAll() {
  var location = await getLocations(); //wait function and
  fileManage.writeFile(location, "location.json", function (cb) {
    if (cb === true) {
      console.log("Saved the locations file");
    } else {
      console.log("Failed to write the locations file")
    }
  })

  var expertise = await getExpertise();
  fileManage.writeFile(expertise, "doctorsExpertise.json", function (status) {
    if (status === true) {
      console.log("Saved the doctors expertise file");
      em.emit("end");
    } else {
      console.log("Failed to write the doctors expertise file");
    }
  });


}

const cronJob = require('cron').CronJob;
//set the correct timezone
const tz = 'Europe/Athens';
new cronJob('00 00 13 * * 0-6', (function () {
  return getAll();
}), null, true, tz);

//get info once and then set interval
getAll();

interval = 1000 * 60 * 60 * 24
console.log(`Fetching info for eopyy doctors every ${interval/(1000*60*60)} hours`)
setInterval(getAll, interval);

module.exports = {
  getValidDocs: getValidDocs
};