/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
//Landscape vs Portrait
window.onload = init;

//Initialize the app
function init() {
    console.log("Setting up");
    app.initialize();
}

var app = {

    data: {
        id: 123,
        status: []
    },
    // Application Constructor
    initialize: function () {
        console.log("initializing...");
        this.bindEvents();
        this.initFirstScreen();
        this.setupAppRegistrations();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
        window.screen.mozLockOrientation('portrait-primary');
    },

    showHowWasYourDay: function(){
        $('#initial-setup').hide();
        $('#login').hide();
        $('#createUser').hide();

        app.isThereAnyEntryForToday( app.currentTime()) 

        
    },

    currentTime: function(){
        var tempTime = moment()
        return moment(new Date(tempTime.year(), tempTime.month(), tempTime.date()));
    },

    isThereAnyEntryForToday: function(date){
        return localforage.getItem('app', function(data){
            console.log('app returned', data)
            if(data === undefined || data === null){
                console.log('app has nothing stored for this user')
                return;
            }
            var days = JSON.parse(data).data.status;
            
            _.each(days, function(day){
                
                if(moment(day.date).isSame(date, 'day')){
                
                    $('#alreadyFilledInToday').show();
                    return true;
                } else {
                    $('#howWasYourDay').show();
                    return false;
                }
            })
        })
    },

    //Check to see if the user exists or not
    initFirstScreen: function(){
        localforage.getItem('user', function(user){
            console.log('user is ', user);
            if(user){
                $('#initial-setup').hide();
                $('#login').hide();
                $('#createUser').hide();
                $('#howWasYourDay').hide();
                $('#alreadyFilledInToday').hide();
                app.showHowWasYourDay();
            } else {
                $('#login').hide();
                $('#createUser').hide();
                $('#howWasYourDay').hide();
            }
            
            $('#initial-setup .createUser').click(function(e){       
                $('#initial-setup').fadeOut('slow', function(){
                    $('#createUser').show();
                })
            });
            
            $('#createUser button').click(function(){
                app.createUser();
            })

            $('#initial-setup .login').click(function(e){       
                $('#initial-setup').fadeOut('slow', function(){
                    $('#login').show();
                })
            });

            $('#howWasYourDay button').click(function(e){
                //disable button                
                var value = $(e.target).data('value');
                app.logHowTheUsersDayWas(value)                
            })
        });
    },

    //creates a user 
    createUser: function(){
        var user ={
            name: $('#createUser .name').val(),
            email: $('#createUser .email-address').val(),
            password: $('#createUser .password').val()
        }

        localforage.setItem('user', user)
        //send off to remote server
    },

    loginUserIn: function(){
        var user = {
            email: $('#login .email-address').val(),
            password: $('#login .password').val()   
            //check and send to remote server and pull back all the data to the device
        }
    },

    logHowTheUsersDayWas: function(betterThanYesterday){
        var length =app.data.status.length 
        var updatedValue = 0
        if(length > 0){
            updatedValue = app.data.status[length-1].betterThanYesterday;
        }

        var day = {
            date: new Date().getTime(),
            betterThanYesterday: updatedValue + betterThanYesterday
        }
        app.data.status.push(day);        
        console.log('data is', app.data.status)
        localforage.setItem('app', JSON.stringify(app)).then(function(){console.log('data has been set')})
    },

    setupAppRegistrations:function () {

             // Issue a register() call
             // to register to listen for a notification,
             // you simply call push.register
             // Here, we'll register a channel for "email" updates.
             // Channels can be for anything the app would like to get notifications for.

             if(navigator.push !== undefined){
                var reqEmail = navigator.push.register();
                 reqEmail.onsuccess = function(e) {
                   emailEndpoint = e.target.result;
                   //storeOnAppServer("email", emailEndpoint); // This is the "Hand wavey" way that the App 
                   console.log('end point we want to curl to', emailEndpoint);
                                                                // sends the endPoint back to the AppServer
                 }

                 // Once we've registered, the AppServer can send version pings to the EndPoint.
                // This will trigger a 'push' message to be sent to this handler.
                navigator.mozSetMessageHandler('push', function(message) {
                    console.log('we have received a message', new Date().getTime(),  message)


                    //http://chrislord.net/index.php/2013/05/04/writing-and-deploying-a-small-firefox-os-application/
                    //https://developer.mozilla.org/en/docs/Web/API/notification
                    var notification = new Notification("How was your day?");
                    notification.onclick = function () {
                        navigator.mozApps.getSelf().onsuccess = function(evt) {
                            var app = evt.target.result;
                            app.launch();
                            
                        };
                    };
                    notification.show();
                });
                
             }
    },





    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var currY = 0;
        var currY = 0;
        var dX = 0;
        var dY = 0;
        var watchIDAccel = null;
        var watchID = null;
        var globe = null;
        var frameID = null;
        var deviceEAdded = false;
        //Utility function for request animation
        var requestAnimationFrame = (function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
        })();
        //Utility function to cancel animation
        var cancelAnimationFrame = (function () {
            return window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        })();
        // Flip the screen to show the contents of a demo. The header
        // will display `title` as the title
        function flipDemo(title) {
            var flipbox = document.querySelector('x-flipbox');
            var appbar = document.querySelector('x-appbar');
            var back = appbar.querySelector('.back');
            var backside = flipbox.querySelector('div:last-child');

            backside.innerHTML = '';
            back.classList.add('open');
            appbar.heading = title;
            flipbox.showBack();
        }

        // Flip the screen back to show the main navigation
        function flipMain() {
            var flipbox = document.querySelector('x-flipbox');
            var appbar = document.querySelector('x-appbar');
            var back = appbar.querySelector('.back');
            var backside = flipbox.querySelector('div:last-child');
            flipbox.showFront();

            back.classList.remove('open');
            appbar.heading = 'Cordova <3 Firefox OS';
        }

        



        // The "back" button will appear in the header on the demo
        // pages. Make it flip back to the navigation and clear any
        // events when touched.
        document.querySelector('x-appbar .back').addEventListener('click', function () {
            flipMain();

            if (frameID != null) {
                cancelAnimationFrame(frameID);
                frameID = null;
            }
            if (watchID) {
                navigator.compass.clearWatch(watchID);
                watchID = null;
            }
            if (watchIDAccel) {
                navigator.accelerometer.clearWatch(watchIDAccel);
                watchIDAccel = null;
            }
            //If the webgl globe is created stop the animation
            if (globe) {
                globe.stop();
                globe = null;
            }
            if (deviceEAdded) {
                window.removeEventListener('deviceorientation', deviceOrientationEvent);
                deviceEAdded = false;
            }

        });

        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);

        
        //Test the Notification API
        function runPro() {
            function onPrompt(results) {
                alert("You selected button number " + results.buttonIndex + " and entered " + results.input1);
            }
            navigator.notification.vibrate(500);
            navigator.notification.prompt(
                'Enter Name', // message
                onPrompt, // callback to invoke
                'Prompt Test', // title
                ['Ok', 'Exit'], // buttonLabels
                'Doe, Jane' // defaultText
            );

        }        
    }
};