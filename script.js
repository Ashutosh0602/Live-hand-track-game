const video = document.getElementById("videoid");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let isVideos = false;

let model = null;
const modelParams = {
  flipHorizontal: true,
  outputStride: 16,
  imageScaleFactor: 1,
  maxNumBoxes: 2,
  iouThreshold: 0.2,
  scoreThreshold: 0.6,
  modelType: "ssd320fpnlite",
  modelSize: "large",
  bboxLineWidth: "2",
  fontSize: 17,
};

function startVideo() {
  handTrack.startVideo(video).then((status) => {
    console.log("video started", status);
    if (status) {
      console.log("video is recording");
      isVideos = true;
      runDetection();
    }
  });
}

function runDetection() {
  model.detect(video).then((predictions) => {
    try {
      let pred = predictions.filter((array) => {
        return array.label == "open";
      });
      if (pred[0].bbox[0] <= 250) {
        document
          .getElementsByClassName("object")[0]
          .classList.add("object_pos_left");
        console.log("left le liya");
      }
      if (pred[0].bbox[0] > 250) {
        console.log("right le liya");
        document
          .getElementsByClassName("object")[0]
          .classList.remove("object_pos_left");
        document
          .getElementsByClassName("object")[0]
          .classList.add("object_pos_right");
      }
    } catch (err) {
      console.log("shi nhi chal rha");
    }
    model.renderPredictions(predictions, canvas, context, video);
    if (isVideos) {
      requestAnimationFrame(runDetection);
    }
  });
}

handTrack.load(modelParams).then((lmodel) => {
  model = lmodel;
  console.log(lmodel);
});

function toggle() {
  console.log("bta toggle karu ya na karu");
  isVideos = true;
  if (isVideos) {
    startVideo();
  }
}

function generateObstacles() {
  let obs_div = document.createElement("div");
  let push_div = document.getElementsByClassName("road")[0];
  let side = ["right", "left"];
  let side_no = side[Math.floor(Math.random() * 2)];
  console.log(side_no);
  push_div.appendChild(obs_div);
  obs_div.classList.add("object_obstacles");
  obs_div.innerText = "asdhoe";
  if (side_no == "right") {
    obs_div.style.right = "0";
  } else {
    obs_div.style.left = "0";
  }
  obs_div.style.top = "0%";

  let obs_pos = 0;
  function moveObstacles() {
    obs_div.style.top = `${obs_pos}%`;
    obs_pos += 0.1;
  }
  let gen_obs = setInterval(() => {
    generateObstacles();
    return clearInterval(gen_obs);
  }, 5000);
  let move_obs = setInterval(() => {
    moveObstacles();
    return () => {
      clearInterval(move_obs);
    };
  }, 1);
}
// generateObstacles();
