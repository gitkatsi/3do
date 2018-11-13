/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Fuse = require("fuse.js");
const data = require("./fileManage.js");

const getCity = (cityIn, cb) =>

  data.readFile("location.json", function (locale, status) {
    const loc = {
      city: "",
      nomos: ""
    };
    let duplicateNomos = [];
    //set options for fuse search
    const options = {
      shouldSort: true,
      threshold: 0.2, //this value is set low in order to have more accurate results.
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 3,
      keys: [
        "cityName"
      ]
    };
    // start to find the city name by input
    const fuse = new Fuse(locale, options);
    let result = fuse.search(cityIn);

    // if no city is found.length of result is zero exit
    if (result.length <= 0) {
      loc.city = false;
      loc.nomos = false;
      return loc.status = false;
      //search again with corrected city name
    } else {
      let cityFixed = result[0].cityName;
      //search again for duplicate cities in nomous with correct city name
      result = fuse.search(cityFixed);
      cityFixed = result[0].cityName;
      const nomosFixed = result[0].nomosName;
      let duplicateFound = false;
      duplicateNomos = [nomosFixed];
      //if a city in another nomo is found stop and ask for more input.
      for (let i in result) {
        if (String(result[i].nomosName) !== String(nomosFixed)) {
          duplicateFound = true;
          duplicateNomos.push(result[i].nomosName);
        }
      }
      if (duplicateFound === false) {
        loc.city = cityFixed;
        loc.nomos = nomosFixed;
        return cb(loc, false, true);
      } else if (duplicateFound === true) {
        loc.city = result[0].cityName;
        loc.nomos = result[0].nomosName;
        return cb(loc, duplicateNomos, -1);
      }
    }
  });


const getNomos = (nomosIn, cb) =>
  data.readFile("location.json", function (data, status) {
    const options = {
      shouldSort: true,
      threshold: 0.2, //this value is set higher in order to have more abstract results.
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 2,
      keys: [
        "nomosName"
      ]
    };
    const fuse = new Fuse(data, options);
    const result = fuse.search(nomosIn);
    if (result.length <= 0) {
      return cb("", false);
    } else {
      return cb(result[0].nomosName, true);
    }
  });



const getDoc = (expertiseIn, cb) =>
  data.readFile("doctorsExpertise.json", function (expertise, status) {
    const options = {
      shouldSort: true,
      threshold: 0.3, //this value is set higher in order to have more abstract results.
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 3,
      keys: [
        "name"
      ]
    };
    const fuse = new Fuse(expertise, options);
    const result = fuse.search(expertiseIn);
    if (result.length <= 0) {
      return cb("", false);
    } else {
      return cb(result[0], true);
    }
  });

//function to remove articles from string Array and common words not in search terms
const getArticles = function (stringIn, cb) {
  const articles = [
    "ο", "η", "το", "του", "της", "τον", "τη", "την",
    "οι", "τα", "των", "τους", "τις", "στον", "στην",
    "ιατρό", "γιατρό", "γιατρο", "ιατρο", "στο", "στου", "πόλη", "πολη", "πόλης",
    "πολης", "νομός", "νομού", "νομό", "νομού"
  ];

  const options = {
    shouldSort: true,
    threshold: 0.1, //this value is set low to have more specific results on articles
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 4,
    keys: [
      "name"
    ]
  };

  const fuse = new Fuse(articles, options);
  const result = fuse.search(stringIn);
  if (result.length <= 0) {
    return cb(false);
  } else {
    return cb(true);
  }
};


exports.getDocsDetails = function (stringIn, cb) {
  //init finalData object as false. if a value is found it will be added so
  //we wont need to add more checks in our code to alter between true and false
  const finalData = {
    nomos: false,
    city: false,
    id: false,
    docName: false
  };
  let duplies = null;
  //1. split string to array
  const stringArray = stringIn.split(" ");
  stringArray.sort((a, b) => (b.length - (a.length)) || a.localeCompare(b));
  let i = 0;
  let iMax = stringArray.length;
  var getArticlesAsync = function () {
    const str = stringArray[i];
    if (i <= iMax) {
      getArticles(str, function (status) {
        if (status === true) {
          stringArray.splice(i, 1); //2.remove articles to clear search terms
          return i++;
        } else {
          return i++;
        }
      });
      return getArticlesAsync();
    }
  };
  getArticlesAsync();

  //3. Get doctors expertise and remove it from array. I use index to count position
  const index = 0;
  let exit = false;
  iMax = stringArray.length;
  i = 0;
  var getDocAsync = function () {
    const str = stringArray[i];
    if (i <= iMax) {
      getDoc(str, function (data, status) {
        if ((status === true) && (exit === false)) {
          finalData.id = data.id;
          finalData.docName = data.name;
          stringArray.splice(i, 1);
          exit = true;
          return i++;
        } else {
          return i++;
        }
      });
      return getDocAsync();
    }
  };
  getDocAsync();
  //4. Get nomo and remove it from array. I use index to count position
  exit = false;
  i = 0;
  iMax = stringArray.length;
  var getNomosAsync = function () {
    if ((exit === false) && (i <= iMax)) {
      const str = stringArray[i];
      getNomos(str, function (data, status) {
        if (status === true) {
          stringArray.splice(i, 1);
          finalData.nomos = data;
          exit = true;
          return i++;
        } else {
          return i++;
        }
      });
      return getNomosAsync();
    }
  };
  getNomosAsync();

  exit = false;
  //5 with reduced array
  i = 0;
  iMax = stringArray.length;
  var getCityAsync = function () {
    if (i <= stringArray.length) {
      const str = stringArray[i];
      getCity(str, function (data, duplicateList, status) {
        // if nomos is found then check if city is in the same nomo
        if ((status === true) && (finalData.nomos === false) && (exit === false)) {
          finalData.city = data.city;
          finalData.nomos = data.nomos;
          return exit = true;
          //if city is found and nomos was not then nomos is city's nomos
        } else if ((status === true) && (finalData.nomos === data.nomos) && (exit === false)) {
          finalData.city = data.city;
          return exit = true;
          //if duplicate nomos was found for city then
        } else if ((status === -1) && (exit === false) && (finalData.nomos !== false)) {
          finalData.city = data.city;
          duplies = null;
          return exit === true;
        } else if ((status === -1) && (exit === false) && (finalData.nomos === false)) {
          finalData.city = data.city;
          duplies = duplicateList;
          return exit === true;
        }
      });
      i++;

      return getCityAsync();
    }
  };
  getCityAsync();
  if ((finalData.city === false) && (finalData.nomos !== false)) {
    let str = finalData.nomos;
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const lastChar = str.length - 1; //length is position - 1 e.x: in god length is 3 but g is in position 0
    //fix genders in greek cities for more generic search for strings less than 5 chars
    if (str.charAt(lastChar) === "ς") {
      str = str.substring(0, str.length - 1);
    } else if (str.charAt(lastChar) === "υ") {
      str = str.substring(0, str.length - 1) + "ς";
    }
    return getCity(str, function (data, duplicateList, status) {
      finalData.city = data.city;
      return cb(finalData, duplies);
    });
  } else {
    return cb(finalData, duplies);
  }
};