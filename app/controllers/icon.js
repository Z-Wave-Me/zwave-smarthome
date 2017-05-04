/**
 * @overview Controllers that handle all custom icon actions – displays and uploads.
 * @author Martin Vach
 */

/**
 * The controller that renders and upload icons.
 * @class LocalIconController
 */
myAppController.controller('LocalIconController', function ($scope, $filter, $timeout, $q, cfg, dataFactory, dataService, _) {
    $scope.icons = {
        show: true,
        find: {},
        upload: false,
        all: {},
        source: {
            cnt:{},
            title: {}
        },
        filter: {},
        used: {
            device: {}
        },
        info: {
            maxSize: $filter('fileSizeString')(cfg.upload.icon.size),
            extensions: cfg.upload.icon.extension.toString()
        },
        infoPacked: {
            maxSize: $filter('fileSizeString')(cfg.upload.icon_packed.size),
            extensions: cfg.upload.icon_packed.extension.toString()
        }
    };
    $scope.checkAll = false;
    /**
     * Load all promises
     * @returns {undefined}
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('icons', null, true),
            dataFactory.getApi('devices', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var icons = response[0];
            var devices = response[1];

            $scope.loading = false;
            // Error message
            if (icons.state === 'rejected' || devices.state === 'rejected') {
                $scope.icons.show = false;
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - icons
            if (icons.state === 'fulfilled') {
               // $scope.icons.all = icons.value.data.data;
                setIcons(icons.value.data.data);
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                $scope.icons.used.device = iconUsedInDevice(devices.value.data.data.devices);
            }


        });
    };
    $scope.allSettled();
    
    /**
     * Set a filter
     * @param {string} val
     * @returns {undefined}
     */
    $scope.setFilter = function (val) {
        $scope.icons.filter = (val||{});
        $scope.allSettled();
    };

    /**
     * Check and validate an uploaded file
     * @param {object} files
     * @param {object} info
     * @returns {undefined}
     */
    $scope.checkUploadedFile = function (files, info) {
        // Extends files object with a new property
        files[0].newName = dataService.uploadFileNewName(files[0].name);
        // Check allowed file formats
        if (info.extension.indexOf($filter('fileExtension')(files[0].name)) === -1) {
            alertify.alertError(
                    $scope._t('upload_format_unsupported', {'__extension__': $filter('fileExtension')(files[0].name)}) + ' ' +
                    $scope._t('upload_allowed_formats', {'__extensions__': info.extension.toString()})
                    );
            return;

        }
        // Check allowed file size
        if (files[0].size > info.size) {
            alertify.alertError(
                    $scope._t('upload_allowed_size', {'__size__': $filter('fileSizeString')(info.size)}) + ' ' +
                    $scope._t('upload_size_is', {'__size__': $filter('fileSizeString')(files[0].size)})
                    );
            return;

        }
        // Check if uploaded filename already exists
        if (_.findWhere($scope.icons.all, {file: files[0].name})) {
            // Displays a confirm dialog and on OK atempt to upload file
            alertify.confirm($scope._t('uploaded_file_exists', {__file__: files[0].name})).set('onok', function (closeEvent) {
                uploadFile(files);
            });
        } else {
            uploadFile(files);
        }
    };

    /**
     * Check all icons
     * @param {boolean} status
     * @returns {undefined}
     */
    $scope.toggleAll = function (status) {
        if (typeof status === 'boolean') {
            $scope.checkAll = status;
        } else {
            $scope.checkAll = !$scope.checkAll;
        }
        for(var k in $scope.icons.all) {
            $scope.icons.all[k].checked = $scope.checkAll;
        }
    };

    /**
     * Delete an icon from the storage
     * @param {object} icon
     * @param {string} message
     * @returns {undefined}
     */
    $scope.deleteIcon = function (icon, message) {
        alertify.dismissAll();
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('icons', icon.file).then(function (response) {
                $scope.loading = false;
                /*$scope.icons.all = _.reject($scope.icons.all, function (v) {
                    return v.file === icon.file;
                });*/
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.allSettled();

                //$route.reload();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        });

    };

    /**
     * Delete all checked icons from the storage
     * @param {string} message
     * @returns {undefined}
     */
    $scope.deleteChecked = function (message) {
        var cnt = 0;
        var errors = 0;
        alertify.dismissAll();
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            angular.forEach($scope.icons.all,function(v,k){
                if(!v.checked){
                    return;
                }
                cnt++;
                dataFactory.deleteApi('icons', v.file).then(function (response) {

                }, function (error) {
                    errors++;
                });
                //console.log(v.file)
            });
            $scope.loading = false;
            if(errors > 0){
                alertify.alertError($scope._t('cannot_delete_all_icons'));

            }else if(cnt == 0){
                alertify.alertError($scope._t('nothing_deleted'));
            }else{
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.allSettled();
                $scope.toggleAll(false);
            }

        });

    };

    /// --- Private functions --- ///

    /**
     * Upload a file
     * @param {object} files
     * @returns {undefined}
     */
    function uploadFile(files) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('uploading')};
        // Clear all alerts and file name selected
        alertify.dismissAll();
        // Set local variables
        var fd = new FormData(),
                input = {file: files[0].name, device: []};
        // Set selected file name
        $scope.icons.upload = files[0].name;
        // Set form data
        fd.append('files_files', files[0]);
        // Atempt to upload a file
        dataFactory.uploadApiFile(cfg.api.icons_upload, fd).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_upload')});
            $scope.allSettled();

        }, function (error) {
            $scope.icons.find = {};
            alertify.alertError($scope._t('error_upload'));
            $scope.loading = false;
        });
    }
    ;
    /**
     * Set list with uploaded icons
     * @param {object} icons
     * @returns {undefined}
     */
    function setIcons(icons){
        var data = _.chain(icons)
                .flatten()
                .filter(function (v) {
                    v.checked = false;
                    v.source_title = (!v.source_title ? 'Custom': v.source_title);
                    $scope.icons.source.title[v.source] = v.source_title;
                    return v;
                });
        // Count apps in categories
         $scope.icons.source.cnt = data.countBy(function (v) {
            return v.source;
        }).value();
        var icons = data.where($scope.icons.filter).value();
        // If filter and no result show all icons
        if(!_.isEmpty($scope.icons.filter) && _.isEmpty(icons)){
            $scope.icons.filter = {};
            $scope.icons.all = data.value();
            return;
        }
        $scope.icons.all = icons;
    }
    /**
     * Build an object with icons that are used in devices
     * @param {object} devices
     * @returns {object}
     */
    function iconUsedInDevice(devices) {
        var output = {};
        angular.forEach(devices, function (v, k) {
            // Device has custom icons
            if (v.customIcons) {
                angular.forEach(v.customIcons.level || v.customIcons, function (iv, ik) {
                    if (output[iv]) {
                        if(!output[iv].indexOf(v.id)){
                            output[iv].push(v.id);
                        }

                    } else {
                        output[iv] = [v.id];
                    }
                });
            }
        });
        return output;
    }
    ;
});

/**
 * The controller that renders and download icons from the app store.
 * @class OnlineIconController
 */
myAppController.controller('OnlineIconController', function ($scope, $filter, $timeout, $q, $location, cfg, dataFactory, dataService, _) {
    $scope.iconsOnline = {
        connect: {
            status: false,
            icon: 'fa-globe fa-spin'
        },
        alert: {message: false, status: 'is-hidden', icon: false},
        all: {},
        find: {},
        preview: {}
    };
    $scope.iconsLocalSource = {};

    /**
     * Load all promises
     * @returns {undefined}
     */

    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('icons', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var icons = response[0];
            // Error message
            if (icons.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - icons
            if (icons.state === 'fulfilled') {
                setLocalIcons(icons.value.data.data);
            }
        });
    };
    $scope.allSettled();

   /**
    * Load on-line icons
    * @returns {undefined}
    */
    $scope.loadOnlineIcons = function () {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getRemoteData(cfg.online_icon_url).then(function (response) {
            $scope.iconsOnline.connect = {
                status: true,
                icon: 'fa-globe'
            };
            if (_.size(response.data.data) < 1) {
                alertify.alertError($scope._t('no_data'));
                return;
            }
            setOnlineIcons(response.data.data);
        }, function (error) {
            if(error.status === 0){
                $scope.iconsOnline.connect = {
                    status: false,
                    icon: 'fa-exclamation-triangle text-danger'
                };
                $scope.iconsOnline.alert = {message: $scope._t('no_internet_connection',{__sec__: (cfg.pending_remote_limit/1000)}), status: 'alert-warning', icon: 'fa-wifi'};

            }else{
                alertify.alertError($scope._t('error_load_data'));
            }
        }).finally(function(){
            $scope.loading = false;
        });
    };
    $scope.loadOnlineIcons();

    /**
     * Open a modal window and load icon previews
     * @returns {undefined}
     */
    $scope.handleOnlineIconModal = function (icon,modal,event) {
        $scope.iconsOnline.find = icon;
        $scope.handleModal(modal, event);
         dataFactory.getRemoteData(cfg.online_icon_preview_url + '/' + icon.name).then(function (response) {
              if (_.size(response.data.data) < 1) {
                alertify.alertError($scope._t('no_data'));
                return;
            }
            $scope.iconsOnline.preview = response.data.data;

        }, function (error) {
             alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });

    };

    
    /**
     * Download an icon set
     * @param {object} icon
     * @returns {undefined}
     */
    $scope.downloadIconSet = function (icon) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        dataFactory.postApi('icons_install', icon).then(function (response) {
            dataService.showNotifier({message: $scope._t('success_file_download')});
            $location.path('/customize/iconslocal');
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_file_download'));
        });
    };

    /// --- Private functions --- ///

    /**
     * Set online icons $scope
     * @param {object} response
     * @returns {undefined}
     */
    function setOnlineIcons(response) {
        $scope.iconsOnline.all = _.chain(response)
                .flatten()
                .filter(function(v) {
                    v.status = 'download';
                    _.each($scope.iconsLocalSource, function(ils) {
                        if(ils.id === v.id && ils.source === v.name) {
                            v.status = 'installed';
                        }
                    });
                    return v;
                })
                .indexBy('name')
                .value();
    };

    /**
     * Set online icons $scope
     * @param {object} response
     * @returns {undefined}
     */
    function setLocalIcons(response) {

        $scope.iconsLocalSource = Object.keys(_.groupBy(response, function(icon){
            return icon.source;
        })).map(function(icon) {
            return {
                "id": getId(icon),
                "source": getSource(icon)
            };
        });
    }

    /**
     * Get source/name from source
     * @param {object} source
     * @returns {undefined}
     */
    function getSource(source) {
        return source.substring(0, source.lastIndexOf("_"));
    }

    /**
     * Get id from source
     * @param {object} source
     * @returns {undefined}
     */
    function getId(source) {
        return source.substring(source.lastIndexOf("_") + 1, source.length);
    }
});