const video = document.getElementById("videoid");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let isVideos = false;
let isGame = true;
const car_pos = document
  .getElementsByClassName("object_car")[0]
  .getBoundingClientRect();

let model = null;
let total_score = 0;

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
      call_generateObstacles();
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
      }
      if (pred[0].bbox[0] > 250) {
        document
          .getElementsByClassName("object")[0]
          .classList.remove("object_pos_left");
        document
          .getElementsByClassName("object")[0]
          .classList.add("object_pos_right");
      }
    } catch (err) {}
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

function game_head() {
  if (isVideos) {
    document.getElementsByClassName("score_start")[0].style.display = "none";
    document.getElementsByClassName("object")[0].style.display = "block";
  }
  if (!isVideos) {
    document.getElementsByClassName("score_start")[0].style.display = "flex";
    document.getElementsByClassName("score_result")[0].innerText = total_score;
    total_score = 0;
    document.getElementsByClassName("object")[0].style.display = "none";
  }
}

function generateObstacles() {
  const obs_pos_ls = ["right", "left"];
  const obs_pos = obs_pos_ls[Math.floor(Math.random() * 2)];
  const obs_div = document.createElement("div");
  const obs_img = document.createElement("IMG");
  obs_img.setAttribute("src", "./rock.png");
  obs_div.appendChild(obs_img);
  obs_div.classList.add("object_obstacles");

  const obs_cont = document.getElementsByClassName("road")[0];
  obs_cont.appendChild(obs_div);

  obs_div.style.top = "0%";
  if (obs_pos == "right") {
    obs_div.style.right = "0";
  } else obs_div.style.left = "0";

  const obs_cur_pos = obs_div.getBoundingClientRect();
  let obs_pos_top = 0;
  function moveobstacles() {
    const car_cur_pos = document
      .getElementsByClassName("object")[0]
      .getBoundingClientRect();

    if (
      obs_cur_pos.x === car_cur_pos.x &&
      obs_div.getBoundingClientRect().y - 15 <= car_cur_pos.y &&
      car_cur_pos.y <= obs_div.getBoundingClientRect().y + 15
    ) {
      handTrack.stopVideo(video);
      isVideos = false;
      game_head();
      clearInterval(call);
      console.log(Math.floor(total_score / 10));
      console.log("mil gya");
    }
    if (obs_div.getBoundingClientRect().y > car_cur_pos.y) {
      total_score++;
    }

    const rem_pos = obs_div.style.top;

    if (rem_pos.split("%")[0] > 110) {
      let div_rem = obs_div;
      div_rem.remove();
    }

    obs_div.style.top = `${obs_pos_top}%`;
    obs_pos_top += 0.5;
  }
  const move = setInterval(() => {
    moveobstacles();
    return () => clearInterval(move);
  }, 10);
}
function call_generateObstacles() {
  const call = setInterval(() => {
    if (isVideos) {
      generateObstacles();
      return () => clearInterval(call);
    } else {
      clearInterval(call);
    }
  }, 3000);
  return call;
}

function toggle() {
  isVideos = true;
  if (isVideos) {
    startVideo();
    isVideos = true;
    game_head();
  }
}

console.log(
  "obstacle",
  document.getElementsByClassName("object_obstacles")[0].getBoundingClientRect()
);
console.log(
  "car",
  document.getElementsByClassName("object")[0].getBoundingClientRect()
);
