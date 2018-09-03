const copy = require('copy-text-to-clipboard');

function showToast(text){
  let toast = document.createElement("div");
  toast.classList += "toast";
  toast.innerHTML = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.parentNode.removeChild(toast), 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  Array.prototype.forEach.call(
    document.getElementById('container').children, 
    child => {
      child.onclick = e => {
        copy(e.target.innerText);
        showToast("Copied " + e.target.id + "!");
      }
  });
});