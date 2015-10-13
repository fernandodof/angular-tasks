var app = angular.module('phonebook', [
    'jcs-autoValidate',
    'angular-ladda',
    'ngResource',
    'infinite-scroll',
    'angularSpinner',
    'toaster',
    'ngAnimate',
    'ui.router',
    
    'phonebook.directives.ccSpinner',
    'phonebook.directives.ccCard',
    'phonebook.config.config',
    'phonebook.controllers.person.PersonDetailController',
    'phonebook.controllers.person.PersonCreateController',
    'phonebook.controllers.person.PersonListController',
    'phonebook.filters.defaultImage',
    'phonebook.services.PersonService',
    'phonebook.factories.Person'
]);

var api_base = 'http://localhost:8000/api';