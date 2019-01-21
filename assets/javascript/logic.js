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

// Submit button click handler
$("#submit-btn").on("click", function (event) {
  event.preventDefault();

  // Get data from form
  name = $("#name-input").val().trim();
  destination = $("#dest-input").val().trim();
  firstTime = $("#time-input").val().trim();
  frequency = parseInt($("#freq-input").val().trim());

  // If input is invalid don't submit and display modal
  if (name === "" || destination === "" ||
      firstTime === "" || frequency === "" ||
      moment(firstTime, "HH:mm", true).isValid() === false ||
      isNaN(frequency) || frequency <= 0) {
    $("#error-modal").modal();
    return;
  }

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

// Trash can icon click handler
$(document.body).on("click", "#trash-can", function() {

  var key = $(this).attr("data-key");
  console.log("key: " + key);

  // Remove from database
  database.ref().child(key).remove();

  // Remove row from table
  console.log($(this).closest("tr"));
  $(this).closest("tr").remove();
});

// Initial load and listener for database
database.ref().orderByChild("dateAdded").on("child_added", function (childSnap) {

  console.log(childSnap.val().name);
  console.log(childSnap.val().destination);
  console.log(childSnap.val().firstTime);
  console.log(childSnap.val().frequency);

  // Get the time for next train and how many minutes away it is
  var firstTimeConverted = moment(childSnap.val().firstTime, "HH:mm").subtract(1, "years");
  console.log(firstTimeConverted);

  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  console.log("DIFFERENCE IN TIME: " + diffTime);

  var tRemainder = diffTime % childSnap.val().frequency;
  console.log("TIME REMAINING: " + tRemainder);

  var tNextTrain = childSnap.val().frequency - tRemainder;
  console.log("MINUTES TILL TRAIN: " + tNextTrain);

  var nextTrain = moment().add(tNextTrain, "minutes").format("hh:mm A");
  console.log("ARRIVAL TIME: " + nextTrain);

  var newRow = $("<tr>");

  // Create new table row
  newRow.append([
    $("<td>").text(childSnap.val().name),
    $("<td>").text(childSnap.val().destination),
    $("<td>").text(childSnap.val().frequency),
    $("<td>").text(nextTrain),
    $("<td>").text(tNextTrain),
    $("<td>").html("<i class='far fa-trash-alt' id='trash-can' data-key=" + childSnap.key + "></i>")
  ]);

  $("#schedule-table").append(newRow);

}, function (errorObject) {
  console.log("Errors: " + errorObject.code);
});