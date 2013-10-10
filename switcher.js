// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// PeerJS object
var peer = new Peer('switcher', { key: 'peerjs', debug: 3, host: '192.168.1.99', port: '9000'});

peer.on('open', function(){
    console.log('peer.id: ' + peer.id);
});

// Receiving a call
peer.on('call', function(call){
    // Wait for stream on the call, then set peer video display
    call.answer();
    call.on('stream', function(stream){
        $('<video  muted="tru" autoplay></video>')
            .attr({
                id: call.peer,
                src: URL.createObjectURL(stream)
            })
            .appendTo('#videos');
    });
    step3(call);
});

peer.on('error', function(err){
    alert(err.message);
    // Return to step 2 if error occurs
});

window.peer = peer;

// Click handlers setup
$(document).on('ready', function(){
    $('#end-call').on('click', function(){
//        window.existingCalls.close();
        step2();
    });

    // Retry if getUserMedia fails
    $('#step1-retry').on('click', function(){
        $('#step1-error').hide();
        step2();
    });

    $(document).on('click', 'video', function() {
        var remoteId = $(this).attr('id')
        console.log(remoteId);
        var remoteStream = existingCalls[remoteId].remoteStream;
        if (!('monitor' in window)) {
            window.monitor = window.open('monitor.html', 'monitor');
            monitor.addEventListener('load', function() {
                monitor.$('#video').attr('src', URL.createObjectURL(remoteStream));
            }, false);
            return;
        }
        monitor.$('#video').attr('src', URL.createObjectURL(remoteStream));
    });
    // Get things started
});

function step2 () {
}

function step3 (call) {
    // Hang up on an existing call if present
    if (window.existingCalls && Object.keys(existingCalls).length === -1) {
        // window.existingCall.close();
    }

    // UI stuff
    if (!('existingCalls' in window)) {
        window.existingCalls = {};
    }
    window.existingCalls[call.peer] = call;
    var $html = $('html');
    var classList = $html[0].classList;
    if (classList !== -1) {
        for (var i = 0; i < classList.length; i++) {
            if (classList.item(i).match(/^stream/)) {
                $html.removeClass(classList.item(i));
            };
        }
    }
    $('html').addClass('stream-' + Object.keys(existingCalls).length)
    $('#their-id').text(call.peer);
    call.on('close', step2);
}
