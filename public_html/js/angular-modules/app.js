var app = angular.module('phonebook', [
    'jcs-autoValidate',
    'angular-ladda',
    'ngResource',
    'infinite-scroll',
    'angularSpinner'
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


app.config(function ($httpProvider, $resourceProvider, laddaProvider) {
    $resourceProvider.defaults.stripTralingSlashes = false;
    laddaProvider.setOption({
        style: 'expand-right'
    });
});

//app.factory('People', function ($resource) {
//    return $resource(api_base + '/person-paginated/', {}, {
//        query: {method: 'GET', isArray: false}
//    });
//});

app.factory('Person', function ($resource) {
    return $resource(api_base + '/person/:pk', {pk: '@pk'}, {
        update: {
            method: 'PUT'
        }
    });
});

app.controller('PersonDetailController', function ($scope, PersonService) {
    $scope.personServiceRef = PersonService;

    $scope.save = function () {
        $scope.personServiceRef.updatePerson($scope.personServiceRef.selectedPerson);
    };

    $scope.delete = function () {
        $scope.personServiceRef.deletePerson($scope.personServiceRef.selectedPerson);
    };

});

app.controller('PersonListController', function ($scope, $http, PersonService) {
    $scope.formModel = {};
//
    $scope.formModel.photo = "http://lauriefurman.com/facebook-profile-picture-silhouette-funny-713.jpg";
//
    $scope.submiting = false;
    $scope.search = '';
    $scope.order = "name";
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

    $scope.$watch('search', function (newVal, oldVal) {
        console.log(newVal);
        if (angular.isDefined(newVal)) {
            $scope.personServiceRef.doSearch(newVal);
        }
    });

    $scope.$watch('order', function (newVal, oldVal) {
        console.log(newVal);
        if (angular.isDefined(newVal)) {
            $scope.personServiceRef.doOrder(newVal);
        }
    });

    $scope.loadMorePeople = function () {
        console.log('Load More');
        $scope.personServiceRef.loadMore();
    };
});

app.service('PersonService', function ($http, Person) {

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
        'page': 1,
        'hasMore': true,
        'isLoading': false,
        'isSaving': false,
        'isDeleting': false,
        'selectedPerson': null,
        'peopleList': [],
        'search': null,
        'order': null,
        'doSearch': function (search) {
            self.hasMore = true;
            self.page = 1;
            self.peopleList = [];
            self.search = search;
            self.loadPeople();
        },
        'doOrder': function (order) {
            self.hasMore = true;
            self.page = 1;
            self.peopleList = [];
            self.order = order;
            self.loadPeople();
        },
        'loadPeople': function () {
            if (self.hasMore && !self.isLoading) {
                self.isLoading = true;

                var params = {
                    'page': self.page,
                    'search': self.search,
                    'order': self.order
                };

                Person.get(params, function (data) {
                    angular.forEach(data.results, function (person) {
                        self.peopleList.push(new Person(person));
                    });
//                    self.peopleList.concat(data.results);
                    console.log(data);

                    if (!data.next) {
                        self.hasMore = false;
                    }
                    self.isLoading = false;
                });
            }

        },
        'loadMore': function () {
            if (self.hasMore && !self.isLoading) {
                self.page += 1;
                self.loadPeople();
            }
        },
        'updatePerson': function (person) {
            self.isSaving = true;
            person.$update().then(function () {
                self.isSaving = false;
            });
        },
        'deletePerson': function (person) {
            self.isDeleting = true;
            person.$remove().then(function () {
                self.isDeleting = false;
                var index = self.peopleList.indexOf(person);
                self.peopleList.splice(index, 1);
                self.selectedPerson = null;
            });
        }


    };

    self.loadPeople();

    return self;

});