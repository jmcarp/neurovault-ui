
//
$(document).ready(function(){
    $('#fileupload').fileupload({
        url : '/uploadHandler/',
        autoUpload : true,
        singleFileUploads : true,
    });
});

var UploadApp = angular.module('UploadApp', ['ngGrid']);

UploadApp.controller('UploadGroupCtrl', function($scope) {

    // Initialize files
    $scope.files = [];

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
        plugins: [new ngGridFlexibleHeightPlugin()],
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

});