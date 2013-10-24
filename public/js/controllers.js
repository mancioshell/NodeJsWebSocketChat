'use strict';

/* Controllers */


function LogoutAppCtrl($scope, $http,$window) {

    $scope.logout = function()
    {
        $http({method: 'DELETE', url: '/api/logout'}).
            success(function(data, status, headers, config) {
                console.log("logout!");
                $window.location.href="/";
            }).
            error(function(data, status, headers, config) {
                console.log(data);
            });
    }

}

LogoutAppCtrl.$inject = ["$scope","$http","$window"];

function WebAppCtrl($scope, $http,socket) {


    $scope.nbUsers = 0;
    $scope.users = [];
    $scope.chats=[];
    $scope.current_chat=null;


    var _get_opened_chat = function(user){
        var _app = null;

        $scope.chats.filter(function(elem,index){
            if(user.username==elem.username){
                _app = index;
                return elem;
            }
        });

        return _app;
    }

    var add_message = function(data,self)
    {
        if(self){
            var username = data.to;
        }else{
            console.log(data)
            var username = data.from;
        }

        data.username=data.from;

        var user = $scope.users.filter(function(elem){
            if(username==elem.username)
                return elem;
        })[0];

        var _app = _get_opened_chat(user);

        if(_app!=null){
            var opened_chats = $scope.chats[_app];
            opened_chats.msg.push(data);
            $scope.chats[_app] = opened_chats;
        }else{
            var new_chat = {"username":user.username, "socket":user.socket, "visible":true, "msg": [data]};
            $scope.chats.push(new_chat);
        }

        $scope.current_chat = user.username;

    }

    $scope.open_chat = function(user)
    {
        var _app = _get_opened_chat(user);

        if(_app==null){
            var data = {date : new Date().toISOString(), message : "Starting chat with: "+user.username};
            var new_chat = {"username":user.username, "socket":user.socket, "visible":true, "msg": [data]};
            $scope.chats.push(new_chat);
        }

        $scope.current_chat = user.username;
    }


    $scope.close_chat = function(chat){
        var user = chat.username;
        var _app = _get_opened_chat(user);
        $scope.chats.splice(_app, 1);
    }


    $scope.send_msg = function(){
        if($scope.chatmsg==""){
            noty({text: 'Message must be not empty!',  timeout: 1000, type: 'warning'});
        }else{
            var data = {date : new Date().toISOString(), from : $scope.username, to: $scope.current_chat, message : $scope.chatmsg};
            add_message(data,true);
            socket.emit('message', {"msg" :$scope.chatmsg, "to":$scope.current_chat});
            $scope.chatmsg="";
        }
    }


    $scope.get_info = function()
    {
        $http({method: 'GET', url : '/api/info'}).
            success(function(data,status,headers,config){
                $scope.username = data.username;

                init_socket($scope.username);
            }).
            error(function(data,status,headers,config){
                console.log(data)
            })

    }

    var init_socket = function(username){

        socket.on('connect', function() {
            console.log('connected');
        });

        socket.emit('adduser', username);

        socket.on('nbUsers', function(msg) {
            $scope.nbUsers = msg.nb;
        });

        socket.on('updateUsers',function(data){
            $scope.users = data.users;
        });

        socket.on('message', function(data) {
            add_message(data,false);
        });
    }





    $scope.get_info();


}

WebAppCtrl.$inject = ["$scope","$http","socket"];

function LoginCtrl($scope,$http,$window) {
    $scope.failed_login = "";

    $scope.login = function()
    {

        var user = {"username": $scope.username, "password": $scope.password};

        if($scope.username!==undefined || $scope.password !==undefined){
            $http({method: 'POST', url: '/api/login', data:user}).
                success(function(data, status, headers, config) {
                    console.log(data);
                    $window.location.href="/home";
                }).
                error(function(data, status, headers, config) {
                    console.log(data);
                    noty({text: data,  timeout: 2000, type: 'error'});
                });
        }

    }
}
LoginCtrl.$inject = ["$scope","$http","$window"];


function RegistrationCtrl($scope,$http) {
    $scope.register = function()
    {
        var user = {"username": $scope.username, "password": $scope.password, "check_password": $scope.check_password};

        if($scope.username!==undefined || $scope.password !==undefined || $scope.check_password !==undefined){

            if($scope.password!==$scope.check_password){

                noty({text: 'Password and Check Password must be the same!',  timeout: 2000, type: 'error'});

            }else{
                $http({method: 'POST', url: '/api/register', data:user}).
                    success(function(data, status, headers, config) {
                        console.log(data);
                    }).
                    error(function(data, status, headers, config) {

                        noty({text: data,  timeout: 2000, type: 'error'});

                    });
            }

        }


    }
}
RegistrationCtrl.$inject = ["$scope","$http"];
