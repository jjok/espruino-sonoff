
const LED = D13;

const ON  = 0;
const OFF = 1;

let interval = null;

function startFlashing() {
    let state = OFF;

    interval = setInterval(function() {
        state = state === ON ? OFF : ON;
        LED.write(state);
    }, 250);
}

function stopFlashing() {
    clearInterval(interval);
    interval = null;
    LED.write(OFF);
}

exports = {
    "start": startFlashing,
    "stop": stopFlashing,
};
