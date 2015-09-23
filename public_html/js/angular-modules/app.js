var app = angular.module('tasks', [
    'jcs-autoValidate',
    'angular-ladda'
]);

app.run(function (defaultErrorMessageResolver) {
    defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
        errorMessages['shotTitle'] = 'You must type at least {} characters';
        errorMessages['longTitle'] = 'You must type no more than {} characters';
        errorMessages['badTitle'] = 'You must type only numbers, letters, "_" and "-"';
    });

});

var api_base = 'http://192.186.0.102:8000/api/';

app.controller('TaskControler', function ($scope, $http) {
    $scope.formModel = {};
    $scope.submiting = false;

    $scope.onSubmit = function () {
        $scope.submiting = true;
        console.log('submited');
        console.log($scope.formModel);

        $http.post(api_base + '/tasks/', $scope.formModel)
                .success(function (data) {
                    console.log(data);
                    console.log('\\o/');
                    $scope.submiting = false;
                    $scope.tasks.push(data);
                })
                .error(function (data) {
                    console.log(data);
                    console.log(':-)');
                    $scope.submiting = false;
                });
    };

    $scope.selectedTaskIndex = null;
    $scope.selectedTask = null;
    $scope.selectTask = function (task, index) {
        $scope.selectedTaskIndex = index;
        $scope.selectedTask = task;
    };

    $scope.tasks = {};
    $http.get(api_base + '/tasks/')
            .success(function (data) {
                $scope.tasks = data;
            })
            .error(function (data) {
                console.log(data);
            });



});