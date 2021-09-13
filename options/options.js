const colorPicker = document.querySelector("#color-picker");
const sizePicker = document.querySelector("#size-picker");
const sizeDisplay = document.querySelector("#size-display");

chrome.storage.sync.get(["default-color", "default-size"], res => {
  console.log(res);
  colorPicker.value = res["default-color"];
  sizePicker.value = res["default-size"];
  sizeDisplay.innerText = res["default-size"];
});

colorPicker.addEventListener("change", event => {
  chrome.storage.sync.set({"default-color": colorPicker.value}, ()=>{});
});

sizePicker.addEventListener("change", event => {
  chrome.storage.sync.set({"default-size": sizePicker.value}, ()=>{sizeDisplay.innerText = sizePicker.value});
});
