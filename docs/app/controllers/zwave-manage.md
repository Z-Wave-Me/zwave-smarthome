**Overview:** Controllers that manage Z-Wave devices.



**Author:** Martin Vach




* * *

# Global





* * *

## ZwaveManageController
The controller that renders and handles data in the Z-Wave/Manage section.

### ZwaveManageController.allSettled() 

Load all promises


### ZwaveManageController.runZwaveCmd() 

Run zwave CMD


### ZwaveManageController.setZwaveApiData(elements) 

Set zwave devices

**Parameters**

**elements**: `array`

**Returns**: `undefined`

### ZwaveManageController.setElements(elements) 

Set elements created by zWave device

**Parameters**

**elements**: `array`

**Returns**: `undefined`


## ZwaveInterviewController
The controller that handles interview process in the Z-Wave/Network section.

### ZwaveInterviewController.startConfiguration() 

Start configuration


### ZwaveInterviewController.cancelConfiguration() 

Cancel configuration


### ZwaveInterviewController.forceInterview() 

Force interview


### ZwaveInterviewController.resetConfiguration() 

Reset configuration


### ZwaveInterviewController.handleInterview() 

Handle interview


### ZwaveInterviewController.setSecureInclusion() 

Set secure inclusion



## ZwaveManageIdController
The controller that renders and handles configuration data for a single Z-Wave device.

### ZwaveManageIdController.allSettled() 

Load all promises


### ZwaveManageIdController.addRoom() 

Add room


### ZwaveManageIdController.updateAllDevices() 

Update all devices


### ZwaveManageIdController.zwaveConfigApiData() 

Get zwaveApiData




* * *
