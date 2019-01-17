const connection = require("connection");

const wifi_config = connection.wifi[0];

const DEVICE = "sonoff";

var LED = D13;
var RELAY = D12;
//var BTN = D0;

var mqtt;
var wifi;

var wifiIsConnected = false;


function mqttConnect() {
    console.log("MQTT: Connecting...");
    mqtt = require("MQTT").connect({
        host: connection.mqtt.host,
        port: connection.mqtt.options.port,
        username: connection.mqtt.options.username,
        password: connection.mqtt.options.password,
    });
    mqtt.on('connected', function() {
        console.log("MQTT: Connected");
        setTimeout(function() {
            mqtt.subscribe(DEVICE + "/setState");
        }, 1000);
    });
    mqtt.on('error', function(message) {
        console.log('Error', message);
    });
    mqtt.on('publish', mqttMessage);
}

function mqttMessage(pub) {
    console.log("MQTT=> ", pub.topic, pub.message);

    setState(pub.message);
}

function setState(state) {
    RELAY.write(state === "on" ? 1 : 0);
    LED.write(state === "on" ? 0 : 1);
    mqtt.publish(DEVICE + "/state", state === "on" ? "on" : "off", {retain: true});
}

function onInit() {
    setInterval(function() {
        if (!mqtt) return;
        if(!wifiIsConnected) {
            connectToWifi();
        }
        else if (!mqtt.connected) {
            console.log("MQTT: Disconnected");
            mqtt.connect();
        }
    }, 60*1000);

    wifi = require("Wifi");
    wifi.on('connected',function() {
        wifiIsConnected = true;
        console.log("WiFi: Connected");
        mqttConnect();
    });
    wifi.on('disconnected',function() {
        wifiIsConnected = false;
        console.log("WiFi: Disconnected");
    });
    wifi.setHostname("sonoff");
    wifi.stopAP();

    connectToWifi();
}

function connectToWifi() {
    console.log("WiFi: Connecting...");
    wifi.connect(wifi_config.name, wifi_config.options, function(err) {
        if(err) {
            console.log("Wifi: Connection error - ", err);
            wifi.disconnect();
        }
    });
}
