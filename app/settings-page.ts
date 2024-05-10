import {
  EventData,
  Frame,
  Observable,
  Page,
  NavigatedData,
  Dialogs,
  Application,
  fromObject,
} from "@nativescript/core";

class SettingsModel extends Observable {
  selectedBack = "";
  selectedFront = "";
  cameras = [];
  constructor(public page: Page) {
    super();
  }

  close(args) {
    args.object.closeModal({
      frontCameraId: this.selectedFront.split(" ")?.[0] ?? "1",
      backCameraId: this.selectedBack.split(" ")?.[0] ?? "0",
    });
  }

  selectBackCamera() {
    const options = this.cameras
      .filter((item) => {
        return item.lensFacing === 0;
      })
      .map((item) => {
        return item.cameraId;
      });

    Dialogs.action("Choose Back Camera", "Cancel", options).then(
      (selection) => {
        if (selection) {
          const item = this.cameras.find((item) => item.cameraId === selection);
          if (item) {
            this.set(
              "selectedBack",
              `${item.cameraId} ${item.implementationType}`
            );
          }
        }
      }
    );
  }

  selectFrontCamera() {
    const options = this.cameras
      .filter((item) => {
        return item.lensFacing === 1;
      })
      .map((item) => {
        return item.cameraId;
      });
    Dialogs.action("Choose Front Camera", "Cancel", options).then(
      (selection) => {
        if (selection) {
          const item = this.cameras.find((item) => item.cameraId === selection);
          if (item) {
            this.set(
              "selectedFront",
              `${item.cameraId} ${item.implementationType}`
            );
          }
        }
      }
    );
  }
}

export function pageLoaded(args: NavigatedData) {
  const context = args.context;
  const page = <Page>args.object;
  const model = new SettingsModel(page);

  if (context) {
    const currentCameraInfo = context.currentCameraInfo;
    const currentCameraIds = context.currentCameraIds;
    if (!currentCameraInfo) {
      return;
    }
    model.cameras = context.cameraInfo;
    if (currentCameraInfo.lensFacing === 0) {
      model.selectedBack = `${currentCameraInfo.cameraId} ${currentCameraInfo.implementationType}`;
    

      const options = model.cameras.filter((item) => {
        if (currentCameraIds?.frontCameraId) {
          if (currentCameraIds.frontCameraId === item.cameraId) {
            model.selectedFront = `${item.cameraId} ${item.implementationType}`;
          }
        }
        return item.lensFacing === 1;
      });

      if (!model.selectedFront && options && options[0]) {
        model.selectedFront = `${options[0].cameraId} ${options[0].implementationType}`;
      }
    } else if (currentCameraInfo.lensFacing === 1) {
      model.selectedFront = `${currentCameraInfo.cameraId} ${currentCameraInfo.implementationType}`;

   
      const options = model.cameras.filter((item) => {
        if (currentCameraIds?.backCameraId) {
          if (currentCameraIds.backCameraId === item.cameraId) {
            model.selectedBack = `${item.cameraId} ${item.implementationType}`;
          }
        }
        return item.lensFacing === 0;
      });

      if (!model.selectedBack && options && options[0]) {
        model.selectedBack = `${options[0].cameraId} ${options[0].implementationType}`;
      }
    }
  }

  page.bindingContext = model;
}
