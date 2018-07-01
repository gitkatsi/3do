//This is a simple file server to listen to webHooks from gitHub.
const https = require('https');
const fs = require('fs');
//event emitter is used to emit events to same and other scripts
const emitter = require("events");
const em = new emitter;

//assign port no
var port = 32769;
var p = __dirname;

//var pass =  JSON.parse(fs.readFileSync(p + "/../configuration/services.json")).pfxPass;
//set options for https server
const options = {
    pfx: fs.readFileSync(p + "/../configuration/new.pfx"),
    passphrase: JSON.parse(fs.readFileSync(p + "/../configuration/services.json")).pfxPass
}

console.info (`Starting server at port ${port}...`);

https.createServer(options, (req, res) => {
    //whenever server responds we writes a response header 200 / OK
    res.writeHead(200);
    res.end();
    //data is transmitted to chunks. every chunk is saved to an array
    let body = [];
    req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
                body = Buffer.concat(body).toString(); // make a string from array
                if (body != null && body != undefined)
                {
                em.emit("t1", JSON.parse(body)); // emit data to external function
                }
            }
    );
}).listen(port);


em.on("t1", (data) => {
    if (data.pusher != null && data.pusher != undefined)
    {
    var textBuilder = `User ${data.pusher.name} did the following on repo: ${data.repository.full_name} \n`;
    if (data.commits[0].added.length > 0)
    {
        var strCon = "Added files: ";
        for (let i = 0; i < data.commits[0].added.length; i++)
        {
        strCon = strCon + data.commits[0].added[i] ;
            if (i < (data.commits[0].added.length -1))
            {
                strCon = strCon+", ";
            }
        }
        textBuilder = textBuilder + strCon + "\n";
    }
    if (data.commits[0].removed.length > 0) {
        var strCon = "Removed files: ";
        for (let i = 0; i < data.commits[0].removed.length; i++)
        {
            strCon = strCon + data.commits[0].removed[i] ;
            if (i < (data.commits[0].removed.length -1))
            {
                strCon = strCon+", ";
            }
        }
        textBuilder = textBuilder + strCon + "\n";
    }
    if (data.commits[0].modified.length > 0) {
        var strCon = "Modified files: ";
        for (let i = 0; i < data.commits[0].modified.length; i++) {
            strCon = strCon + data.commits[0].modified[i] ;
            if (i < (data.commits[0].modified.length -1))
            {
                strCon = strCon+", ";
            }
        }
        textBuilder = textBuilder + strCon + "\n";
    }
}
else
{
    textBuilder = "Something happened on your gitHub repo but i didn't understand what! ";
}
    em.emit("gitEvent", textBuilder);
});

// export emitter in order to import it to other files
exports.emitter = em;
