/**
 * App settings and arrays
 * @author Martin Vach
 */

var config_module = angular.module('myAppSettings', []);
var settings_data = {
    "settings": {
        // Months
        "months": {
            "1": "January",
            "2": "February",
            "3": "March",
            "4": "April",
            "5": "May",
            "6": "June",
            "7": "July",
            "8": "August",
            "9": "September",
            "10": "October",
            "11": "November",
            "12": "December"
        },
        // User navigation
        "user_nav": {
            1: {
                "route": "#",
                "label": "nav_profile",
                "url": "profile",
                "title": "",
                "icon": "fa-smile-o"
            },
            2: {
                "route": "#",
                "label": "nav_courses",
                "url": "courses",
                "title": "",
                "icon": ""
            },
            3: {
                "route": "#",
                "label": "nav_account",
                "url": "account",
                "title": "",
                "icon": "",
                "divider": 1
            },
            4: {
                "route": "",
                "label": "nav_logout",
                "url": "/logout",
                "title": "",
                "icon": ""
            }
        },
        // Profile submenu
        "profile_submenu": {
            1: {
                "route": "#",
                "label": "nav_profile",
                "url": "profile"
            },
            2: {
                "route": "#",
                "label": "nav_interest",
                "url": "interest"
            },
            3: {
                "route": "#",
                "label": "nav_contact",
                "url": "contact"
            },
            4: {
                "route": "#",
                "label": "nav_address",
                "url": "address"
            },
            5: {
                "route": "#",
                "label": "nav_experience",
                "url": "experience"
            },
            6: {
                "route": "#",
                "label": "nav_account",
                "url": "account"
            }
        }
    }
};
angular.forEach(settings_data, function(key, value) {
    config_module.constant(value, key);
});