var config_data = {
    'cfg': {
        //Application name
        'app_name': 'HAUI',
        // Application version
        'app_version': '0.1',
        // Application type: web/app
        'app_type': 'web',
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
            'profiles': 'ZAutomation/api/v1/profiles',
            'locations': 'ZAutomation/api/v1/locations',
            'notifications': 'ZAutomation/api/v1/notifications',
            'modules': 'ZAutomation/api/v1/modules',
            'modules_categories': 'ZAutomation/api/v1/modules/categories',
            'instances': 'ZAutomation/api/v1/instances',
            'namespaces': 'ZAutomation/api/v1/namespaces',
            'history': 'ZAutomation/api/v1/history'
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
        // ZWave run JS url
        'zwave_jsrun_url': 'JS/Run/',
        // Local data path
        'local_data_url': 'storage/data/',
        // Online module url
        'online_module_url': 'http://hrix.net/modules_store/json_store.php',
        // Online module img url
        'online_module_img_url': 'http://hrix.net/modules_store/modules/',
        // Url to zddx xml files
        'zddx_url': 'ZDDX/',
        // Url to run ExpertUI cmd
        'zwaveapi_run_url': 'ZWaveAPI/Run/',
        // Url to config XML file
        'cfg_xml_url': 'config/Configuration.xml',
        // Language directory
        'lang_dir': 'app/lang/',
        // Default language
        'lang': 'en',
        // List of supported languages
        'lang_list': ["en", "de", "ru"],
        // List of language codes
        'lang_codes': {
            'en': 'en_EN',
            'de': 'de_AT',
            'ru': 'en_EN'
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
        'profile_colors': ['#dddddd','#6c7a89', '#6494bc', '#80ad80', '#31b0d5', '#f0aD4e', '#d9534f','#dd976e'],
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
        'element_control': ['switchMultilevel','thermostat','sensorMultiline'],
        // Room images
        'room_images': [
            'kitchen.jpg',
            'bathroom.jpg',
            'sleeping_room.jpg',
            'living_room.jpg'
        ],
        // Results per page
        'page_results': 12,
        // Results per events page
        'page_results_events': 50



    }
};
