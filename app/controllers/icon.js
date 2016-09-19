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
        source: {},
        filter: {},
        used: {
            device: {},
            test: []
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
    /**
     * Load all promises
     * @returns {undefined}
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApiLocal('icons.json'),
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
     * Delete an icon from the storage
     * @param {string} val
     * @returns {undefined}
     */
    $scope.setFilter = function (val) {
        $scope.icons.filter = (val||false);
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
     * Delete an icon from the storage
     * @param {object} icon
     * @param {string} message
     * @returns {undefined}
     */
    $scope.deleteIcon = function (icon, message) {
        alertify.dismissAll();
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.getApiLocal('icons.json').then(function (response) {
                $scope.loading = false;
                $scope.icons.all = _.reject($scope.icons.all, function (v) {
                    return v.file === icon.file;
                });
                dataService.showNotifier({message: $scope._t('delete_successful')});

                //$route.reload();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
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
        //var cmd = $scope.cfg.api_url + 'upload/file';
        // Set selected file name
        $scope.icons.upload = files[0].name;
        // Set form data
        fd.append('files_files', files[0]);
        // Atempt to upload a file
        dataFactory.getApiLocal('icons.json').then(function (response) {
            $timeout(function () {
                if (!_.findWhere($scope.icons.all, {file: files[0].name})) {
                    $scope.icons.all.push(input);
                }
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('success_upload')});
            }, 2000);

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
                    return v;
                });
         // Count apps in categories
         $scope.icons.source = data.countBy(function (v) {
            return v.source;
        }).value();
        $scope.icons.all = data.where($scope.icons.filter).value();
    }
    /**
     * Build an object with icons that are used in devices
     * @param {object} devices
     * @returns {object}
     */
    function iconUsedInDevice(devices) {
        var output = {};
        angular.forEach(devices, function (v, k) {
            // For testing purposes
            if (v.id === 'ZWayVDev_zway_2-0-156-0-A') {
                v.custom_icons = {on: 'cat-box-icon.png', off: 'cat-cage-icon.png'};
            } else if (v.id === 'ZWayVDev_zway_2-0-49-3') {
                v.custom_icons = {'default': 'cat-cage-icon.png'};
            }
            // Device has custom icons
            if (v.custom_icons) {
                angular.forEach(v.custom_icons, function (iv, ik) {
                    if (output[iv]) {
                        //icon[iv] = [v.id];
                        output[iv].push(v.id);
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
        all: {},
        find: {},
        preview: {}
    };
   /**
    * Load on-line icons
    * @returns {undefined}
    */
    $scope.loadOnlineIcons = function () {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getRemoteData(cfg.online_icon_url).then(function (response) {
            $scope.loading = false;
            if (_.size(response.data.data) < 1) {
                alertify.alertError($scope._t('no_data'));
                return;
            }
            setOnlineIcons(response.data.data);
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
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
        dataFactory.getApiLocal('icons_online.json').then(function (response) {
            $timeout(function () {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('success_file_download')});
            }, 2000);
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
                .indexBy('name')
                .value();
    }
    ;
});