// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

navigator.getUserMedia({audio: true, video: true}, function(stream){
    // Set your video displays
    $('#video').attr('src', URL.createObjectURL(stream));
    window.localStream = stream;
}, function(){
    alert('Failed to access the webcam and microphone. Make sure to run this demo on an http server and click allow when asked for permission by the browser.');
});

// Click handlers setup
$(document).on('ready', function(){
    $('#end-call').on('click', function(){
        window.existingCall.close();
        step2();
    });

    $('#init-camera').on('click', function() {
        // PeerJS object
        var peer = new Peer({ key: 'peerjs', debug: 3, host: '192.168.1.99', port: '9000'});

        peer.on('open', function(){
            console.log('peer.id: ' + peer.id);
            var call = peer.call('switcher', window.localStream);
            step3(call);
        });

        peer.on('error', function(err){
            alert(err.message);
            // Return to step 2 if error occurs
            step2();
        });

        window.peer = peer;
    });

    // Get things started
});

function step2 () {
    $('html').removeClass('connected disconnected').addClass('disconnected');
}

function step3 (call) {
    // Hang up on an existing call if present
    if (window.existingCall) {
        // window.existingCall.close();
    }

    // UI stuff
    window.existingCall = call;
    $('#their-id').text(call.peer);
    call.on('close', step2);
    $('html').removeClass('connected disconnected').addClass('connected');
}
