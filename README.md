SmartHome UI
===============

This User Interfaces allows to operate a Smart Home Network based on Z-Wave devices. It utilizes the software architecture "Z-Way", certified as Z-Wave Plus Controller.
## v1.4.2
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
