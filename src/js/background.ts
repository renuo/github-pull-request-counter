chrome.alarms.create("Test", { periodInMinutes: 0.5} );

chrome.alarms.onAlarm.addListener(function( alarm ) {
  if (alarm.name === "Test") {
    console.log("SW is working");
  }
});
