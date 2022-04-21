myAppService.service('mobileDetector', function (cfg) {
  const IOS = ['ZWayMobileAppiOS', 'IOSWRAPPER']
  const android = ['PoppApp_Z_Way', 'ZWayMobileAppAndroid']
  this.isMobile = function () {
    return this.isIOS() || this.isAndroid();
  }
  this.isAndroid = function () {
    return android.includes(cfg.route.os);
  }

  this.isIOS = function () {
    return IOS.includes(cfg.route.os);
  }
})
