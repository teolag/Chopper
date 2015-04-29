"use strict";

var users = {};

exports.login = function(user) {
    var id = Math.floor(Math.random()*10000000);
    users[id] = user;
    return id;
};

exports.get = function(id) {
    return users[id];
}

