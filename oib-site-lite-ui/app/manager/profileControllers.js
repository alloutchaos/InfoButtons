    'use strict';

var oibManagerModule = angular.module('oibManagerModule', ['ngRoute', 'ngResource', 'ab-base64', 'ui.bootstrap']);

oibManagerModule.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
                .when('/editProfile', {
                    templateUrl: 'manager/profileForm.html',
                    controller: 'ProfileFormCtrl'
                })
                .when('/editProfile/:id', {
                    templateUrl: 'manager/profileForm.html',
                    controller: 'ProfileFormCtrl'
                })
                .when('/manager', {
                    templateUrl: 'manager/profiles.html',
                    controller: 'ProfileCtrl'
                })
                .when('/cloudManager', {
                    templateUrl: 'manager/cloudManager.html',
                    controller: 'CloudProfileCtrl'
                });
    }]);

oibManagerModule.controller('ProfileCtrl', ['$scope', 'profileFactory', function ($scope, profileFactory) {

        $scope.localProfiles = [];
        $scope.cloudProfiles = [];
        $scope.status;

        getLocalProfiles();

        function getLocalProfiles() {
            profileFactory.getProfiles()
                    .success(function (profiles) {
                        $scope.localProfiles = profiles;
                    })
                    .error(function (error) {
                        $scope.status = 'Unable to load local profiles: ' + error;
                    });
        }

        return $scope;
    }]);

oibManagerModule.controller('ProfileFormCtrl', ['$scope', '$routeParams', 'profileFactory', function ($scope, $routeParams, profileFactory) {

        loadProfile();

        function loadProfile () {
            if ($routeParams.id) {
                profileFactory.getProfile($routeParams.id)
                    .success(function (profile) {                        
                        $scope.profile = profile;
                    })
                    .error(function (error) {
                        $scope.status = 'Unable to load local profile ' + $routeParams.id + ': ' + error;
                    });
            }
        }

        $scope.clearDb = function () {

        }

        $scope.clearForm = function (profile) {
            $scope.profile = {};
        
        }

        $scope.create = function (profile) {
            
            profileFactory.insertProfile(profile)
                    .success(function (msg) {                        
                        $scope.statusMessage = msg.object + ' ' + msg.event;
                    })
                    .error(function (error) {
                        $scope.statusMessage = 'Unable to save profile:' + error;
                    });
            
        }

        $scope.update = function (profile) {
            profileFactory.updateProfile(profile)
                    .success(function (msg) {                        
                        $scope.statusMessage = msg.object + ' ' + msg.event;
                    })
                    .error(function (error) {
                        $scope.statusMessage = 'Unable to save profile:' + error;
                    });
        }

        $scope.delete = function (profile) {
            alert("delete profile!");
        }

        return $scope;
    }]);

oibManagerModule.controller('CloudProfileCtrl', ['$scope', '$modal','$http', '$route', 'base64', 'cloudProfileFactory', function ($scope, $modal, $http, $route, base64, cloudProfileFactory) {

        //$scope.cloudLinks = [{cha: "cha1.1", title: "Cloud Profile Title 1.1", description: "How about this cloud profile 1.1"}
        //    , {cha: "cha2", title: "Cloud Profile Title 2", description: "This is the extra awesome profile 2"}
        //    , {cha: "cha3.1", title: "Cloud Profile Title 3.1", description: "This is cloud profile 3.1"}];

    var cloudProfileLinks = [];

    cloudProfileLinks = cloudProfileFactory.getCloudProfiles(base64);

    getLocalCloudProfiles();

    function getLocalCloudProfiles() {
        cloudProfileFactory.getLocalCloudProfiles()
            .success(function (profiles) {
                $scope.localCloudProfiles = profiles;
            })
            .error(function (error) {
                $scope.status = 'Unable to load local profiles: ' + error;
            });
    }

    $scope.cloudProfileLinks = cloudProfileLinks;

   function downloadProfile (profile, oids) {
        cloudProfileFactory.downloadProfile(profile, oids)
            .success(function (msg) {
                $scope.statusMessage = msg.object + ' ' + msg.event;
                $route.reload();
            })
            .error(function (error) {
                $scope.statusMessage = 'Unable to download profile:' + error;
                $route.reload();
            });
    }

    $scope.update = function (profile) {
        cloudProfileFactory.updateProfile(profile.name);
        $route.reload();
    }

    $scope.notInstalled = function (localCloudProfiles) {

        return function (cloudProfileLink) {
            var x = true;
            localCloudProfiles.forEach(function (localProfile) {

                if (localProfile.name === cloudProfileLink.title) {
                    x = false;
                }
            });
            return x;
        }
    }

    $scope.isUpdated = function () {

        return function (localCloudProfile) {
            var x = true;
            cloudProfileLinks.forEach(function (cloudProfileLink) {

                if (localCloudProfile.name === cloudProfileLink.title) {
                    if (localCloudProfile.version != cloudProfileLink.sha)
                    x = false;
                }
            });
            return x;
        }
    }

    $scope.needsUpdate = function () {

        return function (localCloudProfile) {
            var x = false;
            cloudProfileLinks.forEach(function (cloudProfileLink) {

                if (localCloudProfile.name === cloudProfileLink.title) {
                    if (localCloudProfile.version != cloudProfileLink.sha)
                        x = true;
                }
            });
            return x;
        }
    }

    var oids = [];
    oids.push({})

    $scope.items = [{name:'Veterans Administration',oid:'1.3.6.1.4.1.3768', selected: false},
                    {name:'Marine Biology Laboratory',oid:'MBL', selected: false},
                    {name:'National Institutes of Health',oid:'2.16.840.1.113762', selected: false},
                    {name:'Duke University Health System',oid:'1.3.6.1.4.1.4275', selected: false},
                    {name:'National Library of Medicine',oid:'1.3.6.1.4.1.6014', selected: false},
                    {name:'University of Washington',oid:'1.3.6.1.4.1.150', selected: false},
                    {name:'University of Utah',oid:'1.3.6.1.4.1.5884', selected: false},
                    {name:'Northwestern University',oid:'2.16.840.1.113883.3.1951', selected: false},
                    {name:'Axeium',oid:'http://axeium.net', selected: false},
                    {name:'Lehigh Valley Health Network',oid:'http://lvhn.org', selected: false}];

    $scope.openModal = function(profile) {

        var modalInstance = $modal.open({
            templateUrl: 'modalContent.html',
            controller: 'ModalController',
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            downloadProfile(profile,selectedItem);
        }, function () {
            $scope.status ='Modal dismissed at: ' + new Date();
        });
    };

    }]);

    /**
     * Checklist-model
     * AngularJS directive for list of checkboxes
     */

    angular.module('checklist-model', [])
        .directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {
            // contains
            function contains(arr, item) {
                if (angular.isArray(arr)) {
                    for (var i = 0; i < arr.length; i++) {
                        if (angular.equals(arr[i], item)) {
                            return true;
                        }
                    }
                }
                return false;
            }

            // add
            function add(arr, item) {
                arr = angular.isArray(arr) ? arr : [];
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], item)) {
                        return arr;
                    }
                }
                arr.push(item);
                return arr;
            }

            // remove
            function remove(arr, item) {
                if (angular.isArray(arr)) {
                    for (var i = 0; i < arr.length; i++) {
                        if (angular.equals(arr[i], item)) {
                            arr.splice(i, 1);
                            break;
                        }
                    }
                }
                return arr;
            }

            // http://stackoverflow.com/a/19228302/1458162
            function postLinkFn(scope, elem, attrs) {
                // compile with `ng-model` pointing to `checked`
                $compile(elem)(scope);

                // getter / setter for original model
                var getter = $parse(attrs.checklistModel);
                var setter = getter.assign;

                // value added to list
                var value = $parse(attrs.checklistValue)(scope.$parent);

                // watch UI checked change
                scope.$watch('checked', function(newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    var current = getter(scope.$parent);
                    if (newValue === true) {
                        setter(scope.$parent, add(current, value));
                    } else {
                        setter(scope.$parent, remove(current, value));
                    }
                });

                // watch original model change
                scope.$parent.$watch(attrs.checklistModel, function(newArr, oldArr) {
                    scope.checked = contains(newArr, value);
                }, true);
            }

            return {
                restrict: 'A',
                priority: 1000,
                terminal: true,
                scope: true,
                compile: function(tElement, tAttrs) {
                    if (tElement[0].tagName !== 'INPUT' || !tElement.attr('type', 'checkbox')) {
                        throw 'checklist-model should be applied to `input[type="checkbox"]`.';
                    }

                    if (!tAttrs.checklistValue) {
                        throw 'You should provide `checklist-value`.';
                    }

                    // exclude recursion
                    tElement.removeAttr('checklist-model');

                    // local scope var storing individual checkbox model
                    tElement.attr('ng-model', 'checked');

                    return postLinkFn;
                }
            };
        }]);
