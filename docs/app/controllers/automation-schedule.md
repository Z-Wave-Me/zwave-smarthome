**Overview:** Controllers that handls schedules



**Author:** Martin Vach




* * *

# Global





* * *

## AutomationScheduleController
Controller that handles list of schedules

### AutomationScheduleController.loadSchedules() 

Load schedules

**Returns**: `undefined`

### AutomationScheduleController.runScheduleTest(instance) 

Run schedule test

**Parameters**

**instance**: `object`


### AutomationScheduleController.activateSchedule(input, activeStatus) 

Activate schedule

**Parameters**

**input**: `object`

**activeStatus**: `boolean`


### AutomationScheduleController.cloneSchedule(input) 

Clone schedule

**Parameters**

**input**: `object`

**Returns**: `undefined`

### AutomationScheduleController.deleteSchedule() 

Delete schedule



## AutomationScheduleIdController
Controller that handles schedules

### AutomationScheduleIdController.loadInstance() 

Load instances


### AutomationScheduleIdController.loadRooms() 

Load rooms


### AutomationScheduleIdController.loadDevices() 

Load devices


### AutomationScheduleIdController.toggleWeekday() 

Toggle Weekday


### AutomationScheduleIdController.addTime() 

Add time


### AutomationScheduleIdController.resetModel() 

Reset model


### AutomationScheduleIdController.assignDevice(device) 

Assign device to a schedule

**Parameters**

**device**: `object`

**Returns**: `undefined`

### AutomationScheduleIdController.unassignDevice(device) 

Remove device id from assigned device

**Parameters**

**device**: `object`


### AutomationScheduleIdController.expandParams() 

Add or update device to the list (by type)type: switches|dimmers|thermostats|locks


### AutomationScheduleIdController.removeDeviceFromParams(device) 

Remove device from the params list

**Parameters**

**device**: `object`


### AutomationScheduleIdController.handleDevice() 

Add or update device to the list (by type)type: switches|dimmers|thermostats|locks


### AutomationScheduleIdController.handleSceneDevice() 

Add or update scene device


### AutomationScheduleIdController.storeSchedule() 

Store schedule




* * *
