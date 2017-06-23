**Overview:** Controllers that handle the list of elements, as well as an element detail.



**Author:** Martin Vach




* * *

# Global





* * *

## ElementBaseController
The element root controller

### ElementBaseController.allSettled() 

Load all promises


### ElementBaseController.getDeviceById() 

Get device by ID


### ElementBaseController.refreshDevices() 

Refresh data


### ElementBaseController.searchMe() 

Renders search result in the list


### ElementBaseController.changeMode(mode) 

Change view mode - default/edit

**Parameters**

**mode**: `string`


### ElementBaseController.setFilter() 

Set filter


### ElementBaseController.showHiddenEl() 

Show hidden elements


### ElementBaseController.setOrderBy() 

Set order by


### ElementBaseController.dragDropStart(item, part, index, helper) 

Function to run when when a user starts moving an element

**Parameters**

**item**: 

**part**: 

**index**: 

**helper**: 


### ElementBaseController.dragDropSort(item, partFrom, partTo, indexFrom, indexTo) 

Function to run when elements order has changed after sorting

**Parameters**

**item**: 

**partFrom**: 

**partTo**: 

**indexFrom**: 

**indexTo**: 


### ElementBaseController.dragDropSave() 

Save drag and drop object


### ElementBaseController.runCmd() 

Run command


### ElementBaseController.resetDevices() 

Reset devicse data holder


### ElementBaseController.deleteHistory() 

Delete device history


### ElementBaseController.setVisibility() 

Set visibility


### ElementBaseController.setExactCmd() 

Set exact value for the command


### ElementBaseController.setDevices() 

Set device



## ElementChartController
The controller that handles a device chart.

### ElementChartController.reloadUrl() 

Reload chart url


### ElementChartController.loadDeviceUrl() 

Load device



## ElementHistoryController
The controller that handles a device history.

### ElementHistoryController.loadDeviceHistory() 

Load device history



## ElementEventController
The controller that handles a device events.

### ElementEventController.loadDeviceEvents() 

Load device events


### ElementEventController.redirectToEvents(url) 

Redirect to events

**Parameters**

**url**: `string`



## ElementSwitchMultilevelController
The controller that handles SwitchMultilevel element.

### ElementSwitchMultilevelController.loadDeviceId() 

Load single device



## ElementThermostatController
The controller that handles Thermostat element.

### ElementThermostatController.loadDeviceId() 

Load single device



## ElementSwitchRGBWController
The controller that handles SwitchRGBW element.

### ElementSwitchRGBWController.loadRgbWheel() 

Show RGB modal window


### ElementSwitchRGBWController.loadDeviceId() 

Load single device



## ElementSensorMultilineController
The controller that handles SensorMultiline element.

### ElementSensorMultilineController.loadDeviceId() 

Load single device


### ElementSensorMultilineController.runMultilineCmd() 

Run a command request



## ElementCameraController
The controller that handles Camera element.

### ElementCameraController.setUrl() 

Set camera url


### ElementCameraController.loadDeviceId() 

Load single device



## ElementTextController
The controller that handles Text element.

### ElementTextController.loadDeviceId() 

Load single device



## ElementOpenWeatherController
The controller that handles OpenWeather element.

### ElementOpenWeatherController.loadDeviceId() 

Load single device



## ElementClimateControlController
The controller that handles ClimateControl element.

### ElementClimateControlController.loadDeviceId() 

Load single device


### ElementClimateControlController.changeClimateControlMode() 

Change climate element mode



## ElementSecurityControlController
The controller that handles Security Control  module.

### ElementSecurityControlController.loadDeviceId() 

Load single device



## ElementDashboardController
The controller that handles elements on the dashboard.


## ElementRoomController
The controller that handles elements in the room.


## ElementIdController
The controller that handles element detail actions.

### ElementIdController.allSettled() 

Load all promises


### ElementIdController.searchMe() 

Search me


### ElementIdController.addTag() 

Add tag to list


### ElementIdController.removeTag() 

Remove tag from list


### ElementIdController.store() 

Update an item


### ElementIdController.updateProfile() 

Update profile


### ElementIdController.setDevice() 

Set device


### ElementIdController.setOutput() 

Set output


### ElementIdController.setTagList() 

Set tag list


### ElementIdController.findText() 

Find text



## ElementIconController
The controller that handles custom icon actions in the elemt detail view.

### ElementIconController.loadCfgIcons() 

Load icons from config

**Returns**: `undefined`

### ElementIconController.loadUploadedIcons() 

Load already uploaded icons

**Returns**: `undefined`

### ElementIconController.setSelectedIcon(icon) 

Set selected icon

**Parameters**

**icon**: `string`

**Returns**: `undefined`

### ElementIconController.setCustomIcon(icon) 

Set a custom icon with an icon from the list

**Parameters**

**icon**: `string`

**Returns**: `undefined`

### ElementIconController.removeCustomIcon(icon) 

Remove a custom icon

**Parameters**

**icon**: `string`

**Returns**: `undefined`

### ElementIconController.updateWithCustomIcon() 

Update custom icons with selected icons from the list

**Returns**: `undefined`

### ElementIconController.cancelUpdate() 

Cancel all updates and hide a list with uploaded icons

**Returns**: `undefined`



* * *
