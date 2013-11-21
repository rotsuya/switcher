// PeerJS object
var peer = new Peer('switcher1', { key: '2vgt0cd66bikke29', debug: 3, 'iceServers': []});
var existingCalls = {};

peer.on('open', function(){
    console.log('switcher.js: my ID is ' + peer.id);
});

// Receiving a call
peer.on('call', function(call){
    // Wait for stream on the call, then set peer video display
    call.answer();
    call.on('stream', function(stream){
        $('<video  muted="true" autoplay></video>')
            .attr({
                id: call.peer,
                src: URL.createObjectURL(stream)
            })
            .appendTo('#videos');
    });
    window.existingCalls[call.peer] = call;
    call.on('close', function() {
        window.existingCalls[call.peer].close();
        delete window.existingCalls[call.peer];
        streamCount();
        $('#' + call.peer).remove();
    });
    streamCount();
});

peer.on('error', function(err){
    alert(err.message);
});

// Click handlers setup
$(document).on('ready', function(){
    $(document).on('click', 'video', function() {
        var remoteId = $(this).attr('id')
        console.log('switcher.js: remote ID is ' + remoteId);
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
});

function streamCount () {
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
}