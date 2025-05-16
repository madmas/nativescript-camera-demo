/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

import { Application, Device } from "@nativescript/core";
import { CameraPlus } from "@nstudio/nativescript-camera-plus";

//@ts-ignore
CameraPlus.useDeviceOrientation = true;
/*
(<any>global).shouldRotate = false;
if (__IOS__) {
  const CustomAppDelegate = (<any>UIResponder).extend(
    {
      applicationDidFinishLaunchingWithOptions: function (
        application,
        launchOptions
      ) {
        return true;
      },
      applicationSupportedInterfaceOrientationsForWindow: function (
        application: UIApplication,
        window: UIWindow
      ) {
        if (Device.deviceType === "Tablet") {
          if ((<any>global).lockOrientation) {
            if ((<any>global).lockPortrait) {
              return UIInterfaceOrientationMask.Portrait;
            } else {
              return UIInterfaceOrientationMask.LandscapeRight;
            }
          } else {
            return UIInterfaceOrientationMask.AllButUpsideDown;
          }
        } else {
          if ((<any>global).shouldRotate) {
            return UIInterfaceOrientationMask.AllButUpsideDown;
          } else {
            return UIInterfaceOrientationMask.Portrait;
          }
        }
      },
    },
    {
      name: "CustomAppDelegate",
      protocols: [UIApplicationDelegate],
    }
  );
  Application.ios.delegate = CustomAppDelegate;
}
*/

Application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
