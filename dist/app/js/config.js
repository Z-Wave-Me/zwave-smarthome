/**
 * @overview The main configuration file.
 * @author Martin Vach
 */

/**
 * Configuration object
 * @class config_data
 */
var config_data = {
    'cfg': {
        //Application name
        'app_name': 'SmartHome UI',
        // Application version
        'app_version': '1.7.0-RC-20',
        // Application (DIST) built date
        'app_built': '13-04-2017 16:14:11',
        // Application ID
        'app_id': 'SmartHomeUI',
        // Server base url
        'server_url': '/',
        //'server_url': 'http://192.168.10.119:8083/',
        // Interval in miliseconds to refresh data
        'interval': 3000,
        // Displays a connection error After reaching the limit (milisecons)
        'pending_timeout_limit': 10000,
        /// Set to > 0 (milisecons) to simulate latency for http Calls
        'latency_timeout': 0,
        // User
        'user': {},
        // Route - will be extended
        'route': {
            // Current location
            location: {},
            // Server name
            serverName: '',
            // Time zone
            time: {
                string: false,
                timestamp: false
            },
            // User agent operating system
            os: 'unknown',
            // Route fatal error
            fatalError: {
                type: 'system',// system|network
                message: false,
                info: false,
                permanent: false, // Permanently displayed
                hide: false, // Hide page content
                icon: 'fa-exclamation-triangle',
                icon_jamesbox: 'fa-spinner fa-spin'
            },
            // App lang
            lang: 'en',
            // User data
            user: false,
            // Translations
            t: {}
        },
        // Zwave - will be extended
        'zwave': {
            remoteId: null,
            uuid: null,
            softwareRevisionVersion: null,
            capabillities: null,
            scratchId: null
        },
        'history_cache_interval': 300000,
        // Default auth credentials
        'default_credentials': {
            'login': 'admin',
            'password': 'admin'
        },
        // List of API URLs 
        'api': {
            'devices': 'ZAutomation/api/v1/devices',
            'hide_devices': 'ZAutomation/api/v1/hidedevices',
            'profiles': 'ZAutomation/api/v1/profiles',
            'profiles_auth_update': 'ZAutomation/api/v1/auth/update',
            'locations': 'ZAutomation/api/v1/locations',
            'notifications': 'ZAutomation/api/v1/notifications',
            'modules': 'ZAutomation/api/v1/modules',
            'modules_categories': 'ZAutomation/api/v1/modules/categories',
            'online_install': 'ZAutomation/api/v1/modules/install',
            'online_update': 'ZAutomation/api/v1/modules/update',
            'online_delete': 'ZAutomation/api/v1/modules/delete',
            'online_reset': 'ZAutomation/api/v1/modules/reset',
            'instances': 'ZAutomation/api/v1/instances',
            'namespaces': 'ZAutomation/api/v1/namespaces',
            'history': 'ZAutomation/api/v1/history',
            'login': 'ZAutomation/api/v1/login',
            'logout': 'ZAutomation/api/v1/logout',
            'session': 'ZAutomation/api/v1/session',
            'backup': 'ZAutomation/api/v1/backup',
            'restore': 'ZAutomation/api/v1/restore',
            'tokens': 'ZAutomation/api/v1/modules/tokens',
            'password_reset': 'ZAutomation/api/v1/auth/forgotten',
            'remote_id': 'ZAutomation/api/v1/system/remote-id',
            'firmwareupdate': 'ZAutomation/api/v1/system/webif-access',
            'trust_my_network': 'ZAutomation/api/v1/system/trust-my-network',
            'firstaccess': 'ZAutomation/api/v1/system/first-access',
            'factory_default': 'ZAutomation/api/v1/resetToFactoryDefault',
            'postfix': 'ZWaveAPI/Postfix',
            'time': 'ZAutomation/api/v1/system/time/get',
            'system_info': 'ZAutomation/api/v1/system/info',
            'system_reboot': 'ZAutomation/api/v1/system/reboot',
            'skins': 'ZAutomation/api/v1/skins',
            'skins_install': 'ZAutomation/api/v1/skins/install',
            'skins_update': 'ZAutomation/api/v1/skins/update',
            'skins_active': 'ZAutomation/api/v1/skins/active',
            'skins_reset': 'ZAutomation/api/v1/skins/setToDefault',
            'ping': '/ZAutomation/api/v1/system/time/get',
            'icons': 'ZAutomation/api/v1/icons',
            'icons_install': 'ZAutomation/api/v1/icons/install',
            'customicon': 'ZAutomation/api/v1/devices',
            'icons_upload': 'ZAutomation/api/v1/icons/upload',
            'cloudbackup': 'CloudBackupAPI/Backup',
            'update_device_database': 'ZWaveAPI/ZWaveDeviceInfoUpdate',
            'app_built_info': 'app/info.json',
            'configget_url': 'ZWaveAPI/ExpertConfigGet',
            'configupdate_url': 'ZWaveAPI/ExpertConfigUpdate',
            'time_zone': 'ZAutomation/api/v1/system/timezone'
        },
        // List of remote api URLs
        'api_remote': {
            // JamesBox request
            //'jamesbox_request': 'http://dev.dev/jamesbox/zbu_ui_handling.php?action=request',
            'jamesbox_request': 'http://razberry.z-wave.me/zbu_ui_handling.php?action=request',
            // JamesBox update
            //'jamesbox_update': 'http://dev.dev/jamesbox/zbu_ui_handling.php?action=update',
            'jamesbox_update': 'http://razberry.z-wave.me/zbu_ui_handling.php?action=update',
            // JamesBox update info
            //'jamesbox_updateinfo': 'http://dev.dev/jamesbox/zbu_ui_handling.php?action=updateinfo',
            'jamesbox_updateinfo': 'http://razberry.z-wave.me/zbu_ui_handling.php?action=updateinfo',
            // JamesBox cancel update
            //'jamesbox_cancel_update: 'http://dev.dev/jamesbox/zbu_ui_handling.php?action=cancelupdate',
            'jamesbox_cancel_update': 'http://razberry.z-wave.me/zbu_ui_handling.php?action=cancelupdate'
        },
        // Skin
        'skin': {
            'active': 'default',
            'path': 'user/skins/'
        },
        // List of image pathes
        'img': {
            'logo': 'storage/img/logo/',
            'icons': 'storage/img/icons/',
            'custom_icons': 'user/icons/',
            'skin_screenshot': 'app/css/',
            'zwavedevices': 'storage/img/zwave/zwavedevices/',
            'zwavevendors': 'storage/img/zwave/zwavevendors/'
        },
        // Upload settings
        'upload': {
            'room': {
                size: 512000, //Bytes
                type: ['image/jpeg', 'image/gif'],
                extension: ['jpg', 'jpeg', 'gif'],
                dimension: '200 x 200'//px
            },
            'icon': {
                size: 30720, //Bytes
                type: ['image/png', 'image/jpeg', 'image/gif'],
                extension: ['png', 'jpg', 'jpeg', 'gif'],
                dimension: '64 x 64'//px
            },
            'icon_packed': {
                size: 2097152, //Bytes
                type: ['application/x-zip-compressed', 'application/x-gzip'],
                extension: ['zip', 'gz'],
                dimension: '64 x 64'//px
            }
        },
        // Api url
        'expert_url': '/expert',
        // Api url
        'api_url': 'ZAutomation/api/v1/',
        // ZWave api url
        'zwave_api_url': 'ZWaveAPI/',
        // ZWave JS url
        'zwave_js_url': 'JS/',
        // ZWave run JS url - DEPRECATED
        //'zwave_jsrun_url': 'JS/Run/',
        // Local data path
        'local_data_url': 'storage/data/',
        // Help data path
        'help_data_url': 'storage/help/',
        // Online module url
        'online_module_url': 'https://developer.z-wave.me/?uri=api-modules',
        // Online module id url
        'online_moduleid_url': 'https://developer.z-wave.me/?uri=api-modulesid',
        // Online module img url
        'online_module_img_url': 'https://developer.z-wave.me/modules/',
        // Online module download url
        'online_module_download_url': 'https://developer.z-wave.me/modules/',
        // Online module installed url
        'online_module_installed_url': 'https://developer.z-wave.me/?uri=api-modules-installed',
        // Online module comments url
        'online_module_comments_url': 'https://developer.z-wave.me/?uri=api-comments',
        // Online module comment create url
        'online_module_comment_create_url': 'https://developer.z-wave.me/?uri=api-comments-create',
        // Online module rating create url
        'online_module_rating_create_url': 'https://developer.z-wave.me/?uri=api-rating-create',
        // Online skins url
        //'online_skin_url': 'http://developer.z-wave.me/?uri=api-skins',
        'online_skin_url': 'https://developer.z-wave.me/?uri=api-skins',
        //'online_skin_url': 'http://dev.dev/developer-console/?uri=api-skins',
        // Online icons url
        'online_icon_url': 'https://developer.z-wave.me/?uri=api-icons',
        //'online_icon_url': 'http://dev.dev/developer-console/?uri=api-icons',
        // Online icon preview url
        'online_icon_preview_url': 'https://developer.z-wave.me/?uri=api-iconpreview',
        //'online_icon_preview_url': 'http://dev.dev/developer-console/?uri=api-iconpreview',
        // Online module download url
        // Post report url
        'post_report_url': 'https://service.z-wave.me/report/index.php',
        // Postpassword url
        'post_password_request_url': 'https://service.z-wave.me/password/index.php',
        // Get licence scratch id
        'get_licence_scratchid': 'https://service.z-wave.me/license/index.php',
        // Url to get a license key
        'license_url': 'https://service.z-wave.me/license/upgrade.php',
        // Raz latest version
        'raz_latest_version_url': 'https://razberry.z-wave.me/z-way/razberry/latest/VERSION',
        // Find z-wave me box
        'find_zwaveme_zbox': 'https://find.z-wave.me/',
        // Url to zddx xml files
        'zddx_url': 'ZDDX/',
        // Url to run ExpertUI cmd
        'zwaveapi_run_url': 'ZWaveAPI/Run/',
        // Url to run Enocean cmd
        'enocean_run_url': 'EnOceanAPI/Run/',
        // Url to data Enocean cmd
        'enocean_data_url': 'EnOceanAPI/Data/',
        // EnOcean device black list
        'enocean_black_list': ['81048201'],
        // Url to config XML file
        'cfg_xml_url': 'config/Configuration.xml',
        // Url to update capabilities
        'license_load_url': 'ZWaveAPI/ZMELicense',
        // Language directory
        'lang_dir': 'app/lang/',
        // Default language
        'lang': 'en', // !!!!Do not change it
        // List of supported languages
        'lang_list': ['en', 'de', 'ru', 'cn', 'fr', 'cz', 'sk', 'sv','fi'],
        // List of supported languages in the zwave products
        'zwaveproducts_langs': ['en', 'de'],
        // Role access
        'role_access': {
            admin: [1],
            admin_user: [1],
            apps: [1],
            apps_local: [1],
            apps_online: [1],
            customize: [1],
            module: [1],
            devices: [1],
            myaccess: [1, 2, 3],
            expert_view: [1],
            remote_access: [1],
            devices_include: [1],
            rooms: [1, 2, 3, 4],
            element: [1, 2, 3, 4],
            event_delete: [1],
            config_rooms: [1],
            config_rooms_id: [1],
            network: [1, 3],
            network_config_id: [1],
            logout: [1, 2, 3, 4]
        },
        // List of language codes
        'lang_codes': {
            'en': 'en_EN',
            'de': 'de_AT',
            'ru': 'en_EN',
            'fr': 'fr_FR',
            'fi': 'fi_FI'
        },

        // List of profile colors
        'profile_colors': ['#dddddd', '#6c7a89', '#6494bc', '#80ad80', '#31b0d5', '#f0aD4e', '#d9534f', '#dd976e'],
        // Chart colors
        'chart_colors': {
            fillColor: 'rgba(151,187,205,0.5)',
            strokeColor: 'rgba(151,187,205,1)',
            pointColor: 'rgba(151,187,205,1)',
            pointStrokeColor: '#fff'
        },
        // Zwave config
        'zwavecfg': {
            //Timezone
            'time_zone': 'UTC'
        },
        // Device vendors
        'device_vendors': ['zwave', 'enocean', 'ipcamera'],
        // Element control
        'element_control': ['switchMultilevel', 'thermostat', 'sensorMultiline'],
        // Room images
        'room_images': [
            'kitchen.jpg',
            'bathroom.jpg',
            'sleeping_room.jpg',
            'living_room.jpg'
        ],
        // List of the clicakble event levels
        'events_clickable': [
            'device-info'
        ],
        // List of the categories of elements with update command
        'element_update_icon': [
            'switchBinary',
            'switchMultilevel',
            'doorlock',
            'switchControl'
        ],
        // List of the elements with update time button
        'element_update_time_btn': [
            'sensorMultilevel',
            'sensorBinary',
            'sensorMultiline'
        ],
        // List of the find hosts
        'find_hosts': [
            'find.z-wave.me',
            'find.popp.eu'
        ],
        // List of the forbidden licence app types
        'license_forbidden': [
            'popp',
            'jb'
        ],
        // List of range values 0 - 255
        'knob_255': [
            'switchColor_red',
            'switchColor_green',
            'switchColor_blue'
        ],
        // Order by
        orderby: {
            elements: {
                'updateTimeDESC': '-updateTime',
                'creationTimeDESC': '-creationTime',
                'creationTimeASC': 'creationTime',
                'titleASC': 'metrics.title',
                'titleDESC': '-metrics.title'
            },
            appslocal: {
                'titleASC': 'defaults.title',
                'titleDESC': '-defaults.title'
            },
            appsonline: {
                'mostPopularDESC': '-installedSort',
                'mostRatedDESC': '-rating',
                'creationTimeDESC': '-id',
                'creationTimeASC': 'id',
                'titleASC': 'title',
                'titleDESC': '-title',
                'updateTimeDESC': '-updateTime'
            },
            instances: {
                'activeDESC': '-active',
                'activeASC': 'active',
                'creationTimeDESC': '-creationTime',
                'creationTimeASC': 'creationTime',
                'titleASC': 'title',
                'titleDESC': '-title'
            },
            rooms: {
                'titleASC': 'title',
                'titleDESC': '-title'
            },
            users: {
                'titleASC': 'name',
                'titleDESC': '-name'
            }
        },
        // Replace online cats
        replace_online_cat: {
            'automation': 'automation_basic',
            'scheduling': 'automation_basic',
        },
        // List of frequencies
        frequency: {
            EU: 'Europe',
            RU: 'Russia',
            IN: 'India',
            CN: 'China',
            MY: 'Malaysia',
            ANZ_BR: 'Australia / New Zealan',
            HK: 'Hong Kong',
            KR: 'South Korea',
            JP: 'Japan',
            US: 'U.S./Canada/Mexico',
            IL: 'Israel',
            BR: 'Brazil'
        },
        // Timezone
        'time_zone_list': ["UTC", "Etc/UTC", "Africa/Abidjan", "Africa/Accra", "Africa/Addis Ababa", "Africa/Algiers", "Africa/Asmara", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry", "Africa/Dakar", "Africa/Dar es Salaam", "Africa/Djibouti", "Africa/Douala", "Africa/El Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare", "Africa/Johannesburg", "Africa/Kampala", "Africa/Khartoum", "Africa/Kigali", "Africa/Kinshasa", "Africa/Lagos", "Africa/Libreville", "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka", "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane", "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena", "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo", "Africa/Sao Tome", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek", "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua", "America/Araguaina", "America/Argentina/Buenos Aires", "America/Argentina/Catamarca", "America/Argentina/Cordoba", "America/Argentina/Jujuy", "America/Argentina/La Rioja", "America/Argentina/Mendoza", "America/Argentina/Rio Gallegos", "America/Argentina/Salta", "America/Argentina/San Juan", "America/Argentina/Tucuman", "America/Argentina/Ushuaia", "America/Aruba", "America/Asuncion", "America/Atikokan", "America/Bahia", "America/Barbados", "America/Belem", "America/Belize", "America/Blanc-Sablon", "America/Boa Vista", "America/Bogota", "America/Boise", "America/Cambridge Bay", "America/Campo Grande", "America/Cancun", "America/Caracas", "America/Cayenne", "America/Cayman", "America/Chicago", "America/Chihuahua", "America/Costa Rica", "America/Cuiaba", "America/Curacao", "America/Danmarkshavn", "America/Dawson", "America/Dawson Creek", "America/Denver", "America/Detroit", "America/Dominica", "America/Edmonton", "America/Eirunepe", "America/El Salvador", "America/Fortaleza", "America/Glace Bay", "America/Goose Bay", "America/Grand Turk", "America/Grenada", "America/Guadeloupe", "America/Guatemala", "America/Guayaquil", "America/Guyana", "America/Halifax", "America/Havana", "America/Hermosillo", "America/Indiana/Indianapolis", "America/Indiana/Knox", "America/Indiana/Marengo", "America/Indiana/Petersburg", "America/Indiana/Tell City", "America/Indiana/Vevay", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Inuvik", "America/Iqaluit", "America/Jamaica", "America/Juneau", "America/Kentucky/Louisville", "America/Kentucky/Monticello", "America/La Paz", "America/Lima", "America/Los Angeles", "America/Maceio", "America/Managua", "America/Manaus", "America/Marigot", "America/Martinique", "America/Matamoros", "America/Mazatlan", "America/Menominee", "America/Merida", "America/Mexico City", "America/Miquelon", "America/Moncton", "America/Monterrey", "America/Montevideo", "America/Montreal", "America/Montserrat", "America/Nassau", "America/New York", "America/Nipigon", "America/Nome", "America/Noronha", "America/North Dakota/Center", "America/North Dakota/New Salem", "America/Ojinaga", "America/Panama", "America/Pangnirtung", "America/Paramaribo", "America/Phoenix", "America/Port of Spain", "America/Port-au-Prince", "America/Porto Velho", "America/Puerto Rico", "America/Rainy River", "America/Rankin Inlet", "America/Recife", "America/Regina", "America/Rio Branco", "America/Santa Isabel", "America/Santarem", "America/Santo Domingo", "America/Sao Paulo", "America/Scoresbysund", "America/Shiprock", "America/St Barthelemy", "America/St Johns", "America/St Kitts", "America/St Lucia", "America/St Thomas", "America/St Vincent", "America/Swift Current", "America/Tegucigalpa", "America/Thule", "America/Thunder Bay", "America/Tijuana", "America/Toronto", "America/Tortola", "America/Vancouver", "America/Whitehorse", "America/Winnipeg", "America/Yakutat", "America/Yellowknife", "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie", "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Rothera", "Antarctica/South Pole", "Antarctica/Syowa", "Antarctica/Vostok", "Arctic/Longyearbyen", "Asia/Aden", "Asia/Almaty", "Asia/Anadyr", "Asia/Aqtau", "Asia/Aqtobe", "Asia/Ashgabat", "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku", "Asia/Bangkok", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei", "Asia/Choibalsan", "Asia/Chongqing", "Asia/Colombo", "Asia/Damascus", "Asia/Dhaka", "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe", "Asia/Gaza", "Asia/Harbin", "Asia/Ho Chi Minh", "Asia/Hong Kong", "Asia/Hovd", "Asia/Irkutsk", "Asia/Jakarta", "Asia/Jayapura", "Asia/Kabul", "Asia/Kamchatka", "Asia/Karachi", "Asia/Kashgar", "Asia/Kathmandu", "Asia/Kolkata", "Asia/Krasnoyarsk", "Asia/Kuala Lumpur", "Asia/Kuching", "Asia/Kuwait", "Asia/Macau", "Asia/Magadan", "Asia/Makassar", "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Novokuznetsk", "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral", "Asia/Phnom Penh", "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar", "Asia/Qyzylorda", "Asia/Rangoon", "Asia/Riyadh", "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran", "Asia/Thimphu", "Asia/Tokyo", "Asia/Ulaanbaatar", "Asia/Urumqi", "Asia/Vientiane", "Asia/Vladivostok", "Asia/Yakutsk", "Asia/Yekaterinburg", "Asia/Yerevan", "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape Verde", "Atlantic/Faroe", "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South Georgia", "Atlantic/St Helena", "Atlantic/Stanley", "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken Hill", "Australia/Currie", "Australia/Darwin", "Australia/Eucla", "Australia/Hobart", "Australia/Lindeman", "Australia/Lord Howe", "Australia/Melbourne", "Australia/Perth", "Australia/Sydney", "Europe/Amsterdam", "Europe/Andorra", "Europe/Athens", "Europe/Belgrade", "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest", "Europe/Chisinau", "Europe/Copenhagen", "Europe/Dublin", "Europe/Gibraltar", "Europe/Guernsey", "Europe/Helsinki", "Europe/Isle of Man", "Europe/Istanbul", "Europe/Jersey", "Europe/Kaliningrad", "Europe/Kiev", "Europe/Lisbon", "Europe/Ljubljana", "Europe/London", "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta", "Europe/Mariehamn", "Europe/Minsk", "Europe/Monaco", "Europe/Moscow", "Europe/Oslo", "Europe/Paris", "Europe/Podgorica", "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Samara", "Europe/San Marino", "Europe/Sarajevo", "Europe/Simferopol", "Europe/Skopje", "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn", "Europe/Tirane", "Europe/Uzhgorod", "Europe/Vaduz", "Europe/Vatican", "Europe/Vienna", "Europe/Vilnius", "Europe/Volgograd", "Europe/Warsaw", "Europe/Zagreb", "Europe/Zaporozhye", "Europe/Zurich", "Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas", "Indian/Cocos", "Indian/Comoro", "Indian/Kerguelen", "Indian/Mahe", "Indian/Maldives", "Indian/Mauritius", "Indian/Mayotte", "Indian/Reunion", "Pacific/Apia", "Pacific/Auckland", "Pacific/Chatham", "Pacific/Efate", "Pacific/Enderbury", "Pacific/Fakaofo", "Pacific/Fiji", "Pacific/Funafuti", "Pacific/Galapagos", "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Guam", "Pacific/Honolulu", "Pacific/Johnston", "Pacific/Kiritimati", "Pacific/Kosrae", "Pacific/Kwajalein", "Pacific/Majuro", "Pacific/Marquesas", "Pacific/Midway", "Pacific/Nauru", "Pacific/Niue", "Pacific/Norfolk", "Pacific/Noumea", "Pacific/Pago Pago", "Pacific/Palau", "Pacific/Pitcairn", "Pacific/Ponape", "Pacific/Port Moresby", "Pacific/Rarotonga", "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa", "Pacific/Tongatapu", "Pacific/Truk", "Pacific/Wake", "Pacific/Wallis"],
        // List of climate states
        climate_state: ['frostProtection', 'energySave', 'comfort', 'schedule'],
        // Results per page
        'page_results': 12,
        // Results per events page
        'page_results_events': 50,
        // ---------------------------------- Custom config for specifics app_type ---------------------------------- //
        // Application type : default/popp/jb/wd
        'app_type': 'default',
        // Config
        'custom_cfg': {
            'default': {
                'logo': 'app-logo-default.png',
                hidden_apps: [
                    'Cron',
                    'CloudBackup',
                    'BatteryPolling',
                    'CustomUserCode',
                    'CustomUserCodeLoader',
                    'InbandNotifications',
                    'Notification',
                    'NotificationSMSru',
                    'RemoteAccess',
                    'SecurityMode',
                    'SensorValueLogging',
                    'SensorsPollingLogging',
                    'YandexProbki',
                    'CodeDevice',
                    'InfoWidget',
                    'SensorsPolling',
                    'SwitchControlGenerator',
                    'ZWave',
                    'PhilioHW'
                ],
                featured_apps: [
                    'IfThen',
                    'OpenWeather',
                    'DeviceHistory',
                    'PeriodicalSwitchControl',
                    'ScheduledScene'
                ]
            },
            'popp': {
                'logo': 'app-logo-popp.png',
                'hidden_apps': [
                    'Cron',
                    'CloudBackup',
                    'CodeDevice',
                    'BatteryPolling',
                    'CustomUserCode',
                    'CustomUserCodeLoader',
                    'InbandNotifications',
                    'Notification',
                    'NotificationSMSru',
                    'RemoteAccess',
                    'SecurityMode',
                    'SensorValueLogging',
                    'SensorsPollingLogging',
                    'YandexProbki',
                    'InfoWidget',
                    'SensorsPolling',
                    'SwitchControlGenerator',
                    'ZWave',
                    'PhilioHW'
                ],
                featured_apps: [
                    'IfThen',
                    'OpenWeather',
                    'DeviceHistory',
                    'PeriodicalSwitchControl',
                    'ScheduledScene'
                ]
            },
            'jb': {
                'logo': 'app-logo-popp.png',
                hidden_apps: [
                    'Cron',
                    'CloudBackup',
                    'BatteryPolling',
                    'CustomUserCode',
                    'CustomUserCodeLoader',
                    'InbandNotifications',
                    'Notification',
                    'NotificationSMSru',
                    'RemoteAccess',
                    'SecurityMode',
                    'SensorValueLogging',
                    'SensorsPollingLogging',
                    'YandexProbki',
                    'CodeDevice',
                    'InfoWidget',
                    'SensorsPolling',
                    'SwitchControlGenerator',
                    'ZWave',
                    'PhilioHW'
                ],
                featured_apps: [
                    'IfThen',
                    'OpenWeather',
                    'DeviceHistory',
                    'PeriodicalSwitchControl',
                    'ScheduledScene'
                ]
            },
            'wd': {
                'logo': 'app-logo-wd.png',
                'hidden_apps': [
                    'Cron',
                    'CloudBackup',
                    'BatteryPolling',
                    'CodeDevice',
                    'CustomUserCode',
                    'CustomUserCodeLoader',
                    'InbandNotifications',
                    'Notification',
                    'NotificationSMSru',
                    'RemoteAccess',
                    'SecurityMode',
                    'SensorValueLogging',
                    'SensorsPollingLogging',
                    'YandexProbki',
                    'InfoWidget',
                    'SensorsPolling',
                    'SwitchControlGenerator',
                    'ZWave',
                    'PhilioHW'
                ],
                featured_apps: [
                    'IfThen',
                    'OpenWeather',
                    'DeviceHistory',
                    'PeriodicalSwitchControl',
                    'ScheduledScene'
                ]
            }
        }
    }
};
