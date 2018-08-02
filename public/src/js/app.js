var defferredPromptEvent;
if(!window.Promise){
    window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js") //,{scope:'/help/'}
    .then(() => {
      console.log("service worker registered");
    });
}

window.addEventListener("beforeinstallprompt", evnt => {
  console.log("Before beforeinstallprompt");
  event.preventDefault();
  defferredPromptEvent = event;
  return false;
});

// old way:
// var xhr = new XMLHttpRequest();
// xhr.open('GET','http://httpbin.org/ip');
// xhr.responseType = 'json';
// xhr.onload = ()=>{
//  console.log(xhr.response);
// }
// xhr.onerror = ()=>{
//     console.log('Error!!');
// }
// xhr.send();

fetch("http://httpbin.org/ip")
  .then(r => {
    console.log(r);
    return r.json();
  })
  .then(data => console.log(data))
  .catch(ex => console.log(ex));

fetch("http://httpbin.org/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
  mode:'cors', //'no-cors' 
  body: JSON.stringify({ test: "test" })
})
  .then(r => {
    console.log(r);
    return r.json();
  })
  .then(data => console.log(data))
  .catch(ex => console.log(ex));
