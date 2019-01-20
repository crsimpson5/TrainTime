// Initialize Firebase
var config = {
  apiKey: "AIzaSyCr_mkK7124FTl8bhEPoeVyDuaEZ8TX0ac",
  authDomain: "train-time-3128e.firebaseapp.com",
  databaseURL: "https://train-time-3128e.firebaseio.com",
  projectId: "train-time-3128e",
  storageBucket: "train-time-3128e.appspot.com",
  messagingSenderId: "11876068987"
};

firebase.initializeApp(config);

var database = firebase.database();

var name = "";
var destination = "";
var firstTime = "";
var frequency = 0;

$("#submit-btn").on("click", function (event) {
  event.preventDefault();

  name = $("#name-input").val().trim();
  destination = $("#dest-input").val().trim();
  firstTime = $("#time-input").val().trim();
  frequency = parseInt($("#freq-input").val().trim());

  if (name === "" || destination === "" ||
    firstTime === "" || frequency === "") return;

  $("#name-input").val("");
  $("#dest-input").val("");
  $("#time-input").val("");
  $("#freq-input").val("");

  database.ref().push({
    name: name,
    destination: destination,
    firstTime: firstTime,
    frequency: frequency,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });
});

database.ref().orderByChild("dateAdded").on("child_added", function (childSnap) {

  console.log(childSnap.val().name);
  console.log(childSnap.val().destination);
  console.log(childSnap.val().firstTime);
  console.log(childSnap.val().frequency);

  var firstTimeConverted = moment(childSnap.val().firstTime, "HH:mm").subtract(1, "years");
  console.log(firstTimeConverted);

  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  console.log("DIFFERENCE IN TIME: " + diffTime);

  var tRemainder = diffTime % childSnap.val().frequency;
  console.log(tRemainder);

  var tNextTrain = childSnap.val().frequency - tRemainder;
  console.log("MINUTES TILL TRAIN: " + tNextTrain);

  var nextTrain = moment().add(tNextTrain, "minutes").format("hh:mm A");
  console.log("ARRIVAL TIME: " + nextTrain);

  var newRow = $("<tr>");

  newRow.append([
    $("<td>").text(childSnap.val().name),
    $("<td>").text(childSnap.val().destination),
    $("<td>").text(childSnap.val().frequency),
    $("<td>").text(nextTrain),
    $("<td>").text(tNextTrain)
  ]);

  $("#schedule-table").append(newRow);

}, function (errorObject) {
  console.log("Errors: " + errorObject.code);
});