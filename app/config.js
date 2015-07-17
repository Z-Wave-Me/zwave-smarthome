var config_data = {
    'cfg': {
        //Application name
        'app_name': 'SHUI',
        // Application version
        'app_version': '1.0.1',
        // Application type: default/popp/wd
        'app_type': 'wd',
        // Server base url
        'server_url': '/',
        //'server_url': 'http://192.168.10.119:8083/',
        // Interval in miliseconds to refresh data
        'interval': 3000,
        // Interval in miliseconds (5 min) to clear history (json) cache
        'history_cache_interval': 300000,
        // List of API links  
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
            'instances': 'ZAutomation/api/v1/instances',
            'namespaces': 'ZAutomation/api/v1/namespaces',
            'history': 'ZAutomation/api/v1/history',
            'login': 'ZAutomation/api/v1/login'
        },
        // List of image pathes
        'img': {
            'icons': 'storage/img/icons/'
        },
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
        // Online module url
        'online_module_url': 'http://hrix.net/modules_store/json_store.php',
        // Online module img url
        'online_module_img_url': 'http://hrix.net/modules_store/modules/',
        // Online module download url
        'online_module_download_url': 'http://hrix.net/modules_store/modules/',
        // Post report url
        //'post_report_url': 'http://dev.dev/zwave-api/report/post-report.php',
        'post_report_url': ' http://zwave.eu/api/report/post-report.php',
        // Url to zddx xml files
        'zddx_url': 'ZDDX/',
        // Url to run ExpertUI cmd
        'zwaveapi_run_url': 'ZWaveAPI/Run/',
        // Url to run Enocean cmd
        'enocean_run_url': 'EnOceanAPI/Run/',
        // Url to data Enocean cmd
        'enocean_data_url': 'EnOceanAPI/Data',
        // Url to config XML file
        'cfg_xml_url': 'config/Configuration.xml',
        // Url to get a license key
        'license_url': 'http://store.zwaveeurope.com/license/utility_uzb.php',
        // Buy licence key url
        'buy_licence_key': 'http://www.zwave.me/index.php?id=41',
        // Url to update capabilities
        'license_load_url': '/ZWaveAPI/ZMELicense',
        // Language directory
        'lang_dir': 'app/lang/',
        // Default language
        'lang': 'en',
        // List of supported languages
        'lang_list': ['en', 'de', 'ru', 'cn', 'fr'],
        // Role access
        'role_access': {
            admin: [1],
            admin_user: [1],
            apps: [1, 3],
            apps_local: [1, 3],
            apps_online: [1, 3],
            module: [1, 3],
            devices: [1, 3],
            myaccess: [1, 2, 3],
            expert_view: [1, 3],
            remote_access: [1, 3],
            devices_include: [1, 3],
            rooms: [1, 2, 3],
            element: [1, 2, 3],
            event_delete: [1, 3],
            config_rooms: [1, 3],
            config_rooms_id: [1, 3],
            network: [1, 3],
            network_config_id: [1, 3],
            logout: [1, 2, 3, 4]
        },
        // List of language codes
        'lang_codes': {
            'en': 'en_EN',
            'de': 'de_AT',
            'ru': 'en_EN',
            'fr': 'fr_FR'
        },
        // User default
        'user_default': {
            'id': 1,
            'role': 1,
            'color': '#dddddd',
            'lang': 'en',
            'interval': 3000,
            'expert_view': false
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
        // Device vendors
        'device_vendors': ['zwave', 'enocean', 'ipcamera'],
        // Hidden apps
        'hidden_apps': ['AnotherModuleID'],
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
        // Results per page
        'page_results': 12,
        // Results per events page
        'page_results_events': 50



    }
};
