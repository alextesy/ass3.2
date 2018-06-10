angular.module('poiApp')
.service('setHeadersToken',[ '$http', function ($http) {

    let token = ""

    this.set = function (t) {
        token = t
        $http.defaults.headers.common[ 'x-access-token' ] = t
        // $httpProvider.defaults.headers.post[ 'x-access-token' ] = token
        console.log("set")
    }

    //this.userName='shir'


}])   
.controller('serviceController', ['$location', '$http', 'setHeadersToken','localStorageModel', function ($location, $http, setHeadersToken,localStorageModel) {
    self = this;

    self.directToPOI = function () {
        $location.path('/poi')
    }

    let serverUrl = 'http://localhost:3000/'
    self.signUp = function (user) {
        // register user
        $http.post(serverUrl + "users/register", user)
            .then(function (response) {
                //First function handles success
                self.signUp.content = response.data;
            }, function (response) {
                //Second function handles error
                self.signUp.content = "Something went wrong";
            });
    }
  

}]);

    
