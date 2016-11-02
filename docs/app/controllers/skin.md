**Overview:** Controllers that handle all Skins actions.



**Author:** Martin Vach




* * *

# Global





* * *

## SkinBaseController
This is the Skin root controller

### SkinBaseController.allSettled() 

Load all promises

**Returns**: `undefined`

### SkinBaseController.updateSkin(skin) 

Update skin

**Parameters**

**skin**: `object`

**Returns**: `undefined`

### SkinBaseController.setOnlineSkins(response) 

Set online skins $scope

**Parameters**

**response**: `object`

**Returns**: `undefined`


## SkinLocalController
This controller handles local skins actions.

### SkinLocalController.activateSkin(skin) 

Activate skin

**Parameters**

**skin**: `object`

**Returns**: `undefined`

### SkinLocalController.removeSkin(skin, message) 

Remove skin

**Parameters**

**skin**: `object`

**message**: `string`

**Returns**: `undefined`


## SkinOnlineController
This controller handles online skins actions.

### SkinOnlineController.downloadSkin(skin) 

Download skin

**Parameters**

**skin**: `object`

**Returns**: `undefined`


## SkinOnlineController
This controller handles reset skin proccess.

### SkinOnlineController.resetToDefault(skin) 

Download skin

**Parameters**

**skin**: `object`

**Returns**: `undefined`



* * *
