angular.module('phonebook.config.config', [])
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state('list', {
                        url: '/',
                        views: {
                            'main': {
                                templateUrl: 'templates/list.html',
                                controller: 'PersonListController'
                            },
                            'search': {
                                templateUrl: 'templates/searchForm.html',
                                controller: 'PersonDetailController'
                            }
                        }
                    })
                    .state('edit', {
                        url: '/edit/:id',
                        views: {
                            'main': {
                                templateUrl: 'templates/edit.html',
                                controller: 'PersonDetailController'
                            }
                        }
                    })
                    .state('create', {
                        url: '/create',
                        views: {
                            'main': {
                                templateUrl: 'templates/edit.html',
                                controller: 'PersonCreateController'
                            }
                        }
                    });
            $urlRouterProvider.otherwise('/');
        })
        .config(function ($httpProvider, $resourceProvider, laddaProvider) {
            $resourceProvider.defaults.stripTralingSlashes = false;
            laddaProvider.setOption({
                style: 'expand-right'
            });
        }); 