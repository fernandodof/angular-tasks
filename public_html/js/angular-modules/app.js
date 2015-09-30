var app = angular.module('phonebook', [
    'jcs-autoValidate',
    'angular-ladda',
    'ngResource',
    'infinite-scroll'
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


app.config(function ($httpProvider, $resourceProvider) {
    $resourceProvider.defaults.stripTralingSlashes = false;
});

app.factory('People', function ($resource) {
    return $resource(api_base + '/person-paginated/', {}, {
        query: {method: 'GET', isArray: false}
    });
});

app.controller('PersonDetailController', function ($scope, PersonService) {
    $scope.personServiceRef = PersonService;
});

app.controller('PersonListController', function ($scope, $http, PersonService) {
    $scope.formModel = {};
//
    $scope.formModel.photo = "http://lauriefurman.com/facebook-profile-picture-silhouette-funny-713.jpg";
//
    $scope.submiting = false;
    $scope.search = '';
    $scope.order = "email";
    $scope.personServiceRef = PersonService;
    $scope.people = [];
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

    $scope.sensitiveSearch = function (person) {
        if ($scope.search) {
            return person.name.toLowerCase().indexOf($scope.search.toLowerCase()) === 0 ||
                    person.email.toLowerCase().indexOf($scope.search.toLowerCase()) === 0;

        }
        return true;
    };

    $scope.loadMorePeople = function () {
        console.log('Load More');
        $scope.personServiceRef.loadMore();
    };
});

app.service('PersonService', function ($http, People) {

    var peopleList = [];

    var self = {
        'addPerson': function (person) {
            $http.post(api_base + '/person/', person)
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
        },
        'page' : 1,
        'hasMore' : true,
        'isLoading' : false,
        'selectedPerson': null,
        'peopleList': [],
        'loadPeople': function () {
            if(self.hasMore && !self.isLoading){
                self.isLoading = true;
                
                var params = {
                    'page' : self.page
                };
                
                People.query(params , function (data) {
                    angular.forEach(data.results, function(person){
                        self.peopleList.push(new People(person));
                    });
//                    self.peopleList.push(data.results);
                    console.log(data);

                    if(!data.next){
                        self.hasMore = false;
                    }
                    self.isLoading = false;
                });
            }
            
        },
        'loadMore': function (){
            if(self.hasMore && !self.isLoading){
                self.page += 1;
                self.loadPeople();
            }
        }


    };

    self.loadPeople();

    return self;

});