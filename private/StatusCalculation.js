const { parentPort, workerData } = require('worker_threads');
const simulateMovements = require('./simulateMovements');
function distance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}
function normalizeVector(v) {
  const len = Math.hypot(v.x, v.y);
  return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
}
//const input = workerData;
const cstatus=workerData.status;
const actions=cstatus.actions
    let moveProperty=[];
    let shooter;
    let dis={value:12.6,position:cstatus.currentStatus["ball"].position,speed:cstatus.currentStatus["ball"].speed,capos:cstatus.currentStatus["ball"].position};
    const arr=Object.entries(actions).map(([key, value]) => ({ id: key, value }));
arr.sort((a, b) => {
    if (cstatus.currentStatus["ball"].position.x < 100 &&cstatus.sides[a.id]=="a") return -1;
    if (cstatus.currentStatus["ball"].position.x < 100 &&cstatus.sides[a.id]=="b") return 1;
    if (cstatus.currentStatus["ball"].position.x > 100 &&cstatus.sides[a.id]=="a") return 1;
    if (cstatus.currentStatus["ball"].position.x > 100 &&cstatus.sides[a.id]=="b") return -1;
    return 0; // giữ nguyên nếu cả hai giống nhau
  }).forEach((socketPlr)=>{
    //console.log(socketPlr.value)
    moveProperty=moveProperty.concat(socketPlr.value.map(action => {
        
if(action.action=="pass"||action.action=="shoot"){
    const d=distance(cstatus.currentStatus[cstatus.sides[socketPlr.id]+action.id].position,cstatus.currentStatus['ball'].position)
    if(dis.value-0.1>=d){
        const pos=cstatus.currentStatus[cstatus.sides[socketPlr.id]+action.id].position
        
        const dir = {
            x: action.position.x - pos.x,
            y: action.position.y - pos.y
          };
          const unit = normalizeVector(dir);
          const caPos={x:pos.x+unit.x * d,y:pos.y+unit.y * d};
          shooter=cstatus.sides[socketPlr.id]+action.id;
          if(Object.entries(cstatus.currentStatus).map(([key, value]) => ({ id: key, ...value })).filter((item)=>{
            //console.log(distance(item.position,cstatus.currentStatus["ball"].position))
            //console.log(distance(item.position,caPos),item.position,caPos,Math.hypot(10,0))
            if(distance(item.position,caPos)>=10-1e-6||item.id=="ball")return false
            return true
          }).length<=0){//cstatus.currentStatus["ball"].position=caPos;
            
            if(action.action=="shoot"){dis={value:d,position:{x:pos.x+unit.x * 1000,y:pos.y+unit.y * 1000},speed:0.0025,capos:caPos}}
            else       dis={value:d,position:action.position,speed:0.001,capos:caPos}}}
    return;}
    return {id:cstatus.sides[socketPlr.id]+action.id,position:cstatus.currentStatus[cstatus.sides[socketPlr.id]+action.id].position,target:action.position,step:cstatus.currentStatus[cstatus.sides[socketPlr.id]+action.id].speed};
  }).filter(item => item != null));
})

moveProperty.push({id:"ball",position:dis.capos,target:dis.position,step:dis.speed});

const a1=Object.entries(cstatus.currentStatus).map(([key, value]) => ({ id: key, ...value })).map(action => {
     
        return {id:action.id,position:action.position,target:action.position,step:action.speed};
      })
      const result = a1.filter(item => !moveProperty.map((v) => v.id).includes(item.id));
      moveProperty=moveProperty.concat(result);
const calculatedPos=simulateMovements(moveProperty,0.1,5);
const ballpos= dis.capos;
const ar1=calculatedPos.map(item => {

  return {id:item.id,status:"move",position:item.position,speed:item.step};
})
ar1.unshift({id:"ball",status:"set",position:ballpos})

//console.log(moveProperty);
//console.log(cstatus.currentStatus);

parentPort.postMessage({
  calculatedPos,
  ar1,
  shooter
}); 