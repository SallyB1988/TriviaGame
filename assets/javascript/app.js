class TriviaData {
  constructor (q, answers, correct) {
    this.question = q;
    this.answers = answers;
    this.correct = correct;
  }
}
// ===== constants ==================================
const data = [
  new TriviaData("How many licks in a tootsie pop?",
  [1, 2, 3, "The world may never know"], 3),
  new TriviaData("What is my name?",
  ["Joan", "Sally", "Mary", "Laura"], 1),
  new TriviaData("What is my husband's name?",
  ["Mark", "Tom", "David", "Bob"], 2),
];
const allowedTime = 15; // time in seconds

// ===== Variables ===================================
var currentAnswer = 0;
var currentIndex = 0;
var numCorrect = 0;
var numWrong = 0;
var isRunning = true;
var timer = allowedTime;
var timerId = null;

// ===== hooks =======================================
const $answerList = $("#answer-list");
const $timer = $("#timer");
const $intro = $("#intro-box");
const $quiz = $("#quiz-box");
const $results = $("#results-box");
const $winLose = $("#win-lose");

window.onload = function() {
  $("#intro-btn").click(startQuiz);
  startQuiz();
};

// In case I want to allow game to restart with new quiz topic
// function introVisible() {
//   $intro.show();
//   $quiz.hide()
//   $results.hide()
// };

function quizVisible() {
  $intro.hide();
  $quiz.show()
  $results.hide()
};

function resultsVisible() {
  $intro.hide();
  $quiz.hide()
  $results.show()
};

/**
 * Take question data and populate the quiz card
 * @param {*} q 
 */
const displayQuestion = (q) => {
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
    $winLose.html("<img class='win-lose' src='./assets/images/correct.jpg' alt='win'>");
    numCorrect++;
  } else {
    $winLose.html("<img class='win-lose' src='./assets/images/incorrect.jpg' alt='win'>");
    numWrong++;
  }
  currentIndex++;

  // Pop up a correct or incorrect message
  // The complicated function in the setTimeout is needed because the code
  // was displaying the final results without first showing whether the last
  // question was answered correctly.
  $winLose.show();
  setTimeout( () => { 
    $winLose.hide()
    if (currentIndex === data.length) {
      clearInterval(timerId);
      displayResults();
    } else {
      displayQuestion(data[currentIndex]);
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
  timer--;
  $timer.html(`<h2>${timer}</h2>`);
  if (timer === 0) {
    clearInterval(timerId);
    displayResults();
  }
}

const displayResults = () => {
  resultsVisible();
  var grade = (numCorrect * 100 /data.length).toFixed(2)
  $("#results-title").html("Game Over");
  $("#results-correct").html(`Correct: ${numCorrect}`);
  $("#results-wrong").html(`Wrong:  ${numWrong}`);
  $("#results-score").html(`Grade: ${grade}%`);

}

// const endGame = () => {
//   $("#status-box").html('<h1>Game Over</h1>');
// }

const startQuiz = () => {
  console.log('starting quiz')
  quizVisible();
  // start time and run the game
  $timer.html(`<h2>${timer}</h2>`)
  timerId = setInterval(runGame, 1000);
}

displayQuestion(data[0]);