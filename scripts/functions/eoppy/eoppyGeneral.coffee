request = require "request"
fileManage = require "../eoppy/fileManage.coffee"

#Function to post to page with parameters.
#Headers where needed to be set in order to prevent redirect loops
exports.getPageOptions = (url, cb) ->
  request = require('request')
  request {
    method: 'GET'
    headers: { "User-Agent": "Mozilla/5.0 (X11; Linux i686) " +
    "AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410." }
    uri: url
    jar: true
  }, (error, response, body) ->
    cb error, response, body
    if error?
      console.error "Error for url: \n\r " + url
    

#Get nomous from page to get cities / nomo
getNomosList = (url, cb) ->
  url = "http://www.eopyy.gov.gr/MedSupplier/" +
  "SelectNomosAndTypeFromCurrent?id=&a_City=&" +
  "a_MedSupplierTypeID=1&a_MedDoctorEidikotitaID="
  exports.getPageOptions url, (error, response, body) ->
    pos = body.indexOf("SelectedNomosChanged()\"><option value=\"\"></option>")
    startPos = body.indexOf("/option", pos)
    startPos = body.indexOf("<", startPos)
    endPos = body.indexOf("</select>", startPos)
    newString = body.substr(startPos, endPos - startPos)
    newString = newString.replace(/<option value=/g, "") #chain replacements
    .replace(/<\/option>/g, "")
    .replace(/>/g, " ")
    .replace(/"/g, "")
    .replace(/[ +]/g, " ")
    .replace(/\r\n/g, " ")
    newString = newString.split(" ")
    i = 0
    nomosArray = []
    while i <= newString.length
      nomosArray.push(newString[i])
      i = i + 2
    nomosArray.splice(nomosArray.length - 1, 1)

    pos = body.indexOf("SelectedMedDoctorEidikotitaChanged")
    startPos = body.indexOf("/option", pos)
    startPos = body.indexOf("<", startPos)
    endPos = body.indexOf("</select>", startPos)
    newString = body.substr(startPos, endPos - startPos)
    newString = newString.replace(/<option value=/g, "") #chain replacements
    .replace(/<\/option>/g, "")
    .replace(/>/g, "!")
    .replace(/"/g, "")
    .replace(/[ +]/g, " ")
    .replace(/\r\n/g, "!")
    .replace(/[ ]/g, " ")
    newString = newString.split("!")
    i = 0
    expertiseArray = []
    while i <= newString.length
      id = newString[i]
      i = i + 1
      name = newString[i]
      i = i + 1
      expertiseArray.push({ "id": id, "name": name })
    expertiseArray.splice(expertiseArray.length - 1, 1)
    fileManage.writeFile expertiseArray, "doctorsExpertise.json", (status) ->
    cb nomosArray

getCityList = (nomos, cities, nn) ->
  citiesUrl = "http://www.eopyy.gov.gr/MedSupplier/" +
  "SelectNomosAndTypeFromCurrent?id=#{nomos}" +
  "&a_City=&a_MedSupplierTypeID=1&a_MedDoctorEidikotitaID="
  citiesUrl = encodeURI(citiesUrl) #url must be encoded to be sent properly.
  exports.getPageOptions citiesUrl, (error, response, body) ->
    pos = body.indexOf("SelectedCityChanged()\"><option value=\"\"></option>")
    startPos = body.indexOf("/option", pos)
    startPos = body.indexOf("<", startPos)
    endPos = body.indexOf("</select>", startPos)
    newString = body.substr(startPos, endPos - startPos)
    newString = newString.replace(/<option value=/g, "") #chain replacements
    .replace(/<\/option>/g, "")
    .replace(/>/g, "!")
    .replace(/"/g, "")
    .replace(/[ +]/g, " ")
    .replace(/\r\n/g, "!")
    .replace(/[ ]/g, " ")
    newString = newString.split("!")
    i = 0
    citiesArray = []
    while i <= newString.length
      citiesArray.push(newString[i])
      i = i + 2
    citiesArray.splice(citiesArray.length - 1, 1)
    cities citiesArray, nomos

getAll = ->
  status = false
  getNomosList "http://www.eopyy.gov.gr/MedSupplier/",  (nomoi, expertise) ->
    #Init variables to make them scope global
    i = 0
    str = ""
    locArray = new Array
    #Declare the end function to return the results with callback
    requestEnd = ->
      fileManage.writeFile locArray, "location.json", (cb) ->
        if cb is true
          console.log "Saved the file"
          status = true
#A trick to make a https request function to run in sequence and not in parallel
#In this case it will fire 50 requests at once on the page if a 'for' or 'while' loop is used
    #Make the callnext function
    callNext = ->
      if i >= nomoi.length
        requestEnd()
      else
        nomos = nomoi[i]
        getCityList nomos, (ct, nn) ->
          for city in ct
            locArray.push({ nomosName: nn, cityName: city })
          i++
          callNext() #This is called to increase the i and start the function again
    callNext() #This will execute on first pass to direct the proccess inside the function

exports.getValidDocs = (url, docs) ->
  url = encodeURI(url)
  exports.getPageOptions url, (error, response, body) ->
    pos = body.indexOf("SelectedMedDoctorEidikotitaChanged")
    startPos = body.indexOf("/option", pos)
    startPos = body.indexOf("<", startPos)
    endPos = body.indexOf("</select>", startPos)
    newString = body.substr(startPos, endPos - startPos)
    newString = newString.replace(/<option value=/g, "") #chain replacements
    .replace(/<\/option>/g, "")
    .replace(/>/g, "!")
    .replace(/"/g, "")
    .replace(/[ +]/g, " ")
    .replace(/\r\n/g, "!")
    .replace(/[ ]/g, " ")
    newString = newString.split("!")
    i = 0
    expertiseArrayID = []
    while i <= newString.length
      id = newString[i]
      i = i + 2
      expertiseArrayID.push(id)
    docs expertiseArrayID

getAll()

