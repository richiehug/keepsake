var width;
var height;
let gridSize = 3;
let currentImage;
var memories = [];
let activeVid, activeText;
let videoPlaying = false;
let customFont;
var debug = false;
let spacing = 10;

// stuff for ML
let classifier;
let imageModelURL = './assets/model/';
let video;
let flippedVideo;
let label = "Nothing";
let currentLabel = "";

var texts = [
  "Wendy playing outside, 06/06/21",
  "Cami's parents in Colombia, 07/09/22",
  "Visiting Bruna in Brazil, 01/21/21",
  "Evening in Paris, 09/10/22",
  "Hiking near Mendrisio, 11/10/22",
  "Abuelita feliz, 10/31/20",
  "Basel field trip, 11/29/22",
  "Dancing in Berlin, 12/01/22",
  "Thanksgiving, 11/25/22",
]

function preload() {
  for (i = 0; i < pow(gridSize, 2); i++) {
    memory = []
    memory.img = loadImage(`assets/img/memory${i + 1}.jpg`);
    memory.vid = createVideo(`assets/vid/memory${i + 1}.mp4`);
    memory.vid.volume(0.3);
    memory.vid.hide();
    memory.vid.onended(videoEnded);
    memories.push(memory);
  }
  currentScene = '';

  // stuff for ML
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');

  customFont = loadFont('assets/font/vcr_mono.ttf');
}

function videoEnded(vid) {
  videoPlaying = false;
}

function setup() {
  width = window.innerWidth
  height = window.innerHeight
  textFont(customFont);
  textSize(20);

  createCanvas(width, height);
  console.clear();
  video = createCapture(VIDEO);
  video.size(160, 120);
  video.hide();
  flippedVideo = ml5.flipImage(video)
  classifyVideo();
}

// Get a prediction for the current video frame
function classifyVideo() {
  flippedVideo = ml5.flipImage(video)
  classifier.classify(flippedVideo, gotResult);
}

// When we get a result
function gotResult(error, results) {
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  if (results[0].confidence > 0.97) {
    label = results[0].label;
    if (currentLabel != label) {
      currentLabel = label;
      console.log(`It's ${label}`);
    }
  }
  // Classifiy again!
  classifyVideo();
}

function draw() {
  if (videoPlaying == false && label != 'Nothing') {
    background(0);
    if (activeVid != null) {
      activeVid.stop();
      videoPlaying = false;
    }
    for (i = 0; i < pow(gridSize, 2); i++) {
      if (label == `Memory${i + 1}`) {
        activeVid = memories[i].vid;
        activeText = texts[i]
      }
    }
    activeVid.play();
    videoPlaying = true;
  }

  if (activeVid == null || videoPlaying == false) {
    for (i = 0; i < gridSize; i++) {
      for (j = 0; j < gridSize; j++) {
        fill(255);
        noStroke();
        rect(i / gridSize * width, j / gridSize * height, width / gridSize, height / gridSize);

        currentImage = memories[j * 3 + i].img;
        push();
        translate(i / gridSize * width + width / gridSize / 2, j / gridSize * height + height / gridSize / 2);
        imageMode(CENTER);
        image(currentImage, spacing, spacing, width / gridSize - spacing, currentImage.height * width / currentImage.width / gridSize / 2 - spacing, 0, 0, currentImage.width, currentImage.height, COVER);
        pop();

        if (debug) {
          push();
          translate(i / gridSize * width, j / gridSize * height);
          rect(0, 0, width / gridSize, height / gridSize / 10);
          fill(0);
          textAlign(CENTER, CENTER);
          text(texts[j * 3 + i], 0, 0, width / gridSize, height / gridSize / 10);
          pop();
        }
      }
    }
  } else {
    background(0);
    let vidWidth = height * activeVid.width / activeVid.height;
    push();
    translate(width / 2, 0);
    image(activeVid, -vidWidth / 2, 0, vidWidth, height);
    pop();

    push();
    let offset = 100;
    translate(0, height - offset);
    fill(255);
    rect(0, 0, width, offset);
    textSize(offset / 2);
    textAlign(CENTER);
    fill(0);
    text(activeText, 0, offset * 0.7, width, offset);
    pop();
  }
  if (debug) {
    fill(0);
    rect(0, 0, 160, 140);
    image(flippedVideo, 0, 0);
    fill(255);
    textSize(16);
    textAlign(CENTER);
    text(label, 80, 140 - 4);
  }
}

function windowResized() {
  width = window.innerWidth;
  height = window.innerHeight;
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (keyCode == 70) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}