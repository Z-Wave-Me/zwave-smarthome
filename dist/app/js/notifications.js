/* Copyright:  Z-Wave.Me, Created: 15-03-2022 12:23:35 */
/**
 * @overview Notifications configuration file.
 * @author Michael Hensche, Serguei Poltorak
 */

/**
 * Configuration object
 * @class notifications_data
 */

var notifications_data = {
    notifications_cfg: {
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
            operator: ['all', '=', '!=', '>', '>=', '<', '<='],
            min: 0,
            max: 99,
            default: {
                id: '',
                deviceType: 'switchMultilevel',
                level: 0,
                operator: '=',
                msg: ''
            }
        },
        sensorMultilevel: {
            operator: ['all', '=', '!=', '>', '>=', '<', '<='],
            min: -100000,
            max: +100000,
            default: {
                id: '',
                deviceType: 'sensorMultilevel',
                level: 0,
                operator: '=',
                msg: ''
            }
        },
        sensorMultiline: {
            operator: ['all', '=', '!=', '>', '>=', '<', '<='],
            min: -100000,
            max: +100000,
            default: {
                id: '',
                deviceType: 'sensorMultiline',
                level: 0,
                operator: '=',
                msg: ''
            }
        },
        switchControl: {
            operator: ['all', '=', '!=', '>', '>=', '<', '<='],
            min: 0,
            max: 255,
            default: {
                id: '',
                deviceType: 'switchControl',
                level: 0,
                operator: '=',
                msg: ''
            }
        },
        thermostat: {
            operator: ['all', '=', '!=', '>', '>=', '<', '<='],
            min: -40,
            max: +1000,
            default: {
                id: '',
                deviceType: 'thermostat',
                level: 0,
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