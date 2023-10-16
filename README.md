SmartHome UI
===============
## LICENSE
Copyright (C) 2023 Z-Wave.Me

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
This User Interfaces allows to operate a Smart Home Network based on Z-Wave devices. It utilizes the software architecture "Z-Way", certified as Z-Wave Plus Controller.

## Project leaders
Serguei Poltorak

## v1.15.3
#### New features:
- Add CO/CO2 alarms to Hazard Protection Fire sensors
#### Fixes:
- Added CO2 icon

## v1.15.2
#### New features:
- Add CO/CO2 alarms to Hazard Automation
#### Fixes:
- Search for first active app, not just first
- Replace buttons with links to expert interface
- Sort locations
- Hide mobile app block in mobile app
- Increase the size of input fields

## v1.15.1
#### New features:
- Full rework of Smart Start inclusion section

## v1.15.0
#### New features:
- Zigbee support with Z-Wave.Me hardware
#### Fixes:
- Scientific format is shown on widgets for negative numbers
#### Removed:
- Deprecated RF433 app

## v1.14.2
#### New features:
- Notifications can now include device properties and status (via <dev:metric:name>)
#### Fixes:
- Exclude index.html and config.js from .gz archiving

## v1.14.1
#### Fixes:
- Fixed security initerview

## v1.14.0
#### New features:
- Added Shortcuts for SwitchBinary, SwitchMultilevel and Door lock for Android (on the device settings page)
- Users can generate access tokens now (to use in integrations)
- Smart Start, QR scanning and manage of the DSK list
- Faster UI load
#### Fixes:
- UI improvements
- Correct display of arming status
- Interview timer fixed
- Improved work with two or more Z-Wave hardware
- Time in events
- Thermostat on/off icon

## v1.13.5
#### New features:
- Generate new API token for the selected user from the admin interface
#### Fixes:
- Adopted to the new secureInclusion DH
- Time zone is correctly taken into account in events and devices
- Time zone is displayed correctly on the settings page
- Security app fixes
- Management page load error
- Sort order in manage devices (setup order by id)

## v1.13.4
#### New features:
- Full rework of Security module
  - Added Entrance group to allow delay for some sensors on armin and disarming
  - Added support for scenes and buttons for arm/disarm/clear by button
  - Added Arm condition and Arm failure action to allow checks for sensor state before arming
  - Handles deleted devices correctly
- For value less one show 3 significant digits
- Add remoteAccess && CloudBackup checkbox on first access screen
#### Fixes:
- Rules: fix incorrect value for else rule for switchMultilevel devices

## v1.13.3
#### Fixes:
- Add missing doorlock in rules
- Fixed rules page
- Fixed icons

## v1.13.2
#### Fixes:
- Updated highlite.js to fix slow EasyScripting
- EnOcean devices do not re-appear with same name and in same room after being added back.
- Fixed missing rules actions for doorlocks

## v1.13.1
#### Fixes:
- Fix dashboard resistance to add elements
- Fix empty elements && dashboard bug, when last device removed from room
- Fix update devices count at rooms page
- Fix bug when add new elements in room
- Fixed wrong assignment of newly included devices to rooms
- Heating app validation added
- Security app improved
- Schedule and Rules transofrmation redesigned
- Adaptive fonts on multilevel widget
- Welcome screen translation updated

## v1.13.0
#### New features:
- EnOcean: reworked Teach-In process, EnOcean logo to the leaf, added support for many new devices
- Show references in Apps in widgets settings
- Show widgets id in Z-Wave device settings
- Added ZWAYSessionCookieIgnore header to the auth API
#### Fixes:
- Welcome pages adopted for mobile
- Improved updates of API data: updatedTime separated for ZAutomation, Z-Wave and EnOcean
- Fixed sliders on touch interfaces (RGBW was affected)
- Heating app fixed: energy save instead comfort temperature
- Accept the temperature with fractional part
- Removed welcome screen on subsequent loads
- Faster boot of the UI
- fixed days name in mobile view
- Changed icons in event tab like in elements tab
- remove scroll bar page-navi modal
- Fixed issue with big profile not fitting in user cookie
- Improved authentication to fix reloading login window
- Fixed ordering/sorting in elements

## v1.12.0
#### New features:
- Fast load of Dashboard, Rooms and Elements pages.
- Added support for EnOCean GP
- WiFi configuration for Z-Wave.Me Hub
- Better view for user sessions with last access and IP
- Show current session token for API in user settings
- Help for API commands for integrators in widget settings
- Added on/off icon for dimmers in mobile view
- Added PNG support for rooms images
#### Fixes:
- Improved interface load speed and tab switching
- Removed arrows in mobile view room page
- Added 'transparent for clicks' panel in the gallery of rooms
- Fixed crash on wrong color for RGB widget
- Fixed QR code reading in Smart Start
- Fixed jumping dimmer level on wheel step up/down.
- Added prefix to DSK
- Heating module. If room not exist, title should be: room deleted, img_src = null
- Beaty list of heating schedule temperatures, frostProtection
- Fixed events filtering problem
- EnOcean: Added more devices: Rehau and Afriso as well as Smart Ack and Generic Profile
- Fixed Remove Devices dialog
- Removed "metric:removed"
- Fixed non-working RGBW in mobile app
- Fixed element search field
- Improved QR-code generation
- Fixed search limit on widgets
- Removed Full button on Switch Multilevel (Dimmer)

## v1.11.1
#### Fixes:
- Automation/Security: added switchBinary in sensor list
- Automation/Smoke/Leakage: added general_purpose type in sensor list
- Automation/Heating: fixed schedule and default values
- Automation/Rules: fixed constrains for sensorMultilevel comparison
- Fixed missing icons
- Updated default skins

## v1.11.0
#### New features:
- New notification style.
- Automation section: adopted new notification style.
- Improved MobileAppSupport and NotificationFiltering
- Added NotificationFiltering edit form inside device settings
- Add time to Schedule
#### Fixes:
- Adopted new Font Awesome 5
- Links to new mobile apps

## v1.10.4
#### New features:
- Added EasyScripting fetures
- Added contextMenu
- Added highlight.js
#### Fixes:
- Added SASS/scss to Grunt

## v1.10.3
#### New features:
- Added Z-Way Mobile App support
- Show current authentication token
#### Fixes:
- Fix S2 inclusion bug on slow systems like Hub
- Removed unused Remember me checkbox
- Fixed probe-type in widged classes

## v1.10.2
#### Features:
- Added ?authBearer to force UI to check for session in Authorization Bearer token
- Added zme_hub app_type for Z-Wave.Me Hub
- Added EasyScripting to featured
- Devices / Mobile accessible to User role

#### Fixes:
- Fixed error on save of device info for user

## v1.10.1
#### Features:
- OAuth2 support added
- Permanent token UI implemented
- Per device access for users added
- Added sessions list and logout button to securelly unlog a device
- Added EnOcean SmartAck Teach In/Out UI
- Add Smart Start UI

#### Fixes:
- Fixed comparison constraints with sensorMultilevel in Rules
- Proper remove ZWAYSession when sending login info
- Fixed problem of missing parameters on redirection to the target url on first page load
- Fix redirect for find service
- fix issue #210 Please make placeholder text color more faint
- https://github.com/Z-Wave-Me/zwave-smarthome/issues/202
- Fix Hardcoded scheme in firmware update url
- "Hide events for this device" lost on device rename
- https://github.com/Z-Wave-Me/home-automation/issues/465
- fix Checkbox and right label not on the same line issue #255
- Fix full screen searchbox modal on mobile-view

## v1.8.0
#### New features
- New automation menu with improved Scenes, Rules and Schedules.
- New section Wifi devices.
- SmartStart.
- Added ITALIAN language.
- Online Apps: Improved mobile view.
- Local Apps: Improved mobile view.
- Elements: Improved mobile view.
- Rooms: Improved mobile view.
- Chekboxes replaced with the switcher.

## v1.7.1
#### New features
- Local Apps: Possibility to filter by Updated apps.
- RSS news: Added buttons READ MORE and READ.
- Rooms: In the header are sensors values updated.
- Improvements of the mobile view.

#### Fixes
- Sensors added to the room header dont show fullname by mouse over #245.
- User login language overwrites profile language.
- Elements, Apps and devices: Fixed bug in Firefox.
- Don't poll InspectQueue and ZWaveAPI/Data/xxx if current request is still pending #262.

#### Changes
- Device management: Remove device is completely refactored.
- Element detail: Deactivete checkbox replaced with Delete element button.
- Element with device type sensorMultiline has not an event icon.
- Elements: improved RGBW widgets
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
