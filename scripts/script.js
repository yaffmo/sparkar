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
    mouth,
    paper1,
    paper2,
    paper3,
    reborn1,
    reborn2,
    reborn3,
    rectangle4,
    heart,
    material5,
    rectangle6,
    failScreen,
    countDown,
    start,
    reborn4,
    reborn5,
    rectangle7,
  ] = await Promise.all([
    Scene.root.findFirst("mouth"),

    Scene.root.findFirst("paper1"),
    Scene.root.findFirst("paper2"),
    Scene.root.findFirst("paper3"),
    Scene.root.findFirst("reborn1"),
    Scene.root.findFirst("reborn2"),
    Scene.root.findFirst("reborn3"),
    Scene.root.findFirst("rectangle4"),
    Textures.findFirst("animationSequence0"),
    Materials.findFirst("material5"),
    Scene.root.findFirst("rectangle6"),
    Scene.root.findFirst("fail"),
    Scene.root.findFirst("countDown"),
    Scene.root.findFirst("start"),
    Scene.root.findFirst("reborn4"),
    Scene.root.findFirst("reborn5"),
    Scene.root.findFirst("rectangle7"),
  ]);

  // Store a reference to a detected face
  const face = FaceTracking.face(0);

  failScreen.hidden = true;
  rectangle7.hidden = true;
  // paper1.hidden = true;
  // rectangle3.hidden = true

  const ScreenX = Patches.getScalarValue("ScreenX").pinLastValue();
  const ScreenY = Patches.getScalarValue("ScreenY").pinLastValue();
  // const planeTransform = plane.transform;
  const mouthRotationY = FaceTracking.face(0).cameraTransform.rotationY;
  const mouthRotationX = FaceTracking.face(0).cameraTransform.rotationX;

  // const mouthmultiplY = Reactive.mul(mouthCenterY, 300);
  // const mouthmultiplX = Reactive.mul(mouthCenterX, -600).add(-200);
  // const mouthmultiplY = mouthRotationY;
  const mouthX = Reactive.mul(mouthRotationY, ScreenX * 0.8);
  const mouthY = Reactive.mul(mouthRotationX, -ScreenY * 1.2).add(
    -ScreenY * 0.25
  );
  Diagnostics.watch("mouthX", mouthX);
  Diagnostics.watch("mouthY", mouthY);
  // const mouthmultiplX = mouthRotationX;

  mouth.transform.x = mouthX;
  mouth.transform.y = mouthY;

  const isKissing = FaceGestures.isKissing(face).eq(true);
  //   Diagnostics.watch('kiss', isKissing)

  // var timeleft = 10
  // var downloadTimer = Time.setInterval(function () {
  //   if (timeleft <= 0) {
  //     Time.clearInterval(downloadTimer)
  //   }
  //   var countNumber = 10 - timeleft
  //   timeleft -= 1
  //   var numberToShow = countNumber.toString()
  //   countDown.text = numberToShow
  // }, 1000)

  const papers = [paper1, paper2, paper3];

  papers.forEach(hasTouchBottom);

  function hasTouchBottom(item, index) {
    // const r4distance = Reactive.distance(
    //   rectangle4.transform.y,
    //   item.transform.y
    // );

    const r6distance = item.transform.y.lt(rectangle6.transform.y);
    // Diagnostics.watch('r4 Distance =>', r4distance)
    r6distance.monitor().subscribe((e) => {
      if (e.newValue === true) {
        reset(item);
        // Diagnostics.log(e.newValue);

        Time.setTimeout(() => {
          setImageFallEach(item);
          setImageSway(item);
        }, 500);
      }
    });
  }
  material5.diffuse.currentFrame = 3;

  // setFailSreen(material5, rectangle7, failScreen);

  var timeleft = Reactive.val(0);
  var countInterval = Time.setInterval(timereset, 1000);
  Time.clearInterval(countInterval);
  function timereset() {
    // Diagnostics.watch("showWinScreen", material5.diffuse.currentFrame.gt(1));
    // if (timeleft <= 0) {
    //   Time.clearInterval(countInterval);
    // }
    setWinScreen(material5, timeleft, failScreen, rectangle7);
    setFailSreen(material5, timeleft, rectangle7, failScreen);

    timeleft = timeleft.add(1);
    // Diagnostics.watch("timeleft", timeleft);
    var numberToShow = timeleft.toString();
    countDown.text = numberToShow.concat("s");
  }

  function setCountReset() {
    Time.clearInterval(countInterval);
    timeleft = timeleft.mul(0);
    countInterval = Time.setInterval(timereset, 1000);
  }
  // if (material5.diffuse.currentFrame.pinLastValue() === 0) {
  //   rectangle7.hidden = false
  // }

  papers.forEach(hasTouchDeadline);

  // function hasTouchDeadline(item, index) {
  //   const r6distance = Reactive.distance(
  //     rectangle6.transform.y,
  //     item.transform.y
  //   )
  //   // Diagnostics.watch('r4 Distance =>', r4distance)
  //   r6distance.monitor().subscribe((e) => {
  //     if (e.newValue <= 5) {
  //       var num = material5.diffuse.currentFrame.pinLastValue()
  //       num--
  //       Diagnostics.log(num)
  //       material5.diffuse.currentFrame = num
  //       Diagnostics.log(material5.diffuse.currentFrame.pinLastValue())
  //     }
  //   })
  // }

  function hasTouchDeadline(item, index) {
    // const r6distance = Reactive.distance(
    //   rectangle6.transform.y,
    //   item.transform.y
    // );

    const r6distance = item.transform.y.lt(rectangle6.transform.y);

    r6distance.monitor().subscribe((e) => {
      if (e.newValue === true) {
        // Diagnostics.log(e.newValue);
        var num = material5.diffuse.currentFrame.pinLastValue();
        num--;
        num = num < 0 ? 0 : num;
        // Diagnostics.log(num);
        material5.diffuse.currentFrame = num;
        Diagnostics.log(material5.diffuse.currentFrame.pinLastValue());
      }
    });
  }

  papers.forEach(checkTouchAndKiss);

  function checkTouchAndKiss(item, index) {
    const distance = Reactive.distance(item.transform.y, mouth.transform.y);
    // Diagnostics.log(distance.pinLastValue())
    const isTouching = distance.le(5);
    const isKissingandtouching = Reactive.and(isTouching, isKissing);
    isKissingandtouching.monitor().subscribe((e) => {
      if (e.newValue === true) {
        // Diagnostics.log(item);
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

  TouchGestures.onTap(failScreen).subscribe(() => {
    failScreen.hidden = true;
    countDown.hidden = false;
    material5.diffuse.currentFrame = 3;
    setCountReset();
    rectangle7.hidden = true;

    papers.forEach(reset);
    Time.setTimeout(() => {
      papers.forEach(setImageFallEach);
      papers.forEach(setImageSway);
    }, 1000);

    // rectangle2.hidden = paper1.transform.y.gt(-400)
  });

  TouchGestures.onTap(rectangle7).subscribe(() => {
    rectangle7.hidden = true;
    countDown.hidden = false;
    material5.diffuse.currentFrame = 3;
    setCountReset();
    // rectangle7.hidden = true;

    papers.forEach(reset);
    Time.setTimeout(() => {
      papers.forEach(setImageFallEach);
      papers.forEach(setImageSway);
    }, 1000);

    // rectangle2.hidden = paper1.transform.y.gt(-400)
  });

  TouchGestures.onTap(start).subscribe(() => {
    start.hidden = true;
    countInterval = Time.setInterval(timereset, 1000);
    Time.setTimeout(() => {
      papers.forEach(setImageFallEach);
      papers.forEach(setImageSway);
    }, 1000);
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

  // papers.forEach(setImageSway);

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

  // papers.forEach(setImageFallEach);

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
    const randomNum = Math.floor(Math.random() * 5);
    // Diagnostics.log(item);
    const rebornPosition = [reborn3, reborn2, reborn1, reborn4, reborn5];
    // const ScreenY = Patches.getScalarValue('ScreenY').pinLastValue();
    const planeInitialYPosition = rebornPosition[randomNum].transform;
    // const planeEndYPosition = rectangle4.transform
    // const timeDriver = Animation.timeDriver({
    //   durationMilliseconds: 10,
    //   loopCount: 1,
    // });
    // let linearSampler = Animation.samplers.linear(
    //   planeInitialYPosition,
    //   planeEndYPosition
    // );
    // item.transform.y = Animation.animate(timeDriver, linearSampler);

    item.transform.x = planeInitialYPosition.x;
    item.transform.y = planeInitialYPosition.y;
    // timeDriver.start();
  }
  function setWinScreen(material5, timeleft, failScreen, rectangle7) {
    // const isAlive = material5.diffuse.currentFrame.gt(0);
    const isDead = material5.diffuse.currentFrame.eq(0);
    const isTimeGreaterThan10 = timeleft.gt(10);
    // const isFailScreenNotShow = failScreen.hidden;
    const isStartScreenNotShow = start.hidden;
    // Diagnostics.watch("isStartScreenNotShow", isStartScreenNotShow);
    const showWinScreen = isDead
      .and(isTimeGreaterThan10)
      // .and(isFailScreenNotShow)
      .and(isStartScreenNotShow);

    // Diagnostics.watch("isTimeLeft", isTimeLeft);
    // Diagnostics.watch("isTimeLeft", isTimeGreaterThan10);
    // showWinScreen.monitor().subscribe((e) => {
    //   if (e.newValue === true) {
    rectangle7.hidden = showWinScreen.not();
    // failScreen.hidden = showFailScreen.not();
    // Diagnostics.watch("showFailScreen", showWinScreen);
    if (showWinScreen.pinLastValue() === true) {
      stopTimer(countInterval);
    }
    //   }
    // });
  }

  function setFailSreen(material5, timeleft, rectangle7, failScreen) {
    const isDead = material5.diffuse.currentFrame.eq(0);
    // Diagnostics.watch("isDead", isDead);
    const isTimeLessThan10 = timeleft.lt(10);
    // const isWinScreenNotShow = rectangle7.hidden;
    // Diagnostics.watch("isWinScreenNotShow", isWinScreenNotShow);
    const showFailScreen = isDead.and(isTimeLessThan10);

    // showFailScreen.monitor().subscribe((e) => {
    //   if (e.newValue === true) {
    failScreen.hidden = showFailScreen.not();
    Diagnostics.watch("showFailScreen", showFailScreen);
    if (showFailScreen.pinLastValue() === true) {
      stopTimer(countInterval);
    }
  }

  function stopTimer(countInterval) {
    Time.clearInterval(countInterval);
  }
})();
