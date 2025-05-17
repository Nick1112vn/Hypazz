var containernum=0
 function createAnnouncementUI( title, message, type = 'info', duration = 3000 ) {
  
    const container = document.createElement('div');
    container.className = `announcement ${type}`;
    container.id="announcement"+containernum
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 300px;
      padding: 14px 18px;
      margin: 10px;
      border-radius: 8px;
      font-family: sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      opacity: 0;
      transform: translateY(-10px);
      
      z-index: 9999;
      background-color: ${type === 'success' ? '#d4edda' :
                        type === 'error' ? '#f8d7da' :
                        type === 'warning' ? '#fff3cd' : '#d1ecf1'};
      color: ${type === 'success' ? '#155724' :
              type === 'error' ? '#721c24' :
              type === 'warning' ? '#856404' : '#0c5460'};
      border: 1px solid ${type === 'success' ? '#c3e6cb' :
                         type === 'error' ? '#f5c6cb' :
                         type === 'warning' ? '#ffeeba' : '#bee5eb'};
    `;
  
    if (title) {
      const titleElem = document.createElement('strong');
      titleElem.textContent = title;
      titleElem.style.display = 'block';
      titleElem.style.marginBottom = '4px';
      titleElem.style.fontSize="32px"
      container.appendChild(titleElem);
    }
  
    const messageElem = document.createElement('span');
    messageElem.textContent = message;
    messageElem.style.fontSize="30px"
    container.appendChild(messageElem);
  
    document.body.appendChild(container);
  
    // Kích hoạt hiệu ứng xuất hiện
    gsap.to("#"+"announcement"+containernum, {
      duration: 0.3,
      opacity: 1,
      y: 0,
      ease: "power1.out",
      onComplete: () => {
       gsap.to("#"+"announcement"+containernum1, {
        duration: duration/1000,onComplete: () =>
        {
          gsap.to("#"+"announcement"+containernum1, {
          duration: 0.3,
          opacity: 0,
          y: '-10px',
          ease: "power1.out",
          onComplete: () => {container.remove()}
        })
       } })
      
    }
    });
   const containernum1=containernum
    // Tự động ẩn sau thời gian
    
      
       // chờ hiệu ứng xong rồi xóa
    
  containernum+=1
    return container;
  }
  