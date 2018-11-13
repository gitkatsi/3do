let parsePage;
const request = require("request");

module.exports = (parsePage = (pageUrl, searchString, parsed) =>
    request((pageUrl), function(error, respond, body) {
        let finalBody;
        //find text by calculating indexOf 
        if (body) {
            const startPos = body.lastIndexOf(searchString);
            const newString = body.substr((startPos));
            if (startPos !== -1) {
                finalBody = newString.substr(0, newString.indexOf("</div>"));
            } else if (startPos === -1) {
                finalBody = `couldn't match ${searchString}`;
            } else {
                finalBody = "no match";
            }
        }
        //remove HTML tags to clear substring
        finalBody = finalBody.replace(searchString, "");
        finalBody = finalBody.replace(/<p>/g, "");
        finalBody = finalBody.replace(/<\/p>/g, "");
        finalBody = finalBody.replace(/\t/g, "");
        finalBody = finalBody.replace(/<h3>/g, "");
        finalBody = finalBody.replace(/<h2>/g, "");
        finalBody = finalBody.replace(/<h1>/g, "");
        finalBody = finalBody.replace(/<\/h3>/g, "");
        finalBody = finalBody.replace(/<\/h2>/g, "");
        finalBody = finalBody.replace(/<\/h1>/g, "");
        finalBody = finalBody.replace(/&quot/g, "");
        finalBody = finalBody.replace(/\n/g, "\n\n");
        return parsed(finalBody);
    })
);
