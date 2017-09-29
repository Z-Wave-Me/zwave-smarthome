SmartHome UI Documentation
===
app
---
name | overview
:-- | :--
[app\app.js](app/app.md) | _This is used to handle angular modules, routes and other settings._
[app\config.js](app/config.md) | _The main configuration file._
[app\icons.js](app/icons.md) | _The object with default icons._
[app\routes.js](app/routes.md) | _This is used to handle angular routes._
[app\templates.js](app/templates.md) | _This is used to store the compiled and compressed views._
- - -


app/controllers
---
name | overview
:-- | :--
[app\controllers\app-alpaca.js](app/controllers/app-alpaca.md) | _Controllers that handle the Alpaca._
[app\controllers\app-instance.js](app/controllers/app-instance.md) | _Controllers that handle the Instances._
[app\controllers\app-local.js](app/controllers/app-local.md) | _Controllers that handle the Local apps._
[app\controllers\app-online.js](app/controllers/app-online.md) | _Controllers that handle the Online apps._
[app\controllers\app.js](app/controllers/app.md) | _Controllers that handle the Local apps, Online Apps and Active apps._
[app\controllers\auth.js](app/controllers/auth.md) | _Controllers that handle the authentication of existing users, as well as forgot password._
[app\controllers\base.js](app/controllers/base.md) | _The parent controller that stores all function used in the child controllers._
[app\controllers\camera.js](app/controllers/camera.md) | _Controllers that handle all Camera actions – manage and add camera._
[app\controllers\controllers.js](app/controllers/controllers.md) | _The uncategorized controllers._
[app\controllers\device.js](app/controllers/device.md) | _This controller handles devices submenus – Z-Wave, Camera and EnOcean._
[app\controllers\element-id.js](app/controllers/element-id.md) | _Controllers that handle element detail actions, as well as custom icon actions._
[app\controllers\element-widget.js](app/controllers/element-widget.md) | _Controllers that handle specifics widget actions._
[app\controllers\element.js](app/controllers/element.md) | _Controllers that handle the list of elements, dashboar and elements in the room._
[app\controllers\enocean.js](app/controllers/enocean.md) | _Controllers that handle EnOcean Services._
[app\controllers\event.js](app/controllers/event.md) | _Handles all events._
[app\controllers\icon.js](app/controllers/icon.md) | _Controllers that handle all custom icon actions – displays and uploads._
[app\controllers\jamesbox.js](app/controllers/jamesbox.md) | _Controllers that handle the JamesBox actions._
[app\controllers\management-appstore.js](app/controllers/management-appstore.md) | _The controller that renders and handles app store data._
[app\controllers\management-cloud-backup.js](app/controllers/management-cloud-backup.md) | _The controller that handles a backup to the cloud._
[app\controllers\management-factory.js](app/controllers/management-factory.md) | _The controller that resets the system to factory default._
[app\controllers\management-firmware.js](app/controllers/management-firmware.md) | 
[app\controllers\management-licence.js](app/controllers/management-licence.md) | _he controller that handles the licence key._
[app\controllers\management-local.js](app/controllers/management-local.md) | _The controller that renders and handles local access._
[app\controllers\management-remote.js](app/controllers/management-remote.md) | _The controller that renders and handles remote access data._
[app\controllers\management-report.js](app/controllers/management-report.md) | _The controller that handles bug report info._
[app\controllers\management-restore.js](app/controllers/management-restore.md) | _The controller that handles restore process._
[app\controllers\management-timezone-jb.js](app/controllers/management-timezone-jb.md) | _The controller that handles a timezone for JB._
[app\controllers\management-timezone.js](app/controllers/management-timezone.md) | _The controller that handles a timezone._
[app\controllers\management-user.js](app/controllers/management-user.md) | _Controllers that handle user list and detail_
[app\controllers\management.js](app/controllers/management.md) | _Controllers that handle management actions._
[app\controllers\mysettings.js](app/controllers/mysettings.md) | _Handles user actions._
[app\controllers\rf433.js](app/controllers/rf433.md) | _Controllers that handle RF433 Services._
[app\controllers\room.js](app/controllers/room.md) | _Controllers that handle room actions._
[app\controllers\rss.js](app/controllers/rss.md) | _Controllers that handle all Camera actions – manage and add camera._
[app\controllers\skin.js](app/controllers/skin.md) | _Controllers that handle all Skins actions._
[app\controllers\zwave-commands.js](app/controllers/zwave-commands.md) | _Handles expert commands  in the device hardware configuration._
[app\controllers\zwave-configuration.js](app/controllers/zwave-configuration.md) | _Handles actions in the device hardware configuration._
[app\controllers\zwave-exclude.js](app/controllers/zwave-exclude.md) | _Handles Reset/Remove proccess of elemnts._
[app\controllers\zwave-inclusion.js](app/controllers/zwave-inclusion.md) | _Handles Z-Wave device inclusion actions._
[app\controllers\zwave-manage.js](app/controllers/zwave-manage.md) | _Controllers that manage Z-Wave devices._
[app\controllers\zwave-vendor.js](app/controllers/zwave-vendor.md) | _The controller that renders Z-Wave vendors and products._
- - -


app/directives
---
name | overview
:-- | :--
[app\directives\angular-slider.js](app/directives/angular-slider.md) | 
[app\directives\dir-pagination.js](app/directives/dir-pagination.md) | _AngularJS module for paginating (almost) anything._
[app\directives\directives-expert.js](app/directives/directives-expert.md) | _Angular directives that are used in device hardware configuration view._
[app\directives\directives.js](app/directives/directives.md) | _Common Angular directives that are used within the views._
[app\directives\tc-angular-chartjs.js](app/directives/tc-angular-chartjs.md) | _Angular directive that is used to handle charts._
- - -


app/factories
---
name | overview
:-- | :--
[app\factories\factories.js](app/factories/factories.md) | _Angular factories that handle cache, Underscore and HTTP requests._
- - -


app/filters
---
name | overview
:-- | :--
[app\filters\filters.js](app/filters/filters.md) | _Filters that are used to format data within views and controllers._
- - -


app/jquery
---
name | overview
:-- | :--
[app\jquery\postrender.js](app/jquery/postrender.md) | _Receives data from the Alpaca form and stores them on the server._
- - -


app/modules
---
name | overview
:-- | :--
[app\modules\httpLatency.js](app/modules/httpLatency.md) | _Angular module httpLatency simulates Latency for AngularJS $http Calls with Response Interceptorsy._
[app\modules\qAllSettled.js](app/modules/qAllSettled.md) | _Angular module qAllSettled executes a number of operations concurrently._
- - -


app/services
---
name | overview
:-- | :--
[app\services\services-expert.js](app/services/services-expert.md) | _Common functions that are used within device hardware configuration_
[app\services\services.js](app/services/services.md) | _Stores methods that are used within controllers._
- - -

