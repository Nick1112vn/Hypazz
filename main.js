const socket = io("https://hypazzbackend.onrender.com");
    window.runnedScripts=[]
    window._scripts={}
    let roomId = '';
    function fitTextToOwnHeight(e,per,pad) {
  function update() {
    const elements=document.querySelectorAll(e);
    elements.forEach((element)=>{
      if(element.offsetHeight){
    const height = element.offsetHeight*per;
    element.style.fontSize = height + 'px';
    element.style.paddingLeft = element.offsetHeight*pad.left + 'px';
    element.style.paddingRight = element.offsetHeight*pad.right + 'px';
    element.style.paddingTop = element.offsetHeight*pad.top + 'px';
    element.style.paddingBottom = element.offsetHeight*pad.bottom + 'px';
    element.style.lineHeight = element.offsetHeight + 'px';
    //element.style.lineHeight = height + 'px';
      }
    })
  }
  update();
  window.addEventListener('resize', update);
}
    function createRoom() {
      roomId = document.getElementById('roomId').value;
      socket.emit('createRoom', document.getElementById('name').value);
    }

    function joinRoom() {
      document.getElementById('roomjoin').style.visibility="visible"
      document.getElementById('info').style.visibility="hidden"
    }
    function exitJoining() {
      document.getElementById('roomjoin').style.visibility="hidden"
      document.getElementById('info').style.visibility="visible"
    }
    function joinRoom1() {
      roomId = document.getElementById('roomId').value;
      socket.emit('joinRoom', roomId,document.getElementById('name').value);
    }
    socket.on('setupStatus', (status,side) => {
      
      loadPage('./pages/game');
      
    })
    socket.on('disconnect', async (reason) => {
      
      await loadPage('./');
      createAnnouncementUI( "System", "You are disconnected",'error' ,  3000 )
      //socket.removeAllListeners();
    });
    document.getElementById('currentRoom').style.visibility="hidden"
    socket.on('roomJoined', (room) => {
      localStorage.setItem("name",document.getElementById('name').value);
      document.getElementById('currentRoom').textContent = 'Room: ' + room;
       document.getElementById('currentRoom').style.visibility="visible"
        document.getElementById('info').style.visibility="hidden"
    });
    async function  loadPage(page) {
  await fetch(page+"/index.html")
    .then(res => res.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const doc1 = parser.parseFromString(html, 'text/html');
      doc.body.querySelectorAll('script').forEach(script => script.remove());
      window.runnedScripts=window.runnedScripts.concat(Array.from(document.scripts).map(item=>{return{textContent:item.textContent,src:item.src}}));
      console.log(window.runnedScripts)
      // Cập nhật body
      document.body.id = doc.body.id;
      document.body.innerHTML = doc.body.innerHTML;

      // Tìm và thực thi các script
      
      const scripts = doc1.body.querySelectorAll('script');
      
      scripts.forEach(oldScript => {
        let isAlreadyExists = false;

        if (oldScript.src) {
          // Kiểm tra script có src đã tồn tại trong document chưa
          isAlreadyExists = window.runnedScripts.some(
            s => s.src === oldScript.src
          );
        } else {
          // Kiểm tra script inline có nội dung giống nhau chưa
          isAlreadyExists = window.runnedScripts.some(
            s => s.textContent === oldScript.textContent
          );
        }

        if (!isAlreadyExists) {
          const newScript = document.createElement('script');
          if (oldScript.src) {
            newScript.src = oldScript.src;
          } else {
            newScript.textContent = oldScript.textContent;
          }
          document.body.appendChild(newScript);
        }
        else{
          if (oldScript.src) {
            //newScript.src = oldScript.src;
            if(oldScript.src.includes(page.replace(/\./g, '')))window._scripts[oldScript.src]?.start?.();
          }
        }
      });
    });
}

    socket.on('userJoined', (id) => {
      addMsg(`User ${id} joined the room`);
    });

    socket.on('receiveMessage', ({ id, message }) => {
      addMsg(`${id}: ${message}`);
    });

    socket.on('errorMsg', (msg) => {
      createAnnouncementUI( "System", msg,'error' ,  3000 )
    });
    socket.on('connect_error', async (err) => {
      if(err!='You are already connected in another tab.')return
      if (document.body.id!="webBody")await loadPage('./');
      document.getElementById('connectError').style.visibility="visible";
      console.log('Lỗi kết nối: ', err);
    });
    function sendMsg() {
      const message = document.getElementById('msg').value;
      if (message && roomId) {
        socket.emit('sendMessage', { roomId, message });
        addMsg(`You: ${message}`);
        document.getElementById('msg').value = '';
      }
    }

    function addMsg(text) {
      const li = document.createElement('li');
      li.textContent = text;
      document.getElementById('messages').appendChild(li);
    }
    
window._scripts[document.currentScript.src] = {
    start: function() {
      document.getElementById('name').value=localStorage.getItem("name")
      fitTextToOwnHeight("#info > input ",0.6,{});
      fitTextToOwnHeight("#info button",0.6,{});
      fitTextToOwnHeight("#info h2",1,{});
      fitTextToOwnHeight("#currentRoom",1,{});
      fitTextToOwnHeight("#roomjoin > input ",0.6,{});
      fitTextToOwnHeight("#roomjoin button",0.6,{});
      fitTextToOwnHeight("#connectError",0.05,{});
      
    }}
    window._scripts[document.currentScript.src]?.start?.();