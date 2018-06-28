request = require "request"

module.exports = parsepage = (pageUrl, searchstring, parsed) ->
    request (pageUrl), (error, respond, body) ->
        if body
            startpos = body.lastIndexOf(searchstring)
            newstring = body.substr (startpos)
            if startpos != -1
                finalbody = newstring.substr(0, newstring.indexOf("</div>"))
            else if startpos is -1
                finalbody = "couldn't match " + searchstring
            else
                finalbody = "no match"
        finalbody = finalbody.replace(searchstring, "")
        finalbody = finalbody.replace(/<p>/g, "")
        finalbody = finalbody.replace(/<\/p>/g, "")
        finalbody = finalbody.replace(/\t/g, "")
        finalbody = finalbody.replace(/<h3>/g, "")
        finalbody = finalbody.replace(/<h2>/g, "")
        finalbody = finalbody.replace(/<h1>/g, "")
        finalbody = finalbody.replace(/<\/h3>/g, "")
        finalbody = finalbody.replace(/<\/h2>/g, "")
        finalbody = finalbody.replace(/<\/h1>/g, "")
        finalbody = finalbody.replace(/&quot/g, "")
        finalbody = finalbody.replace(/\n/g, "\n\n")
        parsed finalbody
