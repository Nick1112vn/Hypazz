



console.log(Math.hypot(10,0));
var Status=[];
var currentRound=0;
var currentPlr;
 var players={}   ;
 var origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
 var currentStatusType;
 
 let mouseEvent ;
 let maxDuration=0;
 function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendStatus(){
  
      document.querySelector("#cover").classList.add('ready')
  setTimeout(() => {
    socket.emit("ready");
  }, 0);
}
    const updateStatus=  (crstatus,side,sentTime,wT,round) => {
      document.getElementById("field").removeEventListener("dblclick", posSelect);
      document.getElementById("stick").style.opacity="0";
      document.querySelectorAll(".player").forEach((dv1)=>{dv1.classList.remove('disablePointer')})
          document.querySelectorAll(".player").forEach((dv)=>{dv.classList.remove('selectedPlr');dv.classList.remove('unselectedPlr')})
      isAllTweenDone=false;
      document.querySelector("#cover").classList.remove('ready')
      document.querySelectorAll(".predictStatus").forEach((dv1)=>{dv1.remove()})
      document.querySelectorAll(".player").forEach((dv1)=>{dv1.classList.remove('actSelected')})
      if(round){currentRound=round;
        
      }
      Status=[]
      //Status=[{id:1,action:"move",position:{x: 91.65791214349636, y: 48.75588498}}];
      //if(side=="a")Status=[];
      //console.log(crstatus,side);
       maxDuration=0;
      crstatus.forEach(async (player)=>{
        
if (player.status=="move"){
  //console.log(player.id,parseFloat(document.getElementById(player.id).style.left));
    const v=2000;
    let wt=0;
    await delay(200);
    if(!document.getElementById(player.id))return
    const tl=document.getElementById(player.id).tl
    const dur=Math.sqrt((player.position.x-parseFloat(document.getElementById(player.id).style.left)*2)**2+(player.position.y-parseFloat(document.getElementById(player.id).style.top))**2)/(v*player.speed);
    if (maxDuration<dur)maxDuration=dur;
    gsap.killTweensOf("#"+player.id);
    gsap.to("#"+player.id, {
        duration: dur,
        left: player.position.x/2 + '%',
        top: player.position.y + '%',
        ease: "sine.out",
        //onComplete: () => console.log("Done!")
      });
      
      if(player.id!="ball"){
        const tl1=document.getElementById("svg"+player.id).tl
        gsap.killTweensOf("#svg"+player.id);
        gsap.to("#svg"+player.id, {
        duration: Math.sqrt((player.position.x-parseFloat(document.getElementById(player.id).style.left)*2)**2+(player.position.y-parseFloat(document.getElementById(player.id).style.top))**2)/(v*player.speed),
        left: player.position.x/2 + '%',
        top: player.position.y + '%',
        ease: "sine.out",
        //onComplete: () => console.log("Done!")
      });
    }
}
else if(player.status=="set"){
    if(!document.getElementById(player.id)){
   const dv= document.createElement("div");
dv.innerHTML=`
<img src=>
  
`
document.getElementById("field").insertAdjacentHTML('beforeend', `<svg id="svg${player.id}"  style="position:absolute; flex-shrink: 0; pointer-events:none; opacity:0.2; width:7.5%; aspect-ratio:1/1; transform:translate(-50%,-50%)">
    <circle cx="50%" cy="50%" r="46.5%" fill="none" stroke="black" stroke-width="7%" />
  </svg>`);
dv.id=player.id;
dv.tl=gsap.timeline();
document.getElementById("svg"+player.id).tl=gsap.timeline();
dv.classList.add("player");
dv.addEventListener("click",(e)=>{
  if (e.target != e.currentTarget) return
  e.stopPropagation();
  currentPlr=player.id;
  document.getElementById("statusSelect").style.visibility= "visible";
  document.getElementById("statusSelect").style.left= parseFloat(document.getElementById(player.id).style.left)+'%';
  document.getElementById("statusSelect").style.top= parseFloat(document.getElementById(player.id).style.top)+'%';
  document.querySelectorAll(".player").forEach((dv1)=>{if(dv!=dv1){dv1.classList.remove('selectedPlr');dv1.classList.add('unselectedPlr')}})
    dv.classList.remove('unselectedPlr');
  dv.classList.add('selectedPlr');
})
document.getElementById("field").appendChild(dv);
    }
    if(side&&player.id[0]!=side)document.getElementById(player.id).classList.add("opponent")
      const tl=document.getElementById(player.id).tl
    gsap.killTweensOf("#"+player.id);
    gsap.to("#"+player.id, {
        duration: 0,
        left: player.position.x/2 + '%',
        top: player.position.y + '%',
        ease: "none",
        //onComplete: () => console.log("Done!")
        });
        if(player.id!="ball"){
          const tl1=document.getElementById("svg"+player.id).tl
          gsap.killTweensOf("#svg"+player.id);
          gsap.to("#svg"+player.id, {
          duration: 0,
          left: player.position.x/2 + '%',
          top: player.position.y + '%',
          ease: "none",
          //onComplete: () => console.log("Done!")
          });
        }
}
document.getElementById(player.id).position=player.position
      })
      const w = currentRound==1 ? 29-Math.max((Date.now()-sentTime),0)/1000 : 19-Math.max((Date.now()-sentTime),0)/1000;
      if(side&&currentRound<=20){
        const ballPosX=crstatus.find(p => p.id === "ball"&&p.status=="move")
        if(ballPosX&&(ballPosX.position.x>205||ballPosX.position.x<-5)){
        setTimeout(()=>{
document.getElementById('goal').style.visibility="visible";
document.getElementById('goal').currentTime = 0;
document.getElementById('goal').play();
setTimeout(()=>{document.getElementById('goal').style.visibility="hidden";},4000);
        },maxDuration*1000+500)
      }
        const w1 = wT
        document.querySelector("#timeline h1").innerText=currentRound+"/20";
        setTimeout(()=>{
          gsap.killTweensOf("#timeline .bar div");
      const tl=gsap.timeline()
      tl.to("#timeline .bar div", {
        duration: 1,
        width:"100%",
        ease: "sine.out",
        //onComplete: () => console.log("Done!")
      });
      tl.to("#timeline .bar div", {
        duration: w,
        width:"0%",
        ease: "sine.out",
        //onComplete: () => console.log("Done!")
      });
    },w1)
    }
    };
    socket.on('updateStatus',(status,side,sentTime,w,round)=>updateStatus(status,side,sentTime,w,round))
    socket.on('receiveMessage', ({ id, message }) => {
      console.log(111);
    });
    
    socket.on('roomClosed', () => {
      console.log("roomClosed")
      loadPage('./');
    });
    socket.on("winner",()=>{
      document.getElementById("winnerPanel").style.pointerEvents="auto";
      gsap.to("#winnerPanel", {
        duration: 0.2,
        opacity:1,
        ease: "sine.out",
        //onComplete: () => console.log("Done!")
      });
      
    })
    socket.on('scores', (scores,arr) => {
      console.log(scores)
      scores.forEach(item=>{
        console.log(scores)
        if (item.name)document.getElementById("scores").getElementsByClassName(item.side)[0].querySelector("h1").innerText=item.name;
        document.getElementById("scores").getElementsByClassName(item.side)[0].querySelector("p").innerText=item.score;

        if (item.name)document.querySelector(`#winnerPanel .scores .${item.side} h1`).innerText=item.name;
        document.querySelector(`#winnerPanel .scores .${item.side} p`).innerText=item.score;
      })
          
          if(!arr)return;
      
      updateStatus(arr)
      scores.forEach(item=>{
        //if (item.name)document.getElementById("scores").getElementsByClassName(item.side)[0].querySelector("h1")=item.name;
      document.getElementById("scores").getElementsByClassName(item.side)[0].querySelector("p").innerText=item.score;
      })
      
    });  
      //socket.emit("setupStatus","1");
      
    
    //socket.emit("setupStatus","1");
   window.addEventListener('click', (e) => {
    if(!document.getElementById("statusSelect")||document.getElementById("statusSelect").style.visibility== "hidden")return;
    document.getElementById("statusSelect").style.visibility= "hidden";
    document.querySelectorAll(".player").forEach((dv)=>{dv.classList.remove('selectedPlr');dv.classList.remove('unselectedPlr')})
  });
  let posSelect;
  
  //updateStatus(window.currentstatus,window.side);
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space'&&document.getElementById("stick").style.opacity==0) {
      
      document.getElementById("field").removeEventListener("dblclick", posSelect);
      document.getElementById("statusSelect").style.visibility= "hidden";
      document.querySelectorAll(".player").forEach((dv1)=>{dv1.classList.remove('disablePointer')})
      document.querySelectorAll(".player").forEach((dv)=>{dv.classList.remove('selectedPlr');dv.classList.remove('unselectedPlr')})
      sendStatus();
      e.preventDefault(); // nếu muốn ngăn cuộn trang
    }
  });
  
 // gốc cố định giữa màn hình
function updateStick(e){
  mouseEvent=e
  
  const stick = document.getElementById('stick');
  if(!stick)return;
  const c=checkCollision(document.getElementById(currentPlr),e,document.querySelectorAll(".player"))
  if (c==true)stick.style.backgroundColor="red";
  else if(c==false)stick.style.backgroundColor="black";
  else if(c=="r")stick.style.backgroundColor="orange";
  const parentRect = document.getElementById("field").getBoundingClientRect();
  const dx = (e.clientX-parentRect.x) - (origin.x);
  const dy = (e.clientY-parentRect.y) - (origin.y);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI; // tính góc xoay
  const distance = Math.sqrt(dx * dx + dy * dy); // tính độ dài
  
  gsap.set(stick, {
    left: (origin.x/parentRect.width)*100 + '%',
    top: (origin.y/parentRect.height)*100 + '%',
    width: (distance/parentRect.width)*100 + '%',
    rotation: angle,
    yPercent: -50
  });
}
document.addEventListener('mousemove', (e) => {
  
  updateStick(e)
});


// Gọi function
function distance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}
function normalizeVector(v) {
  const len = Math.hypot(v.x, v.y);
  return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
}
  window._scripts[document.currentScript.src] = {
    start: function() {
      document.getElementById("ball").tl=gsap.timeline();
      $(".text").fitText(0.2);
      fitTextToOwnHeight("#scores > .a > p",0.8,{right:20/100});
      fitTextToOwnHeight("#scores > .b > p",0.8,{left:20/100});
      fitTextToOwnHeight("#scores > .a > h1",0.8,{right:20/100});
      fitTextToOwnHeight("#scores > .b > h1",0.8,{left:20/100});

      fitTextToOwnHeight("#winnerPanel .scores > .a > p",0.8,{right:20/100});
      fitTextToOwnHeight("#winnerPanel .scores  > .b > p",0.8,{left:20/100});
      fitTextToOwnHeight("#winnerPanel .scores  > .a > h1",0.8,{right:20/100});
      fitTextToOwnHeight("#winnerPanel .scores  > .b > h1",0.8,{left:20/100});
      fitTextToOwnHeight("#winnerPanel button",0.8,{});
      fitTextToOwnHeight("#timeline h1",0.7,{})
      currentRound=0;
      socket.emit("setupStatus","1");
      document.getElementById("statusSelect").querySelectorAll("div").forEach((bt)=>bt.addEventListener('click', (e) => {
        e.stopPropagation();
        currentStatusType=bt.getElementsByTagName('p')[0].innerHTML
        if((currentStatusType=="P"||currentStatusType=="S")&&distance(document.getElementById(currentPlr).position,document.getElementById("ball").position)>12.5)return
        document.getElementById("statusSelect").style.visibility= "hidden";
        document.querySelectorAll(".player").forEach((dv1)=>{dv1.classList.add('disablePointer')})
        const plrRect=document.getElementById(currentPlr).getBoundingClientRect();
          const parentRect = document.getElementById("field").getBoundingClientRect();
          origin={x:plrRect.left-parentRect.left+plrRect.width/2,y:plrRect.top-parentRect.top+plrRect.height/2}
          if(mouseEvent)updateStick(mouseEvent)
          document.getElementById("stick").style.opacity="0.4";
        
         posSelect=()=>{
          const e=mouseEvent
          document.getElementById("stick").style.opacity="0";
          document.getElementById(currentPlr).classList.add("actSelected")
          const rect = document.getElementById("field").getBoundingClientRect();
        const x = e.clientX - rect.left; // Vị trí click theo px
        const y = e.clientY - rect.top;
    
        const percentX = parseFloat(((x / rect.width) * 100).toFixed(2));
        const percentY = parseFloat(((y / rect.height) * 100).toFixed(2));
          
          if(bt.getElementsByTagName('p')[0].innerHTML=="M")Status.push({id:parseInt(currentPlr[1]),action:"move",position:{x:percentX*2,y:percentY}})
            if(bt.getElementsByTagName('p')[0].innerHTML=="P")Status.push({id:parseInt(currentPlr[1]),action:"pass",position:{x:percentX*2,y:percentY}})
              if(bt.getElementsByTagName('p')[0].innerHTML=="S")Status.push({id:parseInt(currentPlr[1]),action:"shoot",position:{x:percentX*2,y:percentY}})
                socket.emit("updateStatus",Status,currentRound);
            //console.log(Status,bt.getElementsByTagName('p')[0].innerHTML);
          const copy1 = document.getElementById("stick").cloneNode(true);
          copy1.removeAttribute('id');
          copy1.classList.add("predictStatus");
          copy1.classList.add("predictStick");
          copy1.querySelector("div").remove();
          
          let copy
          if(bt.getElementsByTagName('p')[0].innerHTML=="M"||bt.getElementsByTagName('p')[0].innerHTML=="D") {copy = document.getElementById(currentPlr).cloneNode(true);copy1.style.backgroundColor="rgb(113, 55, 35)"}
          else {copy = document.getElementById("ball").cloneNode(true);copy.classList.add("predictBall");copy1.style.backgroundColor="white"}
          copy.removeAttribute('id');
          copy.classList.add("predictStatus");
          
          copy.style.left=percentX+'%';
          copy.style.top=percentY+'%';
          document.getElementById('field').appendChild(copy);
          document.getElementById('field').appendChild(copy1);
          
          if(Status.length>=3){sendStatus();
          }
          document.querySelectorAll(".player").forEach((dv1)=>{dv1.classList.remove('disablePointer')})
          document.querySelectorAll(".player").forEach((dv)=>{dv.classList.remove('selectedPlr');dv.classList.remove('unselectedPlr')})
          document.getElementById("field").removeEventListener("dblclick", posSelect);
        }
        document.getElementById("field").addEventListener('dblclick', posSelect)
    
      }))
      
    }
  };
  window._scripts[document.currentScript.src]?.start?.();
  function pointToLineDistance(A, B, P) {
    if(!P||!A)return;
    const ABx = B.x - A.x;
    const ABy = B.y - A.y;
    const APx = P.x - A.x;
    const APy = P.y - A.y;

    const dot = ABx * APx + ABy * APy;
    const len_sq = ABx * ABx + ABy * ABy;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;

    if (param < 0) {
        xx = A.x;
        yy = A.y;
    } else if (param > 1) {
        xx = B.x;
        yy = B.y;
    } else {
        xx = A.x + param * ABx;
        yy = A.y + param * ABy;
    }

    const dx = P.x - xx;
    const dy = P.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}
function checkCollision(origin, e, points){
  //console.log(origin.position,points)
  if(!origin||!document.getElementById("field"))return;
  const rect = document.getElementById("field").getBoundingClientRect();
        const x = e.clientX - rect.left; // Vị trí click theo px
        const y = e.clientY - rect.top;
    
        const percentX = parseFloat(((x / rect.width) * 100).toFixed(2));
        const percentY = parseFloat(((y / rect.height) * 100).toFixed(2));
        mouse={x:percentX*2,y:percentY}
        const dir = {
          x: mouse.x - origin.position.x,
          y: mouse.y - origin.position.y
        };
        const unit = normalizeVector(dir);
        const d=distance(origin.position,document.getElementById("ball").position)
        const caPos={x:origin.position.x+unit.x * d,y:origin.position.y+unit.y * d};
        //console.log(points)
        if(distance(origin.position,mouse)<20&&(currentStatusType=="P"||currentStatusType=="S"))return "r";
  for (const p of points) {
    //console.log(origin.position, mouse, p.position)
    //console.log(pointToLineDistance(origin.position, mouse, p.position))
    const cd=currentStatusType=="P"||currentStatusType=="S" ?caPos : origin.position
    if (origin.id!=p.id&& pointToLineDistance(cd, mouse, p.position)< 10) {
        return true;
    }
    
}

if (pointToLineDistance(origin.position, mouse, document.getElementById("ball").position) < 10&&(currentStatusType!="P"&&currentStatusType!="S")) {
  return true;}
return false;
}
function updateBlur() {
  const elements = document.querySelectorAll("#winnerPanel");
  elements.forEach((element) => {
    if (element.offsetHeight) {
      const height = element.offsetHeight * 0.01;
      const blurAmount = Math.round(height) + "px";

      // Sửa dùng style chứ không setAttribute
      element.style.backdropFilter = `blur(${blurAmount})`;
      element.style.webkitBackdropFilter = `blur(${blurAmount})`;
    }
  });
}

updateBlur();
window.addEventListener('resize', updateBlur);