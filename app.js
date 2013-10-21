
/**
 * Module dependencies
 */

var express = require('express'),
    routes = require('./routes'),
    api = require('./routes/api'),
    http = require('http'),
    path = require('path')


function restrict(req, res, next) {
    if (req.session.loggedIn) {
        console.log("Session OK!");
        next();
    } else {
        req.session.error = 'Access denied!';
        console.log("Access denied!");
        res.redirect(301,'/');

        res.send();
    }
}

var app = module.exports = express();

/**
* Configuration
*/

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({key:"myKey",secret:"mySecret"}));
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
   app.use(express.errorHandler());
};

// production only
if (app.get('env') === 'production') {
  // TODO
};

// Routes
app.get('/', routes.index);
app.get('/home', restrict,routes.webapp);
app.get('/partial/:name', routes.partial);

// JSON API
app.post('/api/register', api.register);
app.post('/api/login', api.login);
app.delete('/api/logout', restrict,api.logout);
app.get('/api/info', restrict,api.info);


// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

/**
* Start Server
*/

express.vhost('your-vhost-name', app);

var server = http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

/**
 * Socket io handler
 */

var io = require('socket.io').listen(server);

var count = 0;
var users = {"users":[]};

function reloadUsers() { // Send the count of the users to all
    io.sockets.emit('nbUsers', {"nb": count});
}

io.sockets.on('connection', function (socket) { // First connection

    count ++;
    reloadUsers(); // Send the count to all the users

    socket.on('adduser', function (username) {
        users.users.push({"socket":socket.id,"username":username,"status":"online"});
        io.sockets.emit('updateUsers', users);
    });

    socket.on('disconnect', function () { // Disconnection of the client
        count -= 1;
        reloadUsers();

        users.users = users.users.filter(function(elem){
            if(elem.socket!=socket.id)
                return elem;
        });
        io.sockets.emit('updateUsers', users);
    });


    socket.on('message', function (data) { // Broadcast the message to all

        console.log(data)

        var usernameTo = data.to;

        var socketidTo = users.users.filter(function(elem){
            if(elem.username==usernameTo)
                return elem;
        })[0].socket;

        if(socketidTo!=false){
            var usernameFrom = users.users.filter(function(elem){
                if(elem.socket==socket.id)
                    return elem;
            })[0].username;

            var transmit = {date : new Date().toISOString(), from : usernameFrom, message : data.msg};
            io.sockets.socket(socketidTo).emit('message', transmit);
        }

    });

});