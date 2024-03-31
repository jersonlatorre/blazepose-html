let isWebcamLoaded = false
let isDetectorLoaded = false
let pose = null
let mask, webcam, detector, bubble

function initResources() {
  webcam = createCapture(VIDEO, () => {
    isWebcamLoaded = true
    console.log('Webcam loaded')
    startDetection()
  })
  webcam.size(640, 480).hide()
  mask = createGraphics(320, 240)

  poseDetection
    .createDetector(poseDetection.SupportedModels.BlazePose, {
      runtime: 'tfjs',
      modelType: 'full',
      enableSegmentation: true,
      maxPoses: 1,
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
    })
    .then((det) => {
      detector = det
      isDetectorLoaded = true
      console.log('Detector loaded')
      startDetection()
    })
}

function startDetection() {
  if (isWebcamLoaded && isDetectorLoaded) {
    detectPose()
  }
}

async function detectPose() {
  if (!isWebcamLoaded || !isDetectorLoaded) return

  try {
    const poses = await detector.estimatePoses(webcam.elt, { flipHorizontal: true, enableSmoothing: true })
    if (poses.length > 0) {
      pose = poses[0].keypoints.reduce((acc, kp) => (kp.score > 0.8 ? { ...acc, [kp.name]: { x: kp.x, y: kp.y } } : acc), {})

      const segmentation = poses[0].segmentation
      if (segmentation) {
        const maskAux = await bodySegmentation.toBinaryMask(segmentation, { r: 0, g: 0, b: 0, a: 0 }, { r: 255, g: 255, b: 255, a: 255 }, false, 0.5)
        if (maskAux?.data.length > 0) {
          mask.clear()
          mask.loadPixels()
          mask.pixels.set(maskAux.data)
          mask.updatePixels()
        }
      }
    }

    tf.dispose(poses)
    requestAnimationFrame(detectPose)
  } catch (error) {
    console.error('Error detecting pose:', error)
  }
}

class Bubble {
  constructor() {
    this.x = 0
    this.y = 0
  }
  setPosition(x, y) {
    this.x = x
    this.y = y
  }
  draw() {
    noStroke()
    fill('white')
    circle(this.x, this.y, 50)
  }
}

function setup() {
  createCanvas(640, 480)
  initResources()
  bubble = new Bubble()
}

function draw() {
  image(webcam, 0, 0, width, height)
  image(mask, 0, 0, width, height)
  if (pose?.nose) {
    bubble.setPosition(pose.nose.x, pose.nose.y)
    bubble.draw()
  }

  fill('red')
  circle(100, 100, 50)
}
