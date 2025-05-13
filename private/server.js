const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const socketRateLimiter = require("@d3vision/socket.io-rate-limiter");
const cors = require('cors'); 
const app = express();
app.use(cors({
    origin: '*',  // Cho phép tất cả các domain kết nối
  }));
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*", // Cho phép tất cả các origin
        methods: ["GET", "POST"]
    }
});

const crypto = require('crypto');
const setupPlayers=require('./setupPlayers');
const Status={}
const { Worker } = require('worker_threads');
const path = require('path');
function generateRoomId() {
  return crypto.randomBytes(3).toString('hex'); // VD: "f3a9d1"
}
function generateUniqueRoomId() {
    let roomId;
    do {
      roomId = generateRoomId();
    } while (io.sockets.adapter.rooms.get(roomId)); // Lặp lại nếu phòng đã tồn tại
    return roomId;
  }
  function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }
  function normalizeVector(v) {
    const len = Math.hypot(v.x, v.y);
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
  }
  const simulateMovements = require('./simulateMovements');
  function StatusCalculation(cstatus){
    const actions=cstatus.actions
    let moveProperty=[];
    let dis={value:15,position:cstatus.currentStatus["ball"].position,speed:cstatus.currentStatus["ball"].speed};
    const arr=Object.entries(actions).map(([key, value]) => ({ id: key, value }));
arr.sort((a, b) => {
    if (cstatus.currentStatus["ball"].position.x < 100 &&cstatus.sides[a.id]=="a") return 1;
    if (cstatus.currentStatus["ball"].position.x < 100 &&cstatus.sides[a.id]=="b") return -1;
    if (cstatus.currentStatus["ball"].position.x > 100 &&cstatus.sides[a.id]=="a") return -1;
    if (cstatus.currentStatus["ball"].position.x > 100 &&cstatus.sides[a.id]=="b") return 1;
    return 0; // giữ nguyên nếu cả hai giống nhau
  }).forEach((socketPlr)=>{
    //console.log(socketPlr.value)
    moveProperty=moveProperty.concat(socketPlr.value.map(action => {
        
if(action.action=="pass"||action.action=="shoot"){
    const d=distance(cstatus.currentStatus[cstatus.sides[socketPlr.id]+action.id].position,cstatus.currentStatus['ball'].position)
    if(dis.value+0.1+1e-6>d){
        const pos=cstatus.currentStatus[cstatus.sides[socketPlr.id]+action.id].position
        
        const dir = {
            x: action.position.x - pos.x,
            y: action.position.y - pos.y
          };
          const unit = normalizeVector(dir);
          const caPos={x:pos.x+unit.x * d,y:pos.y+unit.y * d};
          if(Object.entries(cstatus.currentStatus).map(([key, value]) => ({ id: key, ...value })).filter((item)=>{
            //console.log(distance(item.position,cstatus.currentStatus["ball"].position))
            if(distance(item.position,caPos)>=10-1e-6||item.id=="ball")return false
            return true
          }).length<=0){cstatus.currentStatus["ball"].position=caPos;
            
if(action.action=="shoot"){dis={value:d,position:{x:pos.x+unit.x * 1000,y:pos.y+unit.y * 1000},speed:0.0025}}
 else       dis={value:d,position:action.position,speed:0.001}}}
    return;}
    return {id:cstatus.sides[socketPlr.id]+action.id,position:cstatus.currentStatus[cstatus.sides[socketPlr.id]+action.id].position,target:action.position,step:cstatus.currentStatus[cstatus.sides[socketPlr.id]+action.id].speed};
  }).filter(item => item != null));
})

moveProperty.push({id:"ball",position:cstatus.currentStatus["ball"].position,target:dis.position,step:dis.speed});

const a1=Object.entries(cstatus.currentStatus).map(([key, value]) => ({ id: key, ...value })).map(action => {
     
        return {id:action.id,position:action.position,target:action.position,step:action.speed};
      })
      const result = a1.filter(item => !moveProperty.map((v) => v.id).includes(item.id));
      moveProperty=moveProperty.concat(result);
const calculatedPos=simulateMovements(moveProperty,0.1,5)
const ballpos= cstatus.currentStatus["ball"].position
calculatedPos.forEach((item)=>{
    cstatus.currentStatus[item.id].position=item.position
})
//console.log(moveProperty);
//console.log(cstatus.currentStatus);
const ar1=calculatedPos.map(item => {

    return {id:item.id,status:"move",position:item.position,speed:item.step};
  })
  ar1.unshift({id:"ball",status:"set",position:ballpos})
return ar1
  };

  function roundDone(roomId){
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room)return;
    
    for (const socketId of room) {
      
      Status[roomId].isReady[socketId]=true
    }
    const { timeout, ...newObj } = Status[roomId];
    
    //const a=StatusCalculation(Status[roomId]);
    const worker = new Worker(path.join(__dirname,'./StatusCalculation.js'), {
        workerData: { status:newObj } // truyền object vào đây
      });
      
      worker.on('message', ({
        calculatedPos,
        ar1,
        shooter
      }) => {
        if(!Status[roomId])return;
        //console.log(moveProperty);
        //console.log(cstatus.currentStatus);
        let maxT=0;
          calculatedPos.forEach((item)=>{
            const d=distance(Status[roomId].currentStatus[item.id].position,item.position)
            if(maxT<d)maxT=d/(200000*Status[roomId].currentStatus[item.id].speed);
            Status[roomId].currentStatus[item.id].position=item.position
        })
        const ballPosX=Status[roomId].currentStatus["ball"].position.x;
        let w = ballPosX<-5||ballPosX>205 ? 10000+maxT*1000+200 : maxT*1000+200;
            if(ballPosX<-5||ballPosX>205&&Status[roomId].currentStatus[shooter]&&!Status[roomId].currentStatus[shooter].canCelebrate)w=maxT*1000+3200;
        for (const socketId of room) {
            const socket = io.sockets.sockets.get(socketId);
            
            if (socket) {
              socket.emit('updateStatus', ar1,Status[roomId].sides[socketId],Date.now(),w);
            }
          }
          
          
            
            
            
            
        setTimeout(()=>{
          
          if(ballPosX<-5||ballPosX>205){
            Status[roomId].currentStatus=JSON.parse(JSON.stringify(setupPlayers))
            if(ballPosX<-5){
                Status[roomId].currentStatus["a1"].position.x=90;
                Status[roomId].scores[Object.entries(Status[roomId].sides).filter(([id,value])=>{return value=="b"})[0][0]]+=1;
            }
        else {
            Status[roomId].currentStatus["b1"].position.x=110;
            Status[roomId].scores[Object.entries(Status[roomId].sides).filter(([id,value])=>{return value=="a"})[0][0]]+=1;}
            
            
            const arr=Object.entries(Status[roomId].currentStatus).map(([key, value]) => ({ id: key, value })).map(item => {

                return {id:item.id,status:"set",position:item.value.position};
              })
            io.to(roomId).emit("scores",Object.entries(Status[roomId].scores).map(([key, value]) =>{
return  {score:value,side:Status[roomId].sides[key]}
            }),arr);
        }
          Status[roomId].actions={};
          Status[roomId].sentTimes={};
          Status[roomId].isReady={};
          
          if(Status[roomId].round==20){
            const side=Object.entries(Status[roomId].sides)
            const a=side.filter(([id,value])=>{return value=="b"})[0][0]
            const b=side.filter(([id,value])=>{return value=="a"})[0][0]
            let winner
            if(Status[roomId].scores[a] != Status[roomId].scores[b]) winner=Status[roomId].scores[a] > Status[roomId].scores[b] ? a : b
            else if(winner=Status[roomId].sentTimes[a] != Status[roomId].sentTimes[b])winner=Status[roomId].sentTimes[a] < Status[roomId].sentTimes[b] ? a : b
            io.to(roomId).emit("winner",winner);
            if(roomId&&Status[roomId]){
              clearTimeout(Status[roomId].timeout);
              delete Status[roomId];
              }
              //console.log(roomId)
              const room = io.sockets.adapter.rooms.get(roomId);
          if (room) {
            for (const socketId of room) {
              const socket = io.sockets.sockets.get(socketId);
              if (socket) {
                  //console.log(socket)
                  
                socket.leave(roomId);
                delete socket.roomId;
              }
            }
          }
            return
          }
          const a=setTimeout(()=>{
            roundDone(roomId);
            },20000)
            Status[roomId].round+=1;
            Status[roomId].timeout=a
          },w)
         
        //console.log('Kết quả:', msg); // Kết quả: 12
      });
  }

io.on('connection', (socket) => {
  console.log('user connected:', socket.id);
  socket.use(
    socketRateLimiter({ proxy: true, maxBurst: 5, perSecond: 1, gracePeriodInSeconds: 15, emitClientHtmlError: true }, socket)
  );
  socket.on('createRoom', (name) => {
    if(typeof name !== 'string' )return;
    if(!name)return socket.emit('errorMsg', 'Please enter your name.');
    if(name.length<3||name.length>5)return socket.emit('errorMsg', 'Name should have 3–5 characters.');
    if([...socket.rooms].length>=2)return ;
    const roomId = generateUniqueRoomId();
    socket.join(roomId);
    socket.roomId=roomId;
    console.log(`${socket.id} created & joined room: ${roomId}`);
    socket.emit('roomJoined', roomId);
    Status[roomId] = Status[roomId] ?? {round:1,actions:{},currentStatus:JSON.parse(JSON.stringify(setupPlayers)),sides:{},sentTimes:{},scores:{},names:{},isReady:{},roundTime:0};
    Status[roomId].currentStatus["a1"].position.x=90;
    Status[roomId].sides[socket.id]="a";
    Status[roomId].names[socket.id]=name;
    Status[roomId].scores[socket.id]=0;
    Status[roomId].sentTimes[socket.id]=0;
  });

  socket.on('joinRoom', (roomId,name) => {
    if(typeof name !== 'string'||typeof roomId !== 'string' )return;
    if(!name)return socket.emit('errorMsg', 'Please enter your name.');
    if(name.length<3||name.length>5)return socket.emit('errorMsg', 'Name should have 3–5 characters.');
    if([...socket.rooms].length>=2)return;
    const room = io.sockets.adapter.rooms.get(roomId);
    

    
    if (room&&room.size < 2) {
        
      socket.join(roomId);
      socket.roomId=roomId;
      console.log(`${socket.id} joined room: ${roomId}`);
      socket.emit('roomJoined', roomId);
      //const a=[...socket.rooms].filter(r => r !== socket.id)[0]
      
      Status[roomId].sides[socket.id]="b";
      Status[roomId].names[socket.id]=name;
      Status[roomId].scores[socket.id]=0;
      Status[roomId].sentTimes[socket.id]=0;
      const arr=Object.entries(setupPlayers).map(([key, value]) => ({ id: key, value })).map(item => {

        return {id:item.id,status:"set",position:item.value.position};
      })
  
      io.to(roomId).emit('setupStatus', roomId);
      Status[roomId].roundTime=Date.now();
      const timeout=setTimeout(()=>{
      roundDone(roomId);
      },30000)
      Status[roomId].timeout=timeout;
    } else {
      socket.emit('errorMsg', 'Room not found');
    }
  });
  
  socket.on('ready', () => {
    
    const roomId=[...socket.rooms].filter(r => r !== socket.id)[0]
    
    if(!roomId||Status[roomId].isReady[socket.id])return;
    
    Status[roomId].isReady[socket.id]=true;
    if(Object.keys(Status[roomId].isReady).length==2){
      clearTimeout(Status[roomId].timeout);
      roundDone(roomId);
      
  }
  })

  socket.on('setupStatus', () => {
    const roomId=[...socket.rooms].filter(r => r !== socket.id)[0]
    if(!roomId)return;
    //console.log(typeof [...socket.rooms].filter(r => r !== socket.id)[0] === 'string');
    //console.log([...socket.rooms].filter(r => r !== socket.id)[0],socket.rooms);
    const arr=Object.entries(Status[roomId].currentStatus).map(([key, value]) => ({ id: key, value })).map(item => {

        return {id:item.id,status:"set",position:item.value.position};
      })
    socket.emit('updateStatus', arr,Status[roomId].sides[socket.id],Date.now());
    socket.emit("scores",Object.entries(Status[roomId].scores).map(([key, value]) =>{
        return  {name:Status[roomId].names[key],score:value,side:Status[roomId].sides[key]}
                        }));
    //socket.emit('updateStatus', setupPlayers);
    //socket.to([...socket.rooms].filter(r => r !== socket.id)[0]).emit('receiveMessage', { id: socket.id, message:"message" });
  })
  socket.on('updateStatus', (status,round) => {
    const isValid = Array.isArray(status) &&
    status.length <= 3 &&
    status.every(item =>
      typeof item === 'object' &&
      item != null &&
      typeof item.id === 'number' &&
      item.id>0&&item.id<=6 &&
      typeof item.action === 'string' &&
      (item.action=='move'||item.action=='dash'||item.action=='pass'||item.action=='shoot')&&
      typeof item.position === 'object' &&
      item.position!=null&&
      typeof item.position.x === 'number' &&
      typeof item.position.y === 'number' &&
      item.position.x>=0-(50/3)&&item.position.x<=200+(50/3)&&
      item.position.y>=0&&item.position.y<=100&&
      Object.keys(item.position).length === 2 &&
      Object.keys(item).length === 3 // chỉ cho phép đúng 1 key: "id"
    );
    console.log(isValid);
    
    const uniqueIds = new Set(status.map(item => item.id));
const allIdsUnique = uniqueIds.size === status.length;
console.log(allIdsUnique)
    if(!isValid||!allIdsUnique)return;
    status.forEach(item=>{
     item.position.x=parseFloat(item.position.x.toFixed(2))
     item.position.y=parseFloat(item.position.y.toFixed(2))
    })
    const roomId=[...socket.rooms].filter(r => r !== socket.id)[0]
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;
    if (!room||room.size<2) return;
    console.log(Status[roomId].round!=round||Status[roomId].actions[socket.id])
    if(Status[roomId].round!=round||Status[roomId].isReady[socket.id])return;
Status[roomId].actions[socket.id] = status;
Status[roomId].sentTimes[socket.id]+= Date.now()-Status[roomId].roundTime;



    //console.log(typeof [...socket.rooms].filter(r => r !== socket.id)[0] === 'string');
    //console.log([...socket.rooms].filter(r => r !== socket.id)[0],socket.rooms);
    
    
    //socket.emit('updateStatus', setupPlayers);
    //socket.to([...socket.rooms].filter(r => r !== socket.id)[0]).emit('receiveMessage', { id: socket.id, message:"message" });
  })
  socket.on('sendMessage', ({ roomId, message }) => {
    socket.to(roomId).emit('receiveMessage', { id: socket.id, message });
  });
  socket.on('disconnect', () => {
    const roomId=socket.roomId;
    if(roomId&&Status[roomId]){
    clearTimeout(Status[roomId].timeout);
    delete Status[roomId];
    }
    //console.log(roomId)
    const room = io.sockets.adapter.rooms.get(roomId);
if (room) {
  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
        //console.log(socket)
        socket.emit('roomClosed');
      socket.leave(roomId);
      delete socket.roomId;
    }
  }
}
  })
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
