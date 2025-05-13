function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }
  
  function normalizeVector(v) {
    const len = Math.hypot(v.x, v.y);
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
  }
  
  function simulateMovements(inputObjects, step = 0.1, radius = 1) {
    // Tạo bản sao để không thay đổi input gốc
    const objects = inputObjects.map(obj => ({
      position: { ...obj.position },
      target: { ...obj.target },
      step:obj.step,
      stopped: false,
      id: obj.id ?? undefined // giữ lại id nếu có
    }));
  
    let moving = true;
    
    while (moving) {
      moving = false;
      for (let i = 0; i < objects.length; i++) {
        const obj=objects[i];
        
        
        const dir = {
          x: obj.target.x - obj.position.x,
          y: obj.target.y - obj.position.y
        };
  
        const distToTarget = Math.hypot(dir.x, dir.y);
        if (distToTarget <= obj.step) {
          obj.position = { ...obj.target };
          obj.stopped = true;
          //continue;
        }
  
        const unit = normalizeVector(dir);
        obj.predPos={x:obj.position.x + unit.x * obj.step,y:obj.position.y + unit.y * obj.step};
        const prx=obj.position.x + unit.x * obj.step;
        const pry=obj.position.y + unit.y * obj.step;
        obj.bfx=obj.position.x ;
  obj.bfy=obj.position.y ;
  if(pry>=25&&pry<=75){
    if(prx>=200&&(prx>=(195+(50/3))||pry<=30||pry>=70))obj.stopped = true;
    else if(prx<=0&&(prx<=(5-(50/3))||pry<=30||pry>=70))obj.stopped = true;
  }
   else{     if(prx>=195||prx<=5||pry>=95||pry<=5){
          if(prx>=195)obj.position.x=195;
            else if(prx<=5)obj.position.x=5;
          if(pry>=95)obj.position.y=95;
            else if(pry<=5)obj.position.y=5;
          //obj.position = { ...obj.target };
          obj.stopped = true;
          //continue;
        }
      }
        for (let j = 0; j < objects.length; j++) {
          if (i === j) continue;
          const a = objects[i];
          const b = objects[j];
          //if (a.stopped && b.stopped) continue;
  
          const d = distance(a.predPos, b.position);
          //console.log(d)
          const exactDistance = radius * 2;
          //console.log(d);
          if (d <= exactDistance) {
           
            a.stopped = true;
            b.stopped = true;
          }
        }
        if (obj.stopped) continue;
        obj.position.x += unit.x * obj.step;
        obj.position.y += unit.y * obj.step;
        //console.log(obj.step);
        
        moving = true;
      }
      // Di chuyển mỗi object nếu chưa dừng
      
  
      // Kiểm tra va chạm giữa các cặp
      
    }
  
    return objects;
  }
  module.exports=simulateMovements;