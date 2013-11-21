// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

navigator.getUserMedia({
    audio: true,
    video: true
}, function(stream){
    // Set your video displays
    $('#video').attr('src', URL.createObjectURL(stream));
    window.localStream = stream;

    function connect () {
        console.log('camera.js: connecting...');
        window.peer = new Peer({ key: '2vgt0cd66bikke29', debug: 3, 'iceServers': []});

        peer.on('open', function(){
            console.log('camera.js: peer ID is ' + peer.id);

            var mediaConnection;

            window.peerCall = function () {
                console.log('camera.js: calling...');
                mediaConnection = peer.call('switcher1', window.localStream);
                $('html').removeClass('connected disconnected').addClass('connected');
            }

            peerCall();

            window.existingCall = mediaConnection;

            mediaConnection.on('close', function() {
                console.log('camera.js: media connection is closed.');
                $('html').removeClass('connected disconnected').addClass('disconnected');
                setTimeout(peerCall, 10000);
            });

            mediaConnection.on('error', function() {
                console.log('camera.js: media connection error.');
                $('html').removeClass('connected disconnected').addClass('disconnected');
                setTimeout(peerCall, 10000);
            });
        });
    }

    connect();

    peer.on('error', function(err){
        console.log('camera.js: peer error.');
        console.log(err.type);
        $('html').removeClass('connected disconnected').addClass('disconnected');
        if (peer.disconnected) {
            setTimeout(connect, 10000);
        } else {
            setTimeout(peerCall, 10000);
        }
    });

    peer.on('close', function(){
        console.log('camera.js: peer was closed.');
        setTimeout(connect, 10000);
    });

}, function(){
    var message = 'Failed to access the webcam and microphone. '
        + 'Make sure to run this demo on an http server '
        + 'and click allow when asked for permission by the browser.';
    alert(message);
});

// Click handlers setup
$(document).on('ready', function(){
    $(window).on('unload', function(){
        window.existingCall.close();
    });
});
