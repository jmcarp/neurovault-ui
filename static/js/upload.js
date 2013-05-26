var UploadApp;

(function () {
    'use strict';

    var isOnGitHub = window.location.hostname === 'blueimp.github.com' ||
            window.location.hostname === 'blueimp.github.io',
        url = isOnGitHub ? '//jquery-file-upload.appspot.com/' : 'uploadHandler/';

    UploadApp = angular.module('UploadApp', [
        'blueimp.fileupload', 'ngGrid'
    ])
        .config([
            '$httpProvider', 'fileUploadProvider',
            function ($httpProvider, fileUploadProvider) {
                if (isOnGitHub) {
                    // Demo settings:
                    delete $httpProvider.defaults.headers.common['X-Requested-With'];
                    angular.extend(fileUploadProvider.defaults, {
                        disableImageResize: true
                    });
                }
            }
        ])

        .controller('DemoFileUploadController', [
            '$scope', '$http',
            function ($scope, $http) {
                if (!isOnGitHub) {
                    $scope.loadingFiles = true;
                    $scope.options = {
                        url: url,
                        singleFileUploads : false
                    };
                    $http.get(url)
                        .then(
                            function (response) {
                                $scope.loadingFiles = false;

                                if (response.data.files.length)
                                    $scope.queue = response.data.files;
                            },
                            function () {
                                $scope.loadingFiles = false;
                            }
                        );
                }
        // Initialize files
        $scope.files = [];

        $scope.$on('fileuploadadd', function(post, data){
            console.log(post);
            console.log(data);
            console.log($scope);
            for (var i=0; i < data.files.length; ++i) {
                var file = data.files[i];
                // .$apply to update angular when something else makes changes
                $scope.$apply(
                    $scope.files.push({
                        name : file.name,
                        fullname : file.relativePath + file.name,
                        path : file.relativePath,
                        gid : 0,
                    })
                );
            }
        });
        $scope.gridOptions = {
            data : 'files',
            columnDefs : [
                {
                    field : 'fullname',
                    displayName : 'Name',
                },
                {
                    field : 'gid',
                    displayName : 'Group ID',
                },
                /*
                {
                    displayName : 'Tags',
                    cellTemplate : '<div><input type="text" class="tags" /></div>',
                },
                */
            ],
            plugins: [new ngGridFlexibleHeightPlugin()]
        };

        var nfiles;

        function guessGUID(e, data) {

            var gid = 0,
                gidmap = {},
                noext;

            //
            for (var i=0; i < $scope.files.length; ++i) {
                var file = $scope.files[i];
                if (file.fullname.match(/\.img$/i)) {
                    $scope.$apply($scope.files[i].gid = ++gid);
                    gidmap[file.fullname.replace(/\.img$/, '')] = gid;
                }
            };

            // TODO: add brik/head etc.
            for (var i=0; i < $scope.files.length; ++i) {

                var file = $scope.files[i];

                if (file.fullname.match(/\.(hdr|mat)$/i)) {

                    noext = file.fullname.replace(/\.(hdr|mat)$/i, '');

                    if (noext in gidmap) {
                        $scope.$apply($scope.files[i].gid = gidmap[noext]);
                    }

                }
            };

        }

        /*
        $('#fileupload').bind('fileuploaddrop', function(e, data) {
            nfiles = data.files.length;
        });

        //
        $('#fileupload').bind('fileuploadadd', function(e, data) {
            // Add the files to the list

            for (var i=0; i < data.files.length; ++i) {
                var file = data.files[i];
                // .$apply to update angular when something else makes changes
                $scope.$apply(
                    $scope.files.push({
                        name : file.name,
                        fullname : file.relativePath + file.name,
                        path : file.relativePath,
                        gid : 0,
                    })
                );
            }

            //
            if (e.eventPhase == 2 || $scope.files.length == nfiles) {
                guessGUID(e, data);
            }

        });
        */
            }
        ])

        .controller('FileDestroyController', [
            '$scope', '$http',
            function ($scope, $http) {
                var file = $scope.file,
                    state;
                if (file.url) {
                    file.$state = function () {
                        return state;
                    };
                    file.$destroy = function () {
                        state = 'pending';
                        return $http({
                            url: file.delete_url,
                            method: file.delete_type
                        }).then(
                            function () {
                                state = 'resolved';
                                $scope.clear(file);
                            },
                            function () {
                                state = 'rejected';
                            }
                        );
                    };
                }
            }
        ])


}());
