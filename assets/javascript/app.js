class TriviaData {
  constructor (q, answers, correct, image=null) {
    this.question = q;
    this.answers = answers;
    this.correct = correct; // index of the correct answer
    this.image = image;
  }
}
// ===== constants ==================================
// stateData is the set of questions I came up with.  All other data sets
// come from the Open Trivia API (https://opentdb.com/api_config.php)
const stateData = [
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

var data = [];
const allowedTime =120; // time in seconds
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
const $topic = $("#topic");

window.onload = function() {
  data = stateData.slice(0);
  introVisible();
  $("#instructions").html(`Answer ${quizLength} trivia questions in ${(allowedTime/60).toFixed(1)} minutes!`);
  $("#intro-btn").click(startQuiz);
  $("#results-btn").click(restartQuiz);
};

/**
 * Makes Ajax call to trivia database API to gather information for questions.
 * @param {*} t 
 */
const getAPIdata = (t) => {
  var queryURL;

  switch (t) {
    case 'science':
      queryURL = 'https://opentdb.com/api.php?amount=10&category=17&difficulty=easy';
      break;
      case 'general knowledge' :
      queryURL = 'https://opentdb.com/api.php?amount=10&category=9&difficulty=easy';
      break;
      case 'board games' :
      queryURL = 'https://opentdb.com/api.php?amount=10&category=16&difficulty=easy';
      break;
      case 'math' :
      queryURL = 'https://opentdb.com/api.php?amount=10&category=19&difficulty=easy';
      break;
    default:
      alert('Error in API callerror');
  }

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function(response) { 
    data = [];
    response.results.forEach((o) => {
      const correct_index = Math.floor(Math.random() * (o.incorrect_answers.length + 1));
      var answers = genAnswerArray(o.correct_answer, correct_index, o.incorrect_answers);
      data.push(new TriviaData(o.question, answers, correct_index));
    })
  })
}

// Takes answer data gathered from the database and places it into an array. The correct
// answer is placed at the index specified by ans_index
const genAnswerArray = (ans_correct, ans_index, ans_incorrect) => {
  var ans_array = [];
  const arrlength = ans_incorrect.length + 1; // length of answer array that will be generated
  for (var i=0; i< arrlength; i++) {
    if (i === ans_index) {
      ans_array.push(ans_correct);
    } else {
      ans_array.push(ans_incorrect.pop());
    }
  }
  return ans_array;
}

// Make only introduction div visible
function introVisible() {
  $intro.show();
  $quiz.hide();
  $results.hide()
};

// Make only the quiz div visible
function quizVisible() {
  $intro.hide();
  $quiz.show();
  $results.hide();
};

// Make only the results div visible
function resultsVisible() {
  $intro.hide();
  $quiz.hide();
  $results.show();
};

// When a topic is selected from the dropdown menu, fill the 'data' array
$(".dropdown-item").click((e) => {
  const subject = e.target.value;
  $("#topic").html(subject);
  if (subject === "state trivia" ) {
    data = stateData.slice(0);
  } else {
    getAPIdata(e.target.value);
  }
})

// Select a random question from the array so the questions don't always appear in the
// same order. This is really only important for
// the state trivia subject. The questions from the trivia API are already random.
const getRandomQuestion = () => {
  var randIndex = Math.floor(Math.random() * data.length);
  displayQuestion(data[randIndex]);
  data.splice(randIndex,1);
}

/**
 * Populate the quiz card elements with the question data
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
 * Given the id of the clicked answer:
 *    check to see if the answer is correct
 *    display the correct or incorrect image for 1 second
 *    get the next question (or end the quiz)
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

// When a click occurs, check the answer the next question is displayed
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
