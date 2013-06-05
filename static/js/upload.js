var UploadApp;

(function () {
    'use strict';

    var url = 'uploadHandler/';

    UploadApp = angular.module('UploadApp', [
        'blueimp.fileupload', 'ngGrid'
    ])
        .config([
            '$httpProvider', 'fileUploadProvider',
            function ($httpProvider, fileUploadProvider) {
                // Demo settings:
                delete $httpProvider.defaults.headers.common['X-Requested-With'];
                angular.extend(fileUploadProvider.defaults, {
                    disableImageResize: true,
                    maxFileSize: 25000000,
                    //acceptFileTypes: /(\.|\/)(nii|img|hdr|mat|nii\.gz)$/i
                 });
            }
        ])

        .controller('DemoFileUploadController', [
            '$scope', '$http',
            function ($scope, $http) {
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

        $scope.$on('fileuploadadd', function(post, data){
            console.log(post);
            console.log(data);
            console.log($scope);
            var gid = 0,
                gidmap = {},
                noext;
            console.log(data.files);
            for (var i=0; i < data.files.length; ++i) {
                var file = data.files[i];
                console.log(file);
                // .$apply to update angular when something else makes changes
                file.fullname = file.relativePath + file.name;
                file.path = file.relativePath;
                file.gid = 0;
                if (file.fullname.match(/\.img$/i)) {
                    file.gid = ++gid;
                    gidmap[file.fullname.replace(/\.img$/, '')] = gid;
                }
                console.log($scope);
            }
            console.log(gidmap);

            // TODO: add brik/head etc.
            for (var i=0; i < data.files.length; ++i) {
                var file = data.files[i];
                if (file.fullname.match(/\.(hdr|mat)$/i)) {
                    noext = file.fullname.replace(/\.(hdr|mat)$/i, '');
                    if (noext in gidmap) {
                        file.gid = gidmap[noext];
                    }
                }
            };
        });
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
