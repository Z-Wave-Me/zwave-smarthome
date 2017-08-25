**Overview:** Controllers that handle element detail actions, as well as custom icon actions.



**Author:** Martin Vach




* * *

# Global





* * *

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


### ElementIdController.deleteElement() 

Delete an element from the view


### ElementIdController.setDevice() 

Set device


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
