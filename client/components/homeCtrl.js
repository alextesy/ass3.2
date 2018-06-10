angular.module('poiApp')
.controller('formCtrl',function($scope,$http) {
    let serverUrl='http://localhost:3000/'
    self=this;
    $scope.user={};
    $scope.submit=function(){
        var username=$scope.user.username;
        var password=$scope.user.password;
    };

        $http.get(serverUrl + "POI/allCategories")
        .then(function(response){
            $scope.categories=response.data
            console.log($scope.categories)
        },
        function (response) {
            //Second function handles error
            $scope.categories = "Something went wrong";
        });
    
 
    // console.log($scope.categories)

});

