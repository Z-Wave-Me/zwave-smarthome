SmartHome UI
===============
## LICENSE
Copyright (C) 2016 z-wave.Me

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
This User Interfaces allows to operate a Smart Home Network based on Z-Wave devices. It utilizes the software architecture "Z-Way", certified as Z-Wave Plus Controller.

## Project leader
Marcel Kermer

## v1.5.0
#### New features
- More products in the Z-Wave devices.
- Skins.
- Add update time to toggle button #167.
- Online Apps: Sorting by most popular.
- Elements: Sorting by last updated.

#### Fixes
- Strange sting on widget #180
- Infinite loop on login #184.
- Elements: Fixed knob bug.

#### Changes
- Removed filter getElementIcon and replaced with service assignElementIcon.

## v1.4.3
#### New features
- Added an indicator for local apps with instance.
- Added status info in Device Battery Management #119.

#### Fixes
- Apps: Display warning message if installed app is the singelton and already has an instance.

#### Changes
- Refactored zwave device management.
- Improve handling of min/max values for multilevel knob widget.
- Concatenate css and scss files on DEV environment.

## v1.4.2
#### New features
- POPP hub support.
- Handling license improvement.
- Rooms: Validation during image upload process.
- Z-Wave devices/Config: Added possibility to create a new room - issue #122.
- Z-Wave devices/Network: Added possibility to configure a device (Force interview).

#### Fixes
- New room get all not assigned devices #127.
- Peoples don't like popup windows in rooms #126.
- Add description to the module #104.

#### Changes
- Z-Wave devices/Config: Rooms select is replaced with dropdown.

## v1.4.1
#### Fixes
- lost active apps #125

## v1.4.0
#### New features
- Elements: Show count of elements in the filter. Possibility to delete a history. Hide/Unhide elements.
- Online and local apps: Show count of Apps in the filter. Sorting by title, most rated, newest.... Show only categories that have min 1 app.
- Online apps: Display count of ratings and average value. Hide already installed apps. Display patches in the update window and in the app detail.
- Local appps: Added "Update to latest" button.
- Add appp: Integration of the dependencies between the modules.
- Management: Added postfix - the list of patched devices. 
- Improved error handling.
- Displaying server time on all pages.
- Improved Z-Wave inclusion.
- Added HTML title attribute to navigation and buttons.
- Management: reset to factory default.

#### Fixes
- Blind knob.
- Add description to the module #104.

#### Changes
- The templates are compiled with grunt-angular-templates into templates.js. 
- The online app description was moved under the title. 
- Add app: allow submit when all dependecies are installed and activated.
- Complete refactored Z-Wave inclusion.
- Added login label into first access.
- Apps: Removed green gradient. Installed apps are grayed out.

## v1.3.0
#### New features
- Enhanced display on mobile devices and tablets.
- Added the ability to customize the device from Devices/Manage
- Backup and restore.
- Redirect to the APP detail after module instalation.
- Rating of the Apps.
- Improved modal windows and dropdowns.
- Remember me checkbox on the login page.
- Sorting Elements by title, newest....
- Comments for On-line Apps.
- Counter for downloaded On-line Apps.
- Added icon to deveices list in Events.
- Added stop button to blinds.

#### Fixes
- Cannot add email address to user #90
- Climate Control widget displays the correct values.
- List elements error #82.
- Can not install user module from store #87
- Fixed redirect after post/put a local app.

#### Changes
- Authentication process with Secure Login.
- Elements are completely refactored.
- Replaced Bootstrap modal windows and dropdowns with Angular.
- Replaced http protocol with https for external APIs.

## v1.0.0
- Released.
