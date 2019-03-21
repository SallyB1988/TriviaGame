class TriviaData {
  constructor (q, answers, correct, image=null) {
    this.question = q;
    this.answers = answers;
    this.correct = correct; // index of the correct answer
    this.image = image;
  }
}
// ===== constants ==================================
const data = [
  new TriviaData("Which state had the first subway system?",
  ["New York", "California", "Illinois", "Massachusetts"], 3),
  new TriviaData("The fig newton is named after Newton, Massachusetts",
  ["True", "False"], 0),
  new TriviaData("The Grand Canyon is located in which state?",
  ["Arizona", "New Mexico", "Utah", "Wyoming"], 0),
  new TriviaData("Which state published the first daily newspaper?",
  ["New York", "Maryland", "Pennsylvania", "New Hampshire"], 2),
  new TriviaData("What state is this?",
  ["Maine", "New Jersey", "Vermont", "New Hampshire"], 3, "./assets/images/NH.jpg"),
  new TriviaData("What state is this?",
  ["Kentucky", "Tennesee", "Illinois", "North Carolina"], 1, "./assets/images/TN.jpg"),
  new TriviaData("What state is this?",
  ["New York", "Pennsylvania", "Wisconsin", "Vermont"], 0, "./assets/images/NY.jpg"),
  new TriviaData("What state is this?",
  ["Louisiana", "Arkansas", "Alabama", "Mississippi"], 2, "./assets/images/AL.png"),
  new TriviaData("What state is this?",
  ["North Carolina", "Alabama", "Georgia", "South Carolina"], 3, "./assets/images/SC.jpg"),
  new TriviaData("What state is this?",
  ["Colorado", "Utah", "New Mexico", "Missouri"], 0, "./assets/images/CO.png"),
  new TriviaData("An Idaho law forbids a citizen to give another citizen a box of candy that weighs more than _____ pounds",
  ["20", "30", "40", "50"], 3),
  new TriviaData("Florida is the only state that grows coffee.",
  ["True", "False"], 1),
  new TriviaData("Which state was the 50th state added to the union?",
  ["Arizona", "Alaska", "Hawaii", "New Mexico"], 2),
];
const allowedTime =30; // time in seconds
const quizLength = 10; // number of questions to ask

// ===== Variables ====================================
var currentAnswer = 0;
var questionsAsked = 0;
var numCorrect = 0;
var numWrong = 0;
var isRunning = true;
var timer = allowedTime;
var timerId = null;

// ===== hooks =======================================
const $intro = $("#intro-box");         // instructions
const $quiz = $("#quiz-box");           // question region
const $results = $("#results-box");     // final results of game

const $timer = $("#timer");             // timer
const $quizImage = $("#quiz-image");    // image for quiz questino
const $answerList = $("#answer-list");  // answer choices
const $winLose = $("#win-lose");        // correct/incorrect image display

window.onload = function() {
  introVisible();
  $("#instructions").html(`Answer ${quizLength} trivia questions about the United States in ${allowedTime} seconds!`);
  $("#intro-btn").click(startQuiz);
  $("#results-btn").click(restartQuiz);
};

// In case I want to allow game to restart with new quiz topic
function introVisible() {
  $intro.show();
  $quiz.hide();
  $results.hide()
};

function quizVisible() {
  $intro.hide();
  $quiz.show();
  $results.hide();
};

function resultsVisible() {
  $intro.hide();
  $quiz.hide();
  $results.show();
};

const getRandomQuestion = () => {
  var randIndex = Math.floor(Math.random() * data.length);
  displayQuestion(data[randIndex]);
  data.splice(randIndex,1);
}

/**
 * Take question data and populate the quiz card
 * @param {*} q 
 */
const displayQuestion = (q) => {
  if (q.image != null) {
    $quizImage.attr("src", q.image);
  } else {
    $quizImage.attr("src", null);
  }
  $("#question-text").html(q.question);
  currentAnswer = q.correct;

  //  Clear out any existing answers and put new ones in
  $answerList.empty();
  q.answers.forEach((a,index) => {
    $answerList.append(`<button id="answer-${index}" type="button" class="list-group-item list-group-item-action">${a}</button>`);
  })
}

/**
 * Given the id of the clicked answer, check to see if the answer is correct
 * @param {*} id 
 */
const checkAnswer = (id) => {
  const index = parseInt(id.slice(id.indexOf('-') + 1));
  if (index === currentAnswer) {
    $winLose.html("<img class='win-lose' src='./assets/images/checkmark.png' alt='win'>");
    numCorrect++;
  } else {
    $winLose.html("<img class='win-lose' src='./assets/images/cross.png' alt='win'>");
    numWrong++;
  }
  questionsAsked++;

  // Pop up a correct or incorrect message
  // The complicated function in the setTimeout is needed because the code
  // was displaying the final results without first showing whether the last
  // question was answered correctly.
  $winLose.show();
  setTimeout( () => { 
    $winLose.hide()
    if (questionsAsked === quizLength) {
      clearInterval(timerId);
      displayResults();
    } else {
      getRandomQuestion();
    }
  }, 1000);
}

// The answer-list listener is where the main loop of the code exists.
// When a click occurs, the next question is displayed
$("#answer-list").click((e) => {
  var id = e.target.id;
  checkAnswer(id);

})

const runGame = () => {
  $timer.html(`<h3>Seconds remaining</h3><h2>${timer}</h2>`);
  timer--;
  if (timer === 0) {
    clearInterval(timerId);
    displayResults();
  }
}

const displayResults = () => {
  resultsVisible();
  var grade = (numCorrect * 100 /questionsAsked).toFixed(0)
  $("#results-title").html("Game Over");
  $("#results-correct").html(`Correct: ${numCorrect}`);
  $("#results-wrong").html(`Missed:  ${numWrong}&nbsp`);
  $("#results-score").html(`Grade: ${grade}%`);
}

const restartQuiz = () => {
  timer=allowedTime;
  questionsAsked = 0;

  introVisible();
}

const startQuiz = () => {
  quizVisible();
  // start time and run the game
  $timer.html(`<h3>Seconds remaining</h3><h2>${allowedTime}</h2>`);
  timerId = setInterval(runGame, 1000);
  getRandomQuestion();
}
