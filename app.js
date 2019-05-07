var dotenv = require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');

require('./app_api/models/db');
require('./app_api/config/passport');

var routesApi = require('./app_api/routes/index');

var app = express();

app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/nav', express.static(__dirname + '/app_client/nav'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_client')));
app.use(passport.initialize());

app.use('/api', routesApi);

server = app.listen(3000);
const io = require("socket.io")(server);

//listen on every connection
io.on('connection', (socket) => {
    socket.user = "NONE";
    socket.on('change_username', (data) => {
        socket.user = data.user;
    });
    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', {msg : data.msg, user : socket.user});
    });
});