'use strict';

/* Controllers */


function LogoutAppCtrl($scope, $http,$window,$location) {

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

LogoutAppCtrl.$inject = ["$scope","$http","$window","$location"];

function WebAppCtrl($scope, $http,$window,$location,socket) {


    $scope.nbUsers = 0;
    $scope.users = [];
    $scope.chats=[];
    $scope.chatmsg="";
    $scope.current_chat=null;


    var add_message = function(data,self)
    {
        console.log(data)

        if(self){
            var username = data.to;
        }else{
            var username = data.from;
        }

        var user = $scope.users.filter(function(elem){
            if(username==elem.username)
                return elem;
        })[0];

        var opened_chats = $scope.chats.filter(function(elem){
            if(user.username==elem.username)
                return elem;
        });

        if(opened_chats.length>0){
            user.msg = [];
            user.msg.push(data);
            $scope.chats.push(user);
            var id = opened_chats[0].socket;
            $('#myPill a[href="#'+id+'"]').tab('show')
            console.log(id)
        }else{
            user.msg = [];
            user.msg.push(data);
            $scope.chats.push(user);
            var id = $scope.chats[$scope.chats.length-1].socket;
            $('#myPill a[href="#'+id+'"]').tab('show')
        }



    }

    $scope.open_chat = function(user){
        console.log(user)
        //var user = $scope.users[index];
        console.log($scope.users)

        $scope.current_chat = user.username;

        var opened_chats = $scope.chats.filter(function(elem){
            if(user.username==elem.username)
                return elem;
        });

        if(opened_chats.length>0){
            var id = opened_chats[0].socket;
            $('#myPill a[href="#'+id+'"]').tab('show')
            console.log(id)
        }else{
            user.msg = [];
            $scope.chats.push(user);


            var id = $scope.chats[$scope.chats.length-1].socket;
            $('#myPill a[href="#'+id+'"]').tab('show')



        }

    }





    $scope.send_msg = function(){
        console.log($scope.chatmsg);

        var data = {date : new Date().toISOString(), from : $scope.username, to: $scope.current_chat, message : $scope.chatmsg};
        add_message(data,true);
        console.log($scope.current_chat)
        socket.emit('message', {"msg" :$scope.chatmsg, "to":$scope.current_chat});
    }


    $scope.get_info = function()
    {
        $http({method: 'GET', url : '/api/info'}).
            success(function(data,status,headers,config){
                console.log(data)
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
            console.log(data)
        });

        socket.on('message', function(data) {
            console.log("receive message...")
            add_message(data,false);
            console.log(data);
        });
    }


    $scope.get_info();


}

WebAppCtrl.$inject = ["$scope","$http","$window","$location","socket"];

function LoginCtrl($scope,$http,$window,$location) {
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
LoginCtrl.$inject = ["$scope","$http","$window","$location"];


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
