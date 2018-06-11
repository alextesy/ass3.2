angular.module('poiApp')
.controller('formCtrl',function($scope,$http) {
    let serverUrl='http://localhost:3000/'
    self=this;
    $scope.user={};
    $scope.selcetedcat = {};
    $scope.submit_log=function(){
        var username=$scope.user.username;
        var password=$scope.user.password;
  
    };
    $scope.submit_reg=function(){
        var categories = $scope.categories;
        $scope.user.categories = [];
        for(i=0 ;i<categories.length ; i++){
            if(categories[i].checked == true)
                $scope.user.categories.push(categories[i].ID)
        }
        $scope.user.questions[0] = $scope.user.questions[0].questionID;
        $scope.user.questions[1] = $scope.user.questions[1].questionID;
        $scope.user.country = $scope.user.country.Name;
        //post request
        $http.post(serverUrl + "users/register",$scope.user)
            .then(function(response){
                alert("sucsses");
            },function (response){
                alert("Something went wrong");
            }
        );
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

    $http.get(serverUrl + "users/questionslist")
        .then(function(response){
            $scope.questionslist=response.data
            console.log($scope.questionslist)
        },
        function (response) {
            //Second function handles error
            $scope.questionslist = "Something went wrong";
        });
        $http.get(serverUrl + "users/countries")
        .then(function(response){
            $scope.countries=response.data
            console.log($scope.countries)
        },
        function (response) {
            //Second function handles error
            $scope.countries = "Something went wrong";
        });

});

