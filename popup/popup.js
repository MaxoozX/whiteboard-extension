const button = document.querySelector('#menu > button:first-child');

const colorPickerLabel = document.querySelector("#color-picker-label");
const colorPicker = document.querySelector('#color-picker');

const sizePickerLabel = document.querySelector("#size-picker-label");
const sizePicker = document.querySelector("#size-picker");
const sizeDisplay = document.querySelector("#size-display");

const pencilIcon = document.querySelector("#pencil-label");
const rubberIcon = document.querySelector("#rubber-label");
const crossIcon = document.querySelector("#clear-label");

const isActiveCheckbox = document.querySelector("#is-active-checkbox");

const passMessage = (data, callback) => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, data, callback);
  });
};

const setExtensionState = newState => {
  chrome.storage.sync.set({"state": newState}, function() {
    passMessage({
      command: 'set-state',
      state: newState,
    });
  });
}

const getExtensionState = func => {
  chrome.storage.sync.get("state", func);
}

getExtensionState(value => {
  isActiveCheckbox.checked = value.state;
})

colorPicker.addEventListener('change', e => {
  colorPickerLabel.style.backgroundColor = colorPicker.value;
  passMessage({
    command: 'change-color',
    color: colorPicker.value,
  });
});

sizePicker.addEventListener('change', e => {
  sizeDisplay.innerText = sizePicker.value;
  passMessage({
    command: 'change-size',
    width: sizePicker.value,
  })
});

crossIcon.addEventListener('click', e => {
  passMessage({
    command: 'clear-screen',
  })
});

pencilIcon.addEventListener('click', e => {
  passMessage({
    command: 'tool-pencil',
  })
});

rubberIcon.addEventListener('click', e => {
  passMessage({
    command: 'tool-rubber',
  });
});

isActiveCheckbox.addEventListener('change', e => {
  setExtensionState(isActiveCheckbox.checked);
});

chrome.storage.sync.get(["default-color", "default-size"], res => {
  passMessage({
    command: 'change-color',
    color: res["default-color"],
  });
  colorPickerLabel.style.backgroundColor = res["default-color"];
  colorPicker.value = res["default-color"];
  passMessage({
    command: 'change-size',
    width: res["default-size"],
  });
  sizeDisplay.innerText = res["default-size"];
  sizePicker.value = res["default-size"];
});
