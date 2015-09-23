var app = angular.module('tasks', [
    'jcs-autoValidate'
]);

app.run(function (defaultErrorMessageResolver){
    defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages){
       errorMessages['shotTitle'] = 'You must type at least {} characters'; 
       errorMessages['longTitle'] = 'You must type no more than {} characters'; 
       errorMessages['badTitle'] = 'You must type only numbers, letters, "_" and "-"'; 
    });

});

var api_base = "http://localhost:8000/api";
app.controller('TaskControler', function ($scope, $http){
    $scope.formModel = {};   
    
    $scope.onSubmit = function (){
        console.log("submited");
        console.log($scope.formModel);
        
        $http.post(api_base+"/tasks/", $scope.formModel)
            .success(function (data){
               console.log(data);
               console.log("\\o/");
            })
            .error(function (data){
               console.log(data);
               console.log(":-)");
            });
    };
    
});