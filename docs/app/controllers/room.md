**Overview:** Controllers that handle room actions.



**Author:** Martin Vach




* * *

# Global





* * *

## RoomController
The room root controller

### RoomController.allSettled() 

Load all promises

**Returns**: `undefined`

### RoomController.setOrderBy(key) 

Set order by

**Parameters**

**key**: `string`

**Returns**: `undefined`

### RoomController.setOrderBy(key) 

Set order by

**Parameters**

**key**: `string`

**Returns**: `undefined`

### RoomController.onLongPress(id) 

Room on long press

**Parameters**

**id**: `string`

**Returns**: `undefined`

### RoomController.onTouchEnd() 

Room on long press end

**Returns**: `undefined`

### RoomController.removeRoomIdFromDevice(devices) 

Remove room id from a device

**Parameters**

**devices**: `object`

**Returns**: `undefined`


## RoomConfigIdController
The controller that renders and handles single room data.

### RoomConfigIdController.loadData(id) 

Load a data holder with rooms

**Parameters**

**id**: `int`

**Returns**: `undefined`

### RoomConfigIdController.uploadFile(files) 

Upload an image file

**Parameters**

**files**: `object`

**Returns**: `undefined`

### RoomConfigIdController.assignDevice(device) 

Assign device to a room

**Parameters**

**device**: `object`

**Returns**: `undefined`

### RoomConfigIdController.removeDevice(device) 

Remove device from the room

**Parameters**

**device**: `object`

**Returns**: `undefined`

### RoomConfigIdController.assignSensor($event, device) 

Assign device (sensorBianry, senosrMultilevel) to the room main sensors

**Parameters**

**$event**: `object`

**device**: `object`

**Returns**: `undefined`

### RoomConfigIdController.clearSensors(input) 

Clear all sensors (remove them from the array) and save to lacation

**Parameters**

**input**: `object`

**Returns**: `undefined`

### RoomConfigIdController.store(form, input) 

Create new or update an existing location

**Parameters**

**form**: `object`

**input**: `object`

**Returns**: `undefined`

### RoomConfigIdController.deleteRoom(roomId, message) 

Delete a room

**Parameters**

**roomId**: `int`

**message**: `string`

**Returns**: `undefined`

### RoomConfigIdController.loadDevices(locationId) 

Load devices

**Parameters**

**locationId**: `int`

**Returns**: `undefined`

### RoomConfigIdController.saveRoomIdIntoDevice(data, devices) 

Save room id into device

**Parameters**

**data**: `object`

**devices**: `object`

**Returns**: `undefined`

### RoomConfigIdController.removeRoomIdFromDevice(devices) 

Remove room id from device

**Parameters**

**devices**: `object`

**Returns**: `undefined`



* * *
