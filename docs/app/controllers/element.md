**Overview:** Controllers that handle the list of elements, dashboar and elements in the room.



**Author:** Martin Vach




* * *

# Global





* * *

## ElementBaseController
The element root controller

**room**:  , Room data
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


### ElementBaseController.getRgbState() 

get RGB state


### ElementBaseController.runRgbCmd() 

set RGB state


### ElementBaseController.resetDevices() 

Reset devicse data holder


### ElementBaseController.deleteHistory() 

Delete device history


### ElementBaseController.setVisibility() 

Set visibility


### ElementBaseController.setExactCmd() 

Set exact value for the command


### ElementBaseController.itemOnLongPress() 

device on long press action


### ElementBaseController.itemOnTouchEnd() 

device on end long press action


### ElementBaseController.setDevices() 

Set device



## ElementDashboardController
The controller that handles elements on the dashboard.


## ElementRoomController
The controller that handles elements in the room.



* * *
