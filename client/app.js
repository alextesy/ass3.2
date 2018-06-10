let app = angular.module('poiApp', ["ngRoute", 'LocalStorageModule']);

app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider)  {


    $locationProvider.hashPrefix('');


    $routeProvider.when('/', {
        templateUrl: 'components/home.html',
        controller : 'formCtrl'
    })
 
    $routeProvider.when('/forgot', {
        templateUrl: 'components/forgot.html',
        controller : 'forgetCtrl'
    })

    .otherwise({ redirectTo: '/' });

        
}]);