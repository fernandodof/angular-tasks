var app = angular.module('phonebook', [
    'jcs-autoValidate',
    'angular-ladda',
    'ngResource',
    'infinite-scroll',
    'angularSpinner',
    'mgcrea.ngStrap',
    'toaster',
    'ngAnimate',
    'ui.router'
]);

var api_base = 'http://localhost:8000/api';

app.run(function (defaultErrorMessageResolver) {
    defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
        //Name
        errorMessages['shotName'] = 'You must type at least {} characters';
        errorMessages['longName'] = 'You must type no more than {} characters';
        errorMessages['badName'] = 'You must letters"';

    });

});

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
            .state('list', {
                url: '/',
                templateUrl: 'templates/list.html',
                controller: 'PersonListController'
            })
            .state('edit', {
                url: '/edit/:id',
                templateUrl: 'templates/edit.html',
                controller: 'PersonDetailController'
            });
    $urlRouterProvider.otherwise('/');
});

app.config(function ($httpProvider, $resourceProvider, laddaProvider, $datepickerProvider) {
//    $httpProvider.defaults.useXDomain = true;
//    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $resourceProvider.defaults.stripTralingSlashes = false;
    laddaProvider.setOption({
        style: 'expand-right'
    });

    angular.extend($datepickerProvider.defaults, {
        dateFormat: 'd/MM/yyyy',
        autoclose: true
    });
});


app.factory('Person', function ($resource) {
    return $resource(api_base + '/person/:pk', {pk: '@pk'}, {
        update: {
            method: 'PUT'
        },
        headers: {'X-Requested-With': 'XMLHttpRequest'}
    });
});

app.filter("defaultImage", function () {
    return function (input, param) {
        var image = input;
        if (!input) {
            image = param;
        }
        return image;
    };
});

app.controller('PersonDetailController', function ($scope, $stateParams, $state, PersonService) {
    $scope.personServiceRef = PersonService;

    console.log($stateParams);

    $scope.personServiceRef.selectedPerson = $scope.personServiceRef.getPerson($stateParams.id);

    $scope.save = function () {
        $scope.personServiceRef.updatePerson($scope.personServiceRef.selectedPerson).then(function () {
            $state.go("list");
        });
    };

    $scope.delete = function () {
        $scope.personServiceRef.deletePerson($scope.personServiceRef.selectedPerson).then(function () {
            $state.go("list");
        });
    };

});

app.controller('PersonListController', function ($scope, $modal, PersonService) {
    $scope.formModel = {};
    $scope.submiting = false;
    $scope.search = '';
    $scope.order = "name";
    $scope.personServiceRef = PersonService;
    $scope.people = [];

    $scope.showAddModal = function () {
        $scope.personServiceRef.selectedPerson = {};
        $scope.createModal = $modal({
            scope: $scope,
            templateUrl: 'templates/addModal.html',
            show: true
        });
    };

    $scope.addPerson = function () {
        $scope.personServiceRef.addPerson($scope.personServiceRef.selectedPerson)
                .then(function () {
                    $scope.createModal.hide();
                });
    };

    $scope.$watch('search', function (newVal, oldVal) {
        if (angular.isDefined(newVal) && newVal !== oldVal) {
            $scope.personServiceRef.doSearch(newVal);
        }
    });

    $scope.$watch('order', function (newVal, oldVal) {
        console.log(newVal + " " + oldVal);
        if (angular.isDefined(newVal) && newVal !== oldVal) {
            $scope.personServiceRef.doOrder(newVal);
        }
    });

    $scope.loadMorePeople = function () {
        $scope.personServiceRef.loadMore();
    };
});

app.service('PersonService', function (Person, $q, toaster) {

    var peopleList = [];

    var self = {
        'page': 1,
        'hasMore': true,
        'isLoading': false,
        'isSaving': false,
        'isDeleting': false,
        'selectedPerson': null,
        'peopleList': [],
        'search': null,
        'order': null,
        'getPerson': function (id) {
            for (var i = 0; i < self.peopleList.length; i++) {
                if (self.peopleList[i].pk == id) {
                    return self.peopleList[i];
                }
            }
        },
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
            var d = $q.defer();
            self.isSaving = true;
            person.$update().then(function () {
                self.isSaving = false;
                toaster.pop('success', 'Updated ' + person.name);
                d.resolve();
            });
            return d.promise;
        },
        'deletePerson': function (person) {
            var d = $q.defer();
            self.isDeleting = true;
            person.$remove().then(function () {
                self.isDeleting = false;
                var index = self.peopleList.indexOf(person);
                self.peopleList.splice(index, 1);
                self.selectedPerson = null;
                toaster.pop('success', 'Deleted ' + person.name);
                d.resolve();
            });
            return d.promise;
        },
        'addPerson': function (person) {
            var d = $q.defer();
            self.isSaving = true;
            Person.save(person).$promise.then(function (data) {
                self.isSaving = false;
                self.selectedPerson = null;
                self.hasMore = true;
                self.page = 1;
                self.peopleList = [];
                self.loadPeople();
                console.log(data);
                toaster.pop('success', 'Added ' + person.name);
                d.resolve();
            });

            return d.promise;
        }


    };

    self.loadPeople();

    return self;

});