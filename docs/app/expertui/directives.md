**Overview:** Angular directives that are used in device hardware configuration view.



**Author:** Martin Vach




* * *

# Global





* * *

## expertCommandInput
Renders configuration form inputs

### expertCommandInput.getText(label, value, min, max, name) 

Renders text input

**Parameters**

**label**: `text`

**value**: `mixed`

**min**: `int`

**max**: `int`

**name**: `string`

**Returns**: `String`

### expertCommandInput.getNode(label, devices, currValue, name) 

Renders node select input

**Parameters**

**label**: `string`

**devices**: `object`

**currValue**: `string`

**name**: `string`

**Returns**: `String`

### expertCommandInput.getEnum(label, enums, defaultValue, name, hideRadio, currValue) 

Renders enumerators

**Parameters**

**label**: `string`

**enums**: `object`

**defaultValue**: `int`

**name**: `string`

**hideRadio**: `boolean`

**currValue**: `int`

**Returns**: `undefined | String`

### expertCommandInput.getDropdown(label, enums, defaultValue, name, currValue) 

Renders dropdown list

**Parameters**

**label**: `string`

**enums**: `object`

**defaultValue**: `string`

**name**: `string`

**currValue**: `string`

**Returns**: `String`

### expertCommandInput.getConstant(label, type, defaultValue, name, currValue) 

Renders constant select

**Parameters**

**label**: `string`

**type**: `string`

**defaultValue**: `string`

**name**: `string`

**currValue**: `string`

**Returns**: `String`

### expertCommandInput.getString(label, value, name) 

Renders string input

**Parameters**

**label**: `string`

**value**: `string`

**name**: `string`

**Returns**: `String`

### expertCommandInput.getBitset() 

Renders bitset input

**Returns**: `String`

### expertCommandInput.getDefault(label) 

Renders default label

**Parameters**

**label**: `string`

**Returns**: `String`


## configDefaultValue
Renders configuration default value

### configDefaultValue.getEnum(enums, defaultValue, showDefaultValue) 

Renders enumerators

**Parameters**

**enums**: `object`

**defaultValue**: `string`

**showDefaultValue**: `string`

**Returns**: `string`


## configValueTitle
Renders configuration title input

### configValueTitle.getEnum(enums, showValue) 

Renders enumerators

**Parameters**

**enums**: `object`

**showValue**: `string`

**Returns**: `string`



* * *
