const videoGrid = document.getElementById('video_grid')
const myVideo = document.createElement('video')
myVideo.muted = true
const socket = io('/')
const peer = new Peer(undefined, { //undefined je id klijenta koji ce peer server sam da generise
    host: '/',
    port: '443'
})

const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio:true
}).then(stream => {
    addVideo(myVideo, stream)

    peer.on('call', call => {
        call.answer(stream)
        const newVideoObject = document.createElement('video')
        call.on('stream', newUserStream => {
            addVideo(newVideoObject, newUserStream)
        })
    })

    socket.on('user-connected', userId => {
        newUserConnected(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})


peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function newUserConnected(userId, stream) {
    const call = peer.call(userId, stream)
    const newVideoObject = document.createElement('video')
    call.on('stream', newUserStream => {
        addVideo(newVideoObject, newUserStream)
    })
    call.on('close', () => {
        newVideoObject.remove()
    })
    peers[userId] = call
}

function addVideo(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () =>{
        video.play()
    })
    videoGrid.append(video)
}

let msg = $('input')


$('html').on('keypress', function (e) {
    if(e.which == 13 && msg.val().length !==0) {
        console.log(msg.val())
        socket.emit('message', msg.val())
        msg.val('')
    }
})

socket.on('createMessage', message => {
    $('.messages').append(`<li class='message'><b>User</b><br/>${message}</li>`)
    scrollY()
})

function scrollY() {
    let chatWindow = document.querySelector('.chat_window')
    chatWindow.scrollTop = chatWindow.scrollHeight
}

