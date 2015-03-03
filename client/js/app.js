var app = angular.module("ngEcho", ["btford.socket-io", "mgcrea.ngStrap", "smart-table", "angularMoment"]);

app.factory("socket", function (socketFactory) {
	return socketFactory();
});

app.factory("echoService", ["$http", "socket", function ($http, socket) {
	return {
		sendHttpMessage: function (message) {
			return $http.post("/echo/", {
				message: message
			});
		},
		webSocketEmit: function (message) {
			socket.emit("echo", {
				message: message
			});
		},
		sendHttpMessageRecieveSocketResponse: function (message) {
			return $http.post("/echo/?emit", {
				message: message
			});
		}
	};
}]);

app.controller("echoCtrl", ["socket", "echoService", function echoCtrl(socket, echoService) {
	var self = this;
	self.rowCollection = [];
	self.debugSocket = localStorage.debug === "" ? false : true;
	self.socket = socket;
	self.message = "";
	self.socket.on("echo", function echo(data) {
		var row = {
			timestamp: moment(),
			type: "socket",
			message: data.message
		};
		self.rowCollection.push(row);
	});
	self.toggleDebug = function toggleDebug() {
		if (localStorage.debug === "*") {
			localStorage.debug = "";
			self.debugSocket = false;
		}
		else {
			localStorage.debug = "*";
			self.debugSocket = true;
		}
	};
	self.sendHttpMessage = function sendHttpMessage() {
		echoService.sendHttpMessage(self.message)
			.success(function (data) {
				var row = {
					timestamp: new Date(),
					type: "http",
					message: data.message
				};
				self.rowCollection.push(row);
			});
	};
	self.webSocketEmit = function webSocketEmit() {
		echoService.webSocketEmit(self.message);
	};
	self.sendHttpMessageRecieveSocketResponse = function sendHttpMessageRecieveSocketResponse() {
		echoService.sendHttpMessageRecieveSocketResponse(self.message).then(function (data, status, headers, config) {});
	};
}]);
