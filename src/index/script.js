document.addEventListener("DOMContentLoaded", () => {
  let body = document.getElementsByTagName("body")[0];
  let header = document.getElementsByTagName("header")[0];
  let main = document.getElementsByTagName("main")[0];

  header.onmouseover = () => { 
    body.classList.add("header"); 
    main.classList.add("hide"); 
  }
  header.onmouseout = () => { 
    body.classList.remove("header"); 
    main.classList.remove("hide"); 
  }

  document.getElementById("light").onmouseover = () => { 
    body.classList.add("light"); 
  }
  document.getElementById("light").onmouseout = () => { 
    body.classList.remove("light"); 
  }

  document.getElementById("roomfinder").onmouseover = () => { 
    body.classList.add("roomfinder");
  }
  document.getElementById("roomfinder").onmouseout = () => { 
    body.classList.remove("roomfinder"); 
  }

  document.getElementById("beep").onmouseover = () => { 
    body.classList.add("beep"); 
  }
  document.getElementById("beep").onmouseout = () => { 
    body.classList.remove("beep"); 
  }
});