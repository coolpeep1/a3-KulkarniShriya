const http = require("node:http"),
    fs = require("node:fs"),
    // IMPORTANT: you must run `npm install` in the directory for this assignment
    // to install the mime library if you're testing this on your local machine.
    // However, Glitch will install it automatically by looking in your package.json
    // file.
    mime = require("mime"),
    dir = "public/",
    port = 3000
//let fullURL = "index.html"
const appdata = [];

const server = http.createServer(function (request, response) {
    if (request.method === "GET") {
        handleGet(request, response)
    } else if (request.method === "POST") {
        handlePost(request, response)
    }
    // The following shows the requests being sent to the server
    // fullURL = `http://${request.headers.host}${request.url}`
    // console.log( fullURL );
})

const handleGet = function (request, response) {
    const filename = dir + request.url.slice(1)
    if (request.url === "/") {
        sendFile(response, "public/index.html")
    } else if (request.url === "/shows") {
        response.writeHead(200, "OK", {"Content-Type": "application/json"})
        response.end(JSON.stringify(appdata))
    } else {
        sendFile(response, filename)
    }
}

const handlePost = function (request, response) {
    let dataString = ""
    request.on("data", function (data) {
        dataString += data
    })
    request.on("end", function () {
        const newShow = JSON.parse(dataString);
        newShow.totalEpisodes = newShow.SeasonCount * newShow.EpisodeCount;
        newShow.percentComplete = Math.round((newShow.EpisodesWatched / newShow.totalEpisodes) * 100);
        newShow.RemainingEpisodes = newShow.totalEpisodes - newShow.EpisodesWatched;

        appdata.push(newShow);
        console.log("Current Shows:", appdata);
        response.writeHead(200, "OK", {"Content-Type": "application/json"})
        response.end(JSON.stringify(appdata))
    })
}

const sendFile = function (response, filename) {
    const type = mime.getType(filename)

    fs.readFile(filename, function (err, content) {

        // if the error = null, then we've loaded the file successfully
        if (err === null) {

            // status code: https://httpstatuses.com
            response.writeHead(200, {"Content-Type": type})
            response.end(content)

        } else {
            // file not found, error code 404
            response.writeHead(404)
            response.end("404 Error: File Not Found")

        }
    })
}
// process.env.PORT references the port that Glitch uses
// the following line will either use the Glitch port or one that we provided
server.listen(process.env.PORT || port, () => {
    console.log("Server listening on port " + port);
})