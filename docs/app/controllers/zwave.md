**Overview:** Controllers that handle Z-Wave devices actions.



**Author:** Martin Vach




* * *

# Global





* * *

## ZwaveVendorController
The controller that renders Z-Wave vendors.

### ZwaveVendorController.loadZwdata() 

Load z-wave data


### ZwaveVendorController.loadVendors() 

Load z-wave devices an parse vendors



## ZwaveVendorIdController
The controller that renders Z-Wave devices by vendor.

### ZwaveVendorIdController.allSettled() 

Load all promises



## ZwaveAddController
The controller that renders Z-Wave manufacturers and devices.

### ZwaveAddController.loadData() 

Load z-wave devices



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

### ZwaveManageController.getInstances() 

Get selected instances status



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


### ZwaveInterviewController.checkInterview() 

Check interview


### ZwaveInterviewController.setSecureInclusion() 

Set secure inclusion



## ZwaveInterviewController
The controller that handles Z-Wave exclusion process.

### ZwaveInterviewController.loadZwaveApiData() 

Load z-wave devices


### ZwaveInterviewController.refreshZwaveApiData() 

Refresh z-wave devices


### ZwaveInterviewController.runZwaveCmd() 

Run ExpertUI command


### ZwaveInterviewController.removeFailedNode() 

Run ExpertUI command - remove failed node



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
