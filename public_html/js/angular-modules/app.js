var app = angular.module('phonebook', [
    'jcs-autoValidate',
    'angular-ladda'
]);

app.run(function (defaultErrorMessageResolver) {
    defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
        //Name
        errorMessages['shotName'] = 'You must type at least {} characters';
        errorMessages['longName'] = 'You must type no more than {} characters';
        errorMessages['badName'] = 'You must letters"';

    });

});

var api_base = 'http://localhost:8000/api';

app.controller('PersonControler', function ($scope, $http) {
    $scope.formModel = {};
//
    $scope.formModel.photo = "http://lauriefurman.com/facebook-profile-picture-silhouette-funny-713.jpg";
//
    $scope.submiting = false;
    $scope.search = '';
    $scope.selectedPerson = null;
    $scope.people = {};
    $scope.order = "email";
    
    //Submit form
    $scope.onSubmit = function () {
        $scope.submiting = true;
        console.log('submited');
        console.log($scope.formModel);

        $http.post(api_base + '/person/', $scope.formModel)
                .success(function (data) {
                    console.log(data);
                    console.log('\\o/');
                    $scope.submiting = false;
                    $scope.people.push(data);
                })
                .error(function (data) {
                    console.log(data);
                    console.log(':-)');
                    $scope.submiting = false;
                });
    };

    //Select Person


    $scope.selectPerson = function (person) {
        $scope.selectedPerson = person;
    };

    // Get list
    $http.get(api_base + '/person/')
            .success(function (data) {
                $scope.people = data;
            })
            .error(function (data) {
                console.log(data);
            });



    $scope.sensitiveSearch = function (person) {
        if ($scope.search) {
            return person.name.toLowerCase().indexOf($scope.search.toLowerCase()) === 0 ||
                    person.email.toLowerCase().indexOf($scope.search.toLowerCase()) === 0;

        }
        return true;
    };

});