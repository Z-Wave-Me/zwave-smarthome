SmartHome UI
===============

Angular app
## v1.3.1
#### New features
- Online apps: displaying count of ratings and average value. 
- Management: Added postfix - the list of pstched devices. 
- Add appp: integration of the dependencies between the modules.
- Local appps: added "Update to latest" button.
- Improved error handling.
- On-line appps: dysplaying patches in the update window and in the app detail.
- Improved Z-Wave inclusion.
- Added HTML title attribute to navigation and buttons.
- Management: reset to factory default.

#### Fixes
- ???

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
