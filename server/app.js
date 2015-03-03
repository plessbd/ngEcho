var express = require("express"),
	path = require("path"),
	app = express(),
	server = require("http").Server(app),
	bodyParser = require("body-parser"),
	config = {
		useIpv6: true
	};
app.use(bodyParser.urlencoded({
	extended: true
}));

// parse application/json
app.use(bodyParser.json());

app.io = require("socket.io")(server);

server.listen(8000, config.useIpv6 ? "::" : "", function serverListen() {
	console.log("server running on", this._connectionKey);
});

app.use("/bower_components", express.static(path.join(__dirname, "..", "client", "bower_components")));
app.use("/js", express.static(path.join(__dirname, "..", "client", "js")));

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.post("/echo/", function (req, res) {
	if (typeof req.query.emit !== "undefined") {
		res.sendStatus(202);

		setTimeout(function () {
			app.io.emit("echo", req.body);
		}, req.query.wait || 1000);

	}
	else {
		res.json(req.body);
	}

});

app.io.on("connection", function (socket) {
	socket.emit("echo", {
		message: "Connected"
	});
	socket.on("echo", function (data) {
		socket.emit("echo", data);
	});
});
