/* Copyright:  Z-Wave Europe GmbH, Created: 23-03-2020 13:53:29 */
/**
 * @overview MobileAppsupport configuration file.
 * @author Michael Hensche
 */

/**
 * Configuration object
 * @class mobile_data
 */

var mobile_data = {
	mobile_cfg: {
        doorlock: {
            level: ['all', 'open', 'close'],
            default: {
                id: '',
                deviceType: 'doorlock',
                level: 'all',
                msg: ''
            }
        },
        switchBinary: {
            level: ['all', 'on', 'off'],
            default: {
                id: '',
                deviceType: 'switchBinary',
                level: 'all',
                msg: ''
            }
        },
        sensorBinary: {
            level: ['all', 'on', 'off'],
            default: {
                id: '',
                deviceType: 'sensorBinary',
                level: 'all',
                msg: ''
            }
        },
        switchMultilevel: {
            level: ['all', 'on', 'off', 'lvl'],
            operator: ['=', '!=', '>', '>=', '<', '<='],
            min: 0,
            max: 99,
            default: {
                id: '',
                deviceType: 'switchMultilevel',
                exact: 0,
                level: 'all',
                msg: ''
            }
        },
        sensorMultilevel: {
            operator: ['=', '!=', '>', '>=', '<', '<='],
            min: 0,
            max: 99,
            default: {
                id: '',
                deviceType: 'sensorMultilevel',
                level: 0,
                operator: '=',
                msg: ''
            }
        },
        thermostat: {
            level: ['all', 'on', 'off', 'lvl'],
            operator: ['=', '!=', '>', '>=', '<', '<='],
            min: 0,
            max: 99,
            default: {
                id: '',
                deviceType: 'thermostat',
                level: 'all',
                exact: 0,
                operator: '=',
                msg: ''
            }
        },
        toggleButton: {
            default: {
                id: '',
                deviceType: 'toggleButton',
                level: 'on',
                msg: ''
            }
        }
    }
}