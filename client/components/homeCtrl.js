angular.module('poiApp')
.controller('formCtrl',['$http', function($scope,$http) {
    let serverUrl='http://localhost:3000/'
    self=this;
    $scope.user={};
    $scope.submit=function(){
        var username=$scope.user.username;
        var password=$scope.user.password;
    };
    self.getCategories=function(){
        self.$http.get(serverUrl + "POI/allCategories")
        .then(function(response){
            $scope.categories=response.data
        }),
        function (response) {
            //Second function handles error
            self.signUp.content = "Something went wrong";
        }
    };
    self.getCategories();

}]);

