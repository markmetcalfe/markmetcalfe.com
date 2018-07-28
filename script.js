function setup(){
    var body = document.getElementsByTagName("body")[0];
    var header = document.getElementsByTagName("header")[0];
    var main = document.getElementsByTagName("main")[0];
    header.onmouseover = function() { body.classList.add("header"); main.classList.add("hide"); }
    header.onmouseout = function() { body.classList.remove("header"); main.classList.remove("hide"); }
    document.getElementById("light").onmouseover = function() { body.classList.add("light"); }
    document.getElementById("light").onmouseout = function() { body.classList.remove("light"); }
    document.getElementById("beep").onmouseover = function() { body.classList.add("beep"); }
    document.getElementById("beep").onmouseout = function() { body.classList.remove("beep"); }
    document.getElementById("trademe").onmouseover = function() { body.classList.add("trademe"); }
    document.getElementById("trademe").onmouseout = function() { body.classList.remove("trademe"); }
    // document.getElementById("bitcoin").onmouseover = function() { body.classList.add("bitcoin"); }
    // document.getElementById("bitcoin").onmouseout = function() { body.classList.remove("bitcoin"); }
}
window.onload = setup;