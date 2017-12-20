**Overview:** Controllers that handls rules



**Author:** Martin Vach




* * *

# Global





* * *

## AutomationRuleController
Controller that handles list of rules

### AutomationRuleController.loadRules() 

Load

**Returns**: `undefined`

### AutomationRuleController.runRuleTest(instance) 

Run test

**Parameters**

**instance**: `object`


### AutomationRuleController.activateRule(input, activeStatus) 

Activate

**Parameters**

**input**: `object`

**activeStatus**: `boolean`


### AutomationRuleController.cloneRule(input) 

Clone

**Parameters**

**input**: `object`

**Returns**: `undefined`

### AutomationRuleController.deleteRule() 

Delete



## AutomationRuleIdController
Controller that handles rule detail

### AutomationRuleIdController.resetModel() 

Reset model


### AutomationRuleIdController.loadInstance() 

Load instances


### AutomationRuleIdController.loadRooms() 

Load rooms


### AutomationRuleIdController.loadDevices() 

Load devices


### AutomationRuleIdController.uploadIcon(files, info) 

Validate an uploaded icon

**Parameters**

**files**: `object`

**info**: `object`

**Returns**: `undefined`

### AutomationRuleIdController.deleteIcon(string) 

Delete icon

**Parameters**

**string**: `string`

**Returns**: `undefined`

### AutomationRuleIdController.assignDevice(device) 

Assign device to a schedule

**Parameters**

**device**: `object`

**Returns**: `undefined`

### AutomationRuleIdController.unassignDevice(device) 

Remove device id from assigned device

**Parameters**

**device**: `object`


### AutomationRuleIdController.expandParams() 

Add or update device to the list (by type)type: switches|dimmers|thermostats|locks


### AutomationRuleIdController.handleDevice() 

Add or update device to the list (by type)type: switches|dimmers|thermostats|locks


### AutomationRuleIdController.handleSceneDevice() 

Add or update scene device


### AutomationRuleIdController.storeScene() 

Store


### AutomationRuleIdController.removeDeviceFromParams(device) 

Remove device from the params list

**Parameters**

**device**: `object`




* * *
