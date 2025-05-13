export function createAnnouncementUI({ title, message, type = 'info', duration = 3000 }) {
    const container = document.createElement('div');
    container.className = `announcement ${type}`;
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 300px;
      padding: 12px 16px;
      margin: 10px;
      border-radius: 8px;
      font-family: sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      opacity: 0;
      transform: translateY(-10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
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
      container.appendChild(titleElem);
    }
  
    const messageElem = document.createElement('span');
    messageElem.textContent = message;
    container.appendChild(messageElem);
  
    document.body.appendChild(container);
  
    // Kích hoạt hiệu ứng xuất hiện
    requestAnimationFrame(() => {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    });
  
    // Tự động ẩn sau thời gian
    setTimeout(() => {
      container.style.opacity = '0';
      container.style.transform = 'translateY(-10px)';
      setTimeout(() => container.remove(), 300); // chờ hiệu ứng xong rồi xóa
    }, duration);
  
    return container;
  }
  