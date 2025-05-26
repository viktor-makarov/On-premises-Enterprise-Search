


function millisecondsToMidnight(){

  var midnight = new Date();
  midnight.setHours( 24 );
  midnight.setMinutes( 0 );
  midnight.setSeconds( 0 );
  midnight.setMilliseconds( 0 );
  return ( midnight.getTime() - new Date().getTime() );
}




module.exports = {
  millisecondsToMidnight:millisecondsToMidnight
}
