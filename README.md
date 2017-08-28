SmartHome UI
===============
## LICENSE
Copyright (C) 2016 z-wave.Me

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
This User Interfaces allows to operate a Smart Home Network based on Z-Wave devices. It utilizes the software architecture "Z-Way", certified as Z-Wave Plus Controller.

## Project leader
Marcel Kermer

## v1.7.1
#### New features
- RSS news: Added buttons READ MORE and READ.
- Rooms: In the header are sensors values updated.
- Improvements of the mobile view.

#### Fixes
- Sensors added to the room header dont show fullname by mouse over #245.
- User login language overwrites profile language.
- Elements, Apps and devices: Fixed bug in Firefox.
- Don't poll InspectQueue and ZWaveAPI/Data/xxx if current request is still pending #262.

#### Changes
- Element detail: Deactivete checkbox replaced with Delete element button.
- Element with device type sensorMultiline has not an event icon.
- First access: Language select moved to the form.
- Login: Removed language select.
- Added major/minor version to the licence scratch request.

## v1.7.0
#### New features
- Dashboard: Drag and Drop.
- Elements: Drag and Drop, autocomplete and Device events. Header with room selector, sensors, drag and drop and edit room
- Elements in room: Header with room selector, sensors, drag and drop and edit room.
- Local Apps: autocomplete.
- Events:  Room name over the event message, new button Reload.
- RSS news.
- Online Apps: Autocomplete, featured slider, category view, filter view.
- Active Apps: Group view with MULTIPLE and SINGLE module instance. Expand/Collapse all, clone instance, autocomplete.
- Configuring the room: Posibility to display selected image as background. Posibility to mark devices as main sensors.
- Management: Time zone settings.
- Finnish translation for UI #214.
- Add QRCode for simple Add mobile device login under "My Settings" (prepared for new iOS/Android Apps).

#### Fixes
- Too many icons overflow cookie size #225.
- Fix check of ZMEOpenWRT instance in management view.
- RU translate, some fixes in EN translate.
- Added a subvendor check for UZB caps to fix hidden license input.
- Disable un/-secure button during auto configuration after inclusion.
- Role USER, LOCAL, ANONYMOUS isn't able to open vDev configuration #215.
- Thermostat modal increase/decrease temperature 0.5 steps.

#### Changes
- Local Apps: Hidden singleton item with instance.
- Config rooms removed from menu.
- Rooms are displayed as widgets with update and delete icons (for admin only).

## v1.6.0
#### New features
- Cloud Backup: Gives possibility to upload and store your backups on the remote server.
- Custom icons: Possibility to upload and assign custom icons for devices.
- Skins: A Skin is a CSS style that allow to change the appearance of the SmartHome UI.
- New widget type sensorDiscrete:  N-State visualisation of CentralScene commands.
- Apps/Active: Sorting by active/inactive apps.

#### Changes
- Connection error refactored.
- Caching online modules.

## v1.5.1
#### Fixes
- Displays Firmware Update in  POPP version.

## v1.5.0
#### New features
- Apps: Added button Add more apps if filter feature apps is preselected.git
- Time zone on the first access page and in the management (POPP only).
- More products in the Z-Wave devices.
- Add update time to toggle button #167.
- Online Apps: Sorting by most popular.
- Elements: Sorting by last updated.
- Added the generic Confguration Dialog to Hardware Configuration if no ZDDX file is present.

#### Fixes
- Text in preferences menu not aligned #189.
- Filter function in elements prevents further use of UI elements #185.
- Strange sting on widget #180.
- Infinite loop on login #184.
- Elements: Fixed knob bug.

#### Changes
- Hardvare configuration: Removed targed node from wakeup time settings.
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
