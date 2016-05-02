# Global





* * *

## AuthController
This is the Auth root controller

### AuthController.getRemoteId() 

Get remote id


### AuthController.getFirstAccess() 

Get first access


### AuthController.setLoginLang() 

Login language


### AuthController.processUser() 

Login with selected data from server response


### AuthController.redirectAfterLogin() 

Redirect



## AuthLoginController
The controller that handles login process.

### AuthLoginController.getSession() 

Get session (ie for users holding only a session id, or users that require no login)


### AuthLoginController.login() 

Login proccess



## AuthPasswordController
The controller that handles first access and password update.

### AuthPasswordController.changePassword() 

Change password



## PasswordForgotController
The controller that sends an e-mail with the link to reset forgotten passwort.

### PasswordForgotController.sendEmail() 

Send an email



## PasswordResetController
The controller that handles reset password actions.

### PasswordResetController.checkToken() 

Check a valid token


### PasswordResetController.changePassword() 

Change password



## LogoutController
The controller that handles logout process.

### LogoutController.logout() 

Logout an user




* * *



**Author:** Martin Vach



**Overview:** Controllers that handle the authentication of existing users, as well as forgot password.


