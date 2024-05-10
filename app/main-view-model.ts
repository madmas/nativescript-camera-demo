import type { ImageAsset, ShowModalOptions } from "@nativescript/core";
import {
  Observable,
  ImageSource,
  Frame,
  Image,
  Page,
} from "@nativescript/core";
import { CameraPlus } from "@nstudio/nativescript-camera-plus";
import { ObservableProperty } from "./observable-property";
declare const io;
interface CameraInfo {
  cameraId: string;
  maxDigitalZoom: number;
  zoomRange: number[];
  activeSize: { x: number; y: number; width: number; height: number };
  minZoom: number;
  maxZoom: number;
  hardwareLevel: number;
  implementationType: string;
  lensFacing: number;
}

export class HelloWorldModel extends Observable {
  private _counter: number = 0;
  @ObservableProperty()
  public cam: CameraPlus;
  @ObservableProperty()
  public cameraHeight: number;
  cameraInfo: CameraInfo[] = [];
  currentCameraInfo?: CameraInfo;
  currentCameraIds?: { frontCameraId: string; backCameraId: string };

  constructor(public page: Page) {
    super();

    this.cam = page.getViewById("camPlus") as CameraPlus;

    // hide a default icon button here
    // this.cam.showGalleryIcon = false

    this.cameraHeight = 500;

    if (this._counter > 0) {
      return;
    }

    this.cam.on(CameraPlus.errorEvent, (args) => {
      console.log("*** CameraPlus errorEvent ***", args);
    });

    this.cam.on(CameraPlus.toggleCameraEvent, (args: any) => {
      console.log(`toggleCameraEvent listener on main-view-model.ts  ${args}`);
    });

    this.cam.on(CameraPlus.photoCapturedEvent, (args: any) => {
      console.log(`photoCapturedEvent listener on main-view-model.ts  ${args}`);
      console.log((<any>args).data);
      ImageSource.fromAsset((<any>args).data).then((res) => {
        const testImg = Frame.topmost().getViewById(
          "testImagePickResult"
        ) as Image;
        testImg.src = res;
      });
    });

    this.cam.on(CameraPlus.imagesSelectedEvent, (args: any) => {
      console.log(`imagesSelectedEvent listener on main-view-model.ts ${args}`);
    });

    this.cam.on(CameraPlus.videoRecordingReadyEvent, (args: any) => {
      console.log(`videoRecordingReadyEvent listener fired`, args.data);
    });

    this.cam.on(CameraPlus.videoRecordingStartedEvent, (args: any) => {
      console.log(`videoRecordingStartedEvent listener fired`, args.data);
    });

    this.cam.on(CameraPlus.videoRecordingFinishedEvent, (args: any) => {
      console.log(`videoRecordingFinishedEvent listener fired`, args.data);
    });

    this._counter = 1;
  }

  isAndroid = global.isAndroid;

  openSettings(args) {
    Frame.topmost().showModal("settings-page", <ShowModalOptions>{
      context: {
        cameraInfo: this.cameraInfo,
        currentCameraIds: this.currentCameraIds,
        currentCameraInfo: this.currentCameraInfo,
      },
      fullscreen: true,
      closeCallback: (args: {
        frontCameraId: string;
        backCameraId: string;
      }) => {
        this.currentCameraIds = args;

        if (this.currentCameraIds) {
          const fancyCamera = this.cam.nativeView.getChildAt(0);
          const camera2View = fancyCamera.getChildAt(0);
          const position = fancyCamera.getPosition();
          if (
            position === io.github.triniwiz.fancycamera.CameraPosition.FRONT
          ) {
            const id = this.currentCameraIds.frontCameraId;
            camera2View.setFrontCameraId(id);
          } else {
            const id = this.currentCameraIds.backCameraId;
            camera2View.setBackCameraId(id);
          }
        }
      },
    });
  }

  private updateCurrentCameraInfo() {
    if (!this.cam) {
      return;
    }
    const fancyCamera = this.cam.nativeView.getChildAt(0);
    const camera2View = fancyCamera.getChildAt(0);
    const currentCameraInfo = camera2View.getCurrentCameraInfo();

    if (currentCameraInfo) {
      const size = currentCameraInfo.getActiveSize() as android.graphics.Rect;
      const range =
        currentCameraInfo.getZoomRange() as android.util.Range<java.lang.Float>;
      this.currentCameraInfo = {
        cameraId: currentCameraInfo.getId(),
        maxDigitalZoom: currentCameraInfo.getMaxDigitalZoom(),
        zoomRange: [
          range.getLower().floatValue(),
          range.getUpper().floatValue(),
        ],
        activeSize: {
          x: size.left,
          y: size.top,
          width: size.width(),
          height: size.height(),
        },
        minZoom: currentCameraInfo.getMinZoom(),
        maxZoom: currentCameraInfo.getMaxZoom(),
        hardwareLevel: currentCameraInfo.getHardwareLevel(),
        implementationType: currentCameraInfo.getImplementationType(),
        lensFacing: currentCameraInfo.getLensFacing(),
      };
    }
  }

  camLoaded(args: any) {
    const cam = args.object as CameraPlus;
    console.log(`cam loaded event`);
    const handle = () => {
      try {
        const sizes = cam.getAvailablePictureSizes("16:9");
        // console.log("sizes", sizes);
        cam.autoFocus = true;

        const flashMode = args.object.getFlashMode();
        console.log(`flashMode in loaded event = ${flashMode}`);

        if (__ANDROID__) {
          this.cameraInfo = [];

          if (sizes.length > 0) {
            const fancyCamera = cam.nativeView.getChildAt(0);
            const camera2View = fancyCamera.getChildAt(0);

            this.updateCurrentCameraInfo();

            const cameraInfo =
              camera2View.getDeviceCameraInfo() as java.util.List<any>;
            if (cameraInfo) {
              const infoSize = cameraInfo.size();
              for (let i = 0; i < infoSize; i++) {
                const info = cameraInfo.get(i);
                const size = info.getActiveSize() as android.graphics.Rect;
                const range =
                  info.getZoomRange() as android.util.Range<java.lang.Float>;
                this.cameraInfo.push({
                  cameraId: info.getId(),
                  maxDigitalZoom: info.getMaxDigitalZoom(),
                  zoomRange: [
                    range.getLower().floatValue(),
                    range.getUpper().floatValue(),
                  ],
                  activeSize: {
                    x: size.left,
                    y: size.top,
                    width: size.width(),
                    height: size.height(),
                  },
                  minZoom: info.getMinZoom(),
                  maxZoom: info.getMaxZoom(),
                  hardwareLevel: info.getHardwareLevel(),
                  implementationType: info.getImplementationType(),
                  lensFacing: info.getLensFacing(),
                });
              }
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    cam.hasCameraPermission().then((granted) => {
      console.log("hasPerms:", granted);
      if (granted) {
        handle();
      } else {
        cam.requestCameraPermissions().then(() => handle());
      }
    });
  }

  public recordDemoVideo() {
    try {
      console.log(`*** start recording ***`);
      this.cam.record({
        saveToGallery: true,
      });
    } catch (err) {
      console.log(err);
    }
  }

  public stopRecordingDemoVideo() {
    try {
      console.log(`*** stop recording ***`);
      this.cam.stop();
      console.log(`*** after this.cam.stop() ***`);
    } catch (err) {
      console.log(err);
    }
  }

  public toggleFlashOnCam() {
    this.cam.toggleFlash();
  }

  public toggleShowingFlashIcon() {
    console.log(`showFlashIcon = ${this.cam.showFlashIcon}`);
    this.cam.showFlashIcon = !this.cam.showFlashIcon;
  }

  public toggleTheCamera() {
    if (__ANDROID__) {
      if (this.currentCameraIds) {
        const fancyCamera = this.cam.nativeView.getChildAt(0);
        const camera2View = fancyCamera.getChildAt(0);
        const position = fancyCamera.getPosition();
        if (position === io.github.triniwiz.fancycamera.CameraPosition.FRONT) {
          const id = this.currentCameraIds.backCameraId;
          fancyCamera.setPosition(
            io.github.triniwiz.fancycamera.CameraPosition.BACK
          );
          camera2View.setBackCameraId(id);
        } else {
          const id = this.currentCameraIds.frontCameraId;
          fancyCamera.setPosition(
            io.github.triniwiz.fancycamera.CameraPosition.FRONT
          );
          camera2View.setFrontCameraId(id);
        }
      } else {
        this.cam.toggleCamera();
      }
    } else {
      this.cam.toggleCamera();
    }
  }

  public openCamPlusLibrary() {
    this.cam.chooseFromLibrary().then(
      (images: Array<ImageAsset>) => {
        console.log("Images selected from library total:", images.length);
        for (const source of images) {
          console.log(`source = ${source}`);
        }
        const testImg = Frame.topmost().getViewById(
          "testImagePickResult"
        ) as Image;
        const firstImg = images[0];
        console.log(firstImg);
        ImageSource.fromAsset(firstImg)
          .then((res) => {
            const testImg = Frame.topmost().getViewById(
              "testImagePickResult"
            ) as Image;
            testImg.src = res;
          })
          .catch((err) => {
            console.log(err);
          });
      },
      (err) => {
        console.log("Error -> " + err.message);
      }
    );
  }

  public takePicFromCam() {
    this.cam.requestCameraPermissions().then(() => {
      if (!this.cam) {
        this.cam = new CameraPlus();
      }
      this.cam.takePicture({ saveToGallery: true });
    });
  }
}
