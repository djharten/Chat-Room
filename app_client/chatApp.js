var app = angular.module('chatApp' , ['ngRoute']);

//*** Authentication Service and Methods **
app.service('authentication', authentication);
authentication.$inject = ['$window', '$http'];
function authentication ($window, $http) {

    var saveToken = function (token) {
        $window.localStorage['chat-token'] = token;
    };

    var getToken = function () {
        return $window.localStorage['chat-token'];
    };

    var register = function(user) {
        console.log('Registering user ' + user.email + ' ' + user.password);
        return $http.post('/api/register', user).success(function(data){
            saveToken(data.token);
        });
    };

    var login = function(user) {
        console.log('Attempting to login user ' + user.email + ' ' + user.password);
        return $http.post('/api/login', user).success(function(data) {
            saveToken(data.token);
        });
    };

    var logout = function() {
        $window.localStorage.removeItem('chat-token');
    };

    var isLoggedIn = function() {
        var token = getToken();

        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    var currentUser = function() {
        if(isLoggedIn()){
            var token = getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return {
                email : payload.email,
                name : payload.name
            };
        }
    };

    return {
        saveToken : saveToken,
        getToken : getToken,
        register : register,
        login : login,
        logout : logout,
        isLoggedIn : isLoggedIn,
        currentUser : currentUser
    };
}

// Router Provider
app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/home.html',
            controller: 'homeController',
            controllerAs: 'vm'
        })

        .when('/register', {
            templateUrl: 'pages/register.html',
            controller: 'registerController',
            controllerAs: 'vm'
        })

        .when('/login', {
            templateUrl: 'pages/login.html',
            controller: 'loginController',
            controllerAs: 'vm'
        })

        .otherwise({ redirectTo: '/' });
});

var allTitle = "Chat Room Web Service";

// Controllers

app.controller('loginController', [ '$http', '$location', 'authentication', function loginController($http, $location, authentication) {
    var vm = this;

    vm.pageHeader = 'Sign in to chat!';

    vm.credentials = {
        email : "",
        password : ""
    };

    vm.returnPage = $location.search().page || '/';

    vm.onSubmit = function () {
        vm.formError = "";
        if (!vm.credentials.email || !vm.credentials.password) {
            vm.formError = "All fields required, please try again";
            return false;
        } else {
            vm.doLogin();
        }
    };

    vm.doLogin = function() {
        vm.formError = "";
        authentication
            .login(vm.credentials)
            .error(function(err){
                var obj = err;
                vm.formError = obj.message;
            })
            .then(function(){
                $location.search('page', null);
                $location.path(vm.returnPage);
            });
    };
}]);

app.controller('registerController', [ '$http', '$location', 'authentication', function registerController($http, $location, authentication) {
    var vm = this;

    vm.pageHeader = 'Create a new chat account';

    vm.credentials = {
        name : "",
        email : "",
        password : ""
    };

    vm.returnPage = $location.search().page || '/';

    vm.onSubmit = function () {
        vm.formError = "";
        if (!vm.credentials.name || !vm.credentials.email || !vm.credentials.password) {
            vm.formError = "All fields required, please try again";
            return false;
        } else {
            vm.doRegister();
        }
    };

    vm.doRegister = function() {
        vm.formError = "";
        authentication
            .register(vm.credentials)
            .error(function(err){
                vm.formError = "Error registering. Email already registered. Try again with a different email address."
            })
            .then(function(){
                $location.search('page', null);
                $location.path(vm.returnPage);
            });
    };
}]);


app.controller('homeController', ['authentication', function homeController(authentication) {
    var vm = this;
    vm.title = allTitle;
    vm.message = "Chat Away!";
    vm.currentUser = function() {
        return authentication.currentUser();
    };
    vm.isLoggedIn = function() {
        return authentication.isLoggedIn();
    };

    var socket = io.connect('http://18.208.205.232');
    var msg = $("#message");
    if(isLoggedIn()) {
        var user = vm.currentUser().name;
    }
    var sendMsg = $("#send_message");
    var chatRoom = $("#chatroom");

    sendMsg.click(function(){
        socket.emit('new_message', {msg : msg.val()})
        console.log(msg.val());
    })

    socket.on("new_message", (data) => {
        msg.val('');
        chatRoom.append("<p class='message'>" + user + ": " + data.msg + "</p>")
    })


}]);
