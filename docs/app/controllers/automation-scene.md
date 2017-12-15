**Overview:** Controllers that handls scenes



**Author:** Martin Vach




* * *

# Global





* * *

## AutomationSceneController
Controller that handles list of scenes

### AutomationSceneController.loadScenes() 

Load schedules

**Returns**: `undefined`

### AutomationSceneController.runSceneTest(instance) 

Run test

**Parameters**

**instance**: `object`


### AutomationSceneController.activateScene(input, activeStatus) 

Activate

**Parameters**

**input**: `object`

**activeStatus**: `boolean`


### AutomationSceneController.cloneScene(input) 

Clone

**Parameters**

**input**: `object`

**Returns**: `undefined`

### AutomationSceneController.deleteScene() 

Delete



## AutomationSceneIdController
Controller that handles scene detail

### AutomationSceneIdController.loadInstance() 

Load instances


### AutomationSceneIdController.loadRooms() 

Load rooms


### AutomationSceneIdController.loadDevices() 

Load devices


### AutomationSceneIdController.resetModel() 

Reset model


### AutomationSceneIdController.assignDevice(device) 

Assign device to a schedule

**Parameters**

**device**: `object`

**Returns**: `undefined`

### AutomationSceneIdController.unassignDevice(device) 

Remove device id from assigned device

**Parameters**

**device**: `object`


### AutomationSceneIdController.expandParams() 

Add or update device to the list (by type)type: switches|dimmers|thermostats|locks


### AutomationSceneIdController.removeDeviceFromParams(device) 

Remove device from the params list

**Parameters**

**device**: `object`


### AutomationSceneIdController.handleDevice() 

Add or update device to the list (by type)type: switches|dimmers|thermostats|locks


### AutomationSceneIdController.handleSceneDevice() 

Add or update scene device


### AutomationSceneIdController.storeScene() 

Store




* * *
