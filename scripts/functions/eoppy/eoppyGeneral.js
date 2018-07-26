let request = require("request");
const fileManage = require("./fileManage");




//Function to post to page with parameters.
//Headers where needed to be set in order to prevent redirect loops
// Host Origin and Referer must be set or else API returns error. 
function getPageOptions (url, cb) {
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
    for(let i=0; i<obj.length; i++){
      var nomos = obj[i].Name;
      city = obj[i].Cities;
      //dont use value for nomos where nomos is not specified.
      if (nomos != "ΑΚΑΘΟΡΙΣΤΟΣ ΝΟΜΟΣ"){  
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
  url = "https://eopyy.gov.gr/api/v1/med/specialties"
  getPageOptions(url, function (error, response, body) {
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


function getValidDocs(urlin, cb){
console.log(urlin);
url = encodeURI(urlin);
getPageOptions(url, function (error, response, body) {
      console.log(body);
})
}

async function getAll(){
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
         } else {
           console.log("Failed to write the doctors expertise file");
         }
       });
}

getAll();

module.exports = {getValidDocs: getValidDocs};