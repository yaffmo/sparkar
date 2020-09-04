const Scene = require("Scene");
const Diagnostics = require("Diagnostics");
const Textures = require("Textures");
const Time = require("Time");
const TouchGestures = require("TouchGestures");
const CameraInfo = require("CameraInfo");
const Materials = require("Materials");
const Animation = require("Animation");
const Instruction = require("Instruction");
const Reactive = require("Reactive");
const FaceGestures = require("FaceGestures");
const FaceTracking = require("FaceTracking");
const Patches = require("Patches");

// Enable async/await in JS [part 1]
(async function () {
  // Locate the plane in the Scene
  const [
    plane,
    paper1,
    paper2,
    paper3,
    rectangle1,
    rectangle2,
    rectangle3,
    rectangle4,
  ] = await Promise.all([
    Scene.root.findFirst("rectangle5"),

    Scene.root.findFirst("paper1"),
    Scene.root.findFirst("paper2"),
    Scene.root.findFirst("paper3"),
    Scene.root.findFirst("rectangle1"),
    Scene.root.findFirst("rectangle2"),
    Scene.root.findFirst("rectangle3"),
    Scene.root.findFirst("rectangle4"),
  ]);

  // Store a reference to a detected face
  const face = FaceTracking.face(0);

  rectangle2.hidden = true;
  rectangle3.hidden = true;

  const planeTransform = plane.transform;
  const mouthCenterY = FaceTracking.face(0).cameraTransform.rotationY;
  const mouthCenterX = FaceTracking.face(0).cameraTransform.rotationX;

  const mouthmultiplY = Reactive.mul(mouthCenterY, 300);
  const mouthmultiplX = Reactive.mul(mouthCenterX, -600).add(-200);

  planeTransform.x = mouthmultiplY;
  planeTransform.y = mouthmultiplX;

  // const ScreenX = Patches.getScalarValue('ScreenX').pinLastValue();
  // const ScreenY = Patches.getScalarValue('ScreenY').pinLastValue();

  const isKissing = FaceGestures.isKissing(face).eq(true);
  Diagnostics.watch("kiss", isKissing);

  const papers = [paper1, paper2, paper3];

  papers.forEach(hasTouchBottom);

  function hasTouchBottom(item, index) {
    const r4distance = Reactive.distance(
      rectangle4.transform.y,
      item.transform.y
    );
    Diagnostics.watch("r4 Distance =>", r4distance);
    r4distance.monitor().subscribe((e) => {
      if (e.newValue <= 0) {
        reset(item);
        Time.setTimeout(() => {
          setImageFallEach(item);
        }, 500);
      }
    });
  }

  papers.forEach(checkTouchAndKiss);

  function checkTouchAndKiss(item, index) {
    const distance = Reactive.distance(item.transform.y, plane.transform.y);
    Diagnostics.log(distance.pinLastValue());
    const isTouching = distance.le(5);
    const isKissingandtouching = Reactive.and(isTouching, isKissing);
    isKissingandtouching.monitor().subscribe((e) => {
      if (e.newValue === true) {
        Diagnostics.log(item);
        setFly(item);
      }
    });
  }

  function setFly(item) {
    setImageUp(item);
    Time.setTimeout(() => {
      setImageFallEach(item);
    }, 1000);
  }

  TouchGestures.onTap(rectangle1).subscribe(() => {
    paper1.hidden = false;
    rectangle1.hidden = true;
    // rectangle3.hidden = false;
    setImageSway();
    setImageFallEach();
    rectangle2.hidden = paper1.transform.y.gt(-400);
  });

  // TouchGestures.onTap(rectangle2).subscribe(() => {
  //     reset();
  //     Time.setTimeout(() => {
  //         setImageFallEach();
  //     }, 500);
  // });

  // TouchGestures.onTap(rectangle3).subscribe(() => {
  //     setImageUp();
  //     Time.setTimeout(() => {
  //         setImageFallEach();
  //     }, 500);
  // });

  papers.forEach(setImageSway);

  function setImageSway(item) {
    const timeDriverParameters = {
      durationMilliseconds: 1500,
      loopCount: Infinity,
      mirror: true,
    };

    const timeDriver = Animation.timeDriver(timeDriverParameters);
    const quadraticSampler = Animation.samplers.easeInOutQuad(
      -item.transform.x.pinLastValue(),
      100
    );
    const translationAnimation = Animation.animate(
      timeDriver,
      quadraticSampler
    );

    item.transform.x = translationAnimation;
    // paper2.transform.x = translationAnimation2;
    // paper3.transform.x = translationAnimation3;

    timeDriver.start();
  }

  papers.forEach(setImageFallEach);

  function setImageFallEach(item) {
    const planeInitialYPosition = item.transform.y.pinLastValue();
    const planeEndYPosition = rectangle4.transform.y.pinLastValue();
    const timeDriver = Animation.timeDriver({
      durationMilliseconds: 5000,
      loopCount: 1,
    });
    let linearSampler = Animation.samplers.linear(
      planeInitialYPosition,
      planeEndYPosition
    );
    item.transform.y = Animation.animate(timeDriver, linearSampler);
    timeDriver.start();
  }

  function setImageUp(item) {
    const timeDriverParameters = {
      durationMilliseconds: 1000,
      loopCount: 1,
      mirror: false,
    };
    // const ScreenY = Patches.getScalarValue('ScreenY').pinLastValue();

    const planeInitialYPosition = item.transform.y.pinLastValue();

    const planeEndYPosition = item.transform.y.add(300).pinLastValue();

    const timeDriver = Animation.timeDriver(timeDriverParameters);
    let linearSampler = Animation.samplers.linear(
      planeInitialYPosition,
      planeEndYPosition
    );
    item.transform.y = Animation.animate(timeDriver, linearSampler);

    timeDriver.start();
  }

  function reset(item) {
    const randomNum = Math.floor(Math.random() * 2);
    const rebornPosition = [rectangle3, rectangle2, rectangle1];
    // const ScreenY = Patches.getScalarValue('ScreenY').pinLastValue();
    const planeInitialYPosition = rebornPosition[
      randomNum
    ].transform.y.pinLastValue();
    const planeEndYPosition = rectangle4.transform.y.pinLastValue();
    const timeDriver = Animation.timeDriver({
      durationMilliseconds: 10,
      loopCount: 1,
    });
    let linearSampler = Animation.samplers.linear(
      planeInitialYPosition,
      planeEndYPosition
    );
    item.transform.y = Animation.animate(timeDriver, linearSampler);

    timeDriver.start();
  }
})();
