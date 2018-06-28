Fuse = require("fuse.js")
data = require "./fileManage.coffee"

getCity = (cityIn, cb) ->
  
  data.readFile "location.json", (locale, status) ->
    loc = { city: "", nomos: "" }
    duplicateNomos = []
  #set options for fuse search
    options = { shouldSort: true,
    threshold: 0.2,  #this value is set low in order to have more accurate results.
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 3,
    keys: [
      "cityName"
    ] }
    # start to find the city name by input
    fuse = new Fuse locale, options
    result = fuse.search(cityIn)

    # if no city is found.length of result is zero exit
    if result.length <= 0
      loc.city = false
      loc.nomos = false
      loc.status = false
    #search again with corrected city name
    else
      cityFixed = result[0].cityName
      #search again for duplicate cities in nomous with correct city name
      result = fuse.search(cityFixed)
      cityFixed = result[0].cityName
      nomosFixed = result[0].nomosName
      duplicateFound = false
      duplicateNomos = [nomosFixed]
      #if a city in another nomo is found stop and ask for more input.
      for i of result
        if String(result[i].nomosName) != String(nomosFixed)
          duplicateFound = true
          duplicateNomos.push(result[i].nomosName)
      if duplicateFound is false
        loc.city = cityFixed
        loc.nomos = nomosFixed
        cb loc, false, true
      else if duplicateFound is true
        loc.city = result[0].cityName
        loc.nomos = result[0].nomosName
        cb loc, duplicateNomos, -1


getNomos = (nomosIn, cb) ->
  data.readFile "location.json", (data, status) ->
    options = { shouldSort: true,
    threshold: 0.2,  #this value is set higher in order to have more abstract results.
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: [
      "nomosName"
    ] }
    fuse = new Fuse data, options
    result = fuse.search(nomosIn)
    if result.length <= 0
      cb "", false
    else
      cb result[0].nomosName, true



getDoc = (expertiseIn, cb) ->
  data.readFile "doctorsExpertise.json", (expertise, status) ->
    options = { shouldSort: true,
    threshold: 0.3,  #this value is set higher in order to have more abstract results.
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 3,
    keys: [
      "name"
    ] }
    fuse = new Fuse expertise, options
    result = fuse.search(expertiseIn)
    if result.length <= 0
      cb "", false
    else
      cb result[0], true

#function to remove articles from string Array and common words not in search terms
getArticles = (stringIn, cb) ->
  articles = [
    "ο", "η", "το", "του", "της", "τον", "τη", "την",
    "οι", "τα", "των", "τους", "τις", "στον", "στην",
    "ιατρό", "γιατρό", "γιατρο", "ιατρο", "στο", "στου", "πόλη", "πολη", "πόλης",
    "πολης", "νομός", "νομού", "νομό", "νομού"]

  options = { shouldSort: true,
  threshold: 0.1,  #this value is set low to have more specific results on articles
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 4,
  keys: [
      "name"
    ] }
    
  fuse = new Fuse articles, options
  result = fuse.search(stringIn)
  if result.length <= 0
    cb false
  else
    cb true


exports.getDocsDetails = (stringIn, cb) ->
  #init finalData object as false. if a value is found it will be added so
  #we wont need to add more checks in our code to alter between true and false
  finalData = { nomos: false, city: false, id: false, docName: false }
  duplies = null
  #1. split string to array
  stringArray = stringIn.split(" ")
  stringArray.sort (a, b) ->
    b.length - (a.length) or a.localeCompare(b)
  i = 0
  iMax = stringArray.length
  getArticlesAsync = ->
    str = stringArray[i]
    if i <= iMax
      getArticles str, (status) ->
        if status is true
          stringArray.splice(i, 1) #2.remove articles to clear search terms
          i++
        else
          i++
      getArticlesAsync()
  getArticlesAsync()

  #3. Get doctors expertise and remove it from array. I use index to count position
  index = 0
  exit = false
  iMax = stringArray.length
  i = 0
  getDocAsync = ->
    str = stringArray[i]
    if i <= iMax
      getDoc str, (data, status) ->
        if status is true && exit is false
          finalData.id = data.id
          finalData.docName = data.name
          stringArray.splice(i, 1)
          exit = true
          i++
        else
          i++
      getDocAsync()
  getDocAsync()
  #4. Get nomo and remove it from array. I use index to count position
  exit = false
  i = 0
  iMax = stringArray.length
  getNomosAsync = ->
    if exit is false && i <= iMax
      str = stringArray[i]
      getNomos str, (data, status) ->
        if status is true
          stringArray.splice(i, 1)
          finalData.nomos = data
          exit = true
          i++
        else
          i++
      getNomosAsync()
  getNomosAsync()

  exit = false
  #5 with reduced array
  i = 0
  iMax = stringArray.length
  getCityAsync = ->
    if i <= stringArray.length
      str = stringArray[i]
      getCity str, (data, duplicateList, status) ->
        # if nomos is found then check if city is in the same nomo
        if status is true && finalData.nomos is false && exit is false
          finalData.city = data.city
          finalData.nomos = data.nomos
          exit = true
        #if city is found and nomos was not then nomos is city's nomos
        else if status is true && finalData.nomos is data.nomos && exit is false
          finalData.city = data.city
          exit = true
        #if duplicate nomos was found for city then
        else if status is -1 && exit is false && finalData.nomos != false
          finalData.city = data.city
          duplies = null
          exit is true
        else if status is -1 && exit is false && finalData.nomos is false
          finalData.city = data.city
          duplies = duplicateList
          exit is true
      i++
      
      getCityAsync()
  getCityAsync()
  if finalData.city is false && finalData.nomos != false
    str = finalData.nomos
    str = str.normalize('NFD').replace /[\u0300-\u036f]/g, ''
    lastChar = str.length - 1 #length is position - 1 e.x: in god length is 3 but g is in position 0
    #fix genders in greek cities for more generic search for strings less than 5 chars
    if str.charAt(lastChar) is "ς"
      str = str.substring(0, str.length - 1)
    else if str.charAt(lastChar) is "υ"
      str = str.substring(0, str.length - 1) + "ς"
    getCity str, (data, duplicateList, status) ->
        finalData.city = data.city
        cb finalData, duplies
  else
    cb finalData, duplies