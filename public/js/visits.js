
document.querySelector("button").addEventListener("click",count);

var attempts = new Date();

function count(){

  var hour = new Date().getHours();
  var minute = new Date().getMinutes();

  //say = good morning if before 12 pm
  if (hour < 12){
  document.querySelector("#welcomeMsg").innerHTML= `Good Morning`;
     document.querySelector("#welcomeMsg").style.color = "green";
}
    //good afternoon if before 4pm
    else if(hour < 16){
  document.querySelector("#welcomeMsg").innerHTML= `Good Afternoon`;
     document.querySelector("#welcomeMsg").style.color = "orange";
} 
      //if not afternoon or morning say good evening say good evening
  else {
  document.querySelector("#welcomeMsg").innerHTML= `Good Evening`;
     document.querySelector("#welcomeMsg").style.color = "red";
}

}