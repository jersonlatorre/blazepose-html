let poseDetector

function setup() {
  createCanvas(640, 480)
  poseDetector = new PoseDetector()
}

function draw() {
  background('black')

  poseDetector.drawWebcam()
  poseDetector.drawMask()

  try {
    drawInteraction()
  } catch (e) {}
  
}

function drawInteraction() {
  noStroke()
  fill('white')

  // circle(poseDetector.pose.leftWrist.x, poseDetector.pose.leftWrist.y, 200)
  // circle(poseDetector.pose.rightWrist.x, poseDetector.pose.rightWrist.y, 200)

}
