document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // 1. LOGIC KÉO THẢ MENU
    // ==========================================
    const menuHandle = document.getElementById('menuHandle');
    const menuOptions = document.getElementById('menuOptions');
    let isDraggingMenu = false, startX, startY, currentX = 0, currentY = 0;

    if (menuHandle) {
        menuHandle.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDraggingMenu = true;
        }, {passive: true});

        menuHandle.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
            isDraggingMenu = true;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDraggingMenu) return;
            let dx = e.touches[0].clientX - startX;
            let dy = e.touches[0].clientY - startY;
            currentX += dx;
            currentY += dy;
            menuHandle.style.transform = `translate(${currentX}px, ${currentY}px)`;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, {passive: true});

        document.addEventListener('mousemove', (e) => {
            if (!isDraggingMenu) return;
            let dx = e.clientX - startX;
            let dy = e.clientY - startY;
            currentX += dx;
            currentY += dy;
            menuHandle.style.transform = `translate(${currentX}px, ${currentY}px)`;
            startX = e.clientX;
            startY = e.clientY;
        });

        document.addEventListener('touchend', () => { isDraggingMenu = false; });
        document.addEventListener('mouseup', () => { isDraggingMenu = false; });

        menuHandle.addEventListener('click', () => {
            if (!isDraggingMenu) {
                menuOptions.classList.toggle('active');
            }
        });
    }

    // ==========================================
    // 2. LOGIC KÉO THẢ TOOL HŨ & MD5
    // ==========================================
    function makeDraggable(wrapperId, uiId) {
        const wrapper = document.getElementById(wrapperId);
        const ui = document.getElementById(uiId);
        if (!wrapper || !ui) return;

        let isDragging = false, startX, startY, initialX, initialY;

        wrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX; startY = e.touches[0].clientY;
            initialX = ui.offsetLeft; initialY = ui.offsetTop;
            isDragging = true;
        }, {passive: true});

        wrapper.addEventListener('mousedown', (e) => {
            startX = e.clientX; startY = e.clientY;
            initialX = ui.offsetLeft; initialY = ui.offsetTop;
            isDragging = true;
        });

        document.addEventListener('touchmove', (e) => {
            if(!isDragging) return;
            let dx = e.touches[0].clientX - startX; let dy = e.touches[0].clientY - startY;
            ui.style.left = (initialX + dx) + 'px'; ui.style.top = (initialY + dy) + 'px';
        }, {passive: false});

        document.addEventListener('mousemove', (e) => {
            if(!isDragging) return;
            let dx = e.clientX - startX; let dy = e.clientY - startY;
            ui.style.left = (initialX + dx) + 'px'; ui.style.top = (initialY + dy) + 'px';
        });

        document.addEventListener('touchend', () => isDragging = false);
        document.addEventListener('mouseup', () => isDragging = false);
    }

    makeDraggable('drag-handle-hu', 'tool-ui');
    makeDraggable('drag-handle-md5', 'tool-ui-md5');

    // ==========================================
    // 3. LOGIC ẨN/HIỆN TOOL
    // ==========================================
    window.toggleMenuPanel = function(id, btn) {
        const el = document.getElementById(id);
        if (el.style.display === 'none') { el.style.display = 'flex'; btn.innerText = '[-]'; } 
        else { el.style.display = 'none'; btn.innerText = '[+]'; }
    };

    window.toggleOneTool = function(uiId, btnId) {
        const ui = document.getElementById(uiId);
        const btn = document.getElementById(btnId);
        if (ui.style.display === 'none' || ui.style.display === '') { ui.style.display = 'flex'; btn.classList.add('active'); } 
        else { ui.style.display = 'none'; btn.classList.remove('active'); }
    };

    window.toggleToolVisibility = function() {
        const uiHu = document.getElementById('tool-ui');
        const uiMd5 = document.getElementById('tool-ui-md5');
        if (uiHu.style.display !== 'none') { uiHu.style.display = 'none'; uiMd5.style.display = 'none'; } 
        else { uiHu.style.display = 'flex'; uiMd5.style.display = 'flex'; }
    };

    window.selectRatio = function(type, val) {
        document.querySelectorAll('.btn-ratio').forEach(b => b.classList.remove('selected'));
        document.getElementById('btn-' + type).classList.add('selected');
    };

    window.applyRatioToGame = function() {
        let msg = document.getElementById('ratio-status-msg');
        msg.innerText = '✅ Đã áp dụng tỷ lệ vào game!';
        setTimeout(() => { msg.innerText = ''; }, 3000);
    };

    // ==========================================
    // 4. CRACK CHECK KEY
    // ==========================================
    window.verifyKey = function(isAuto) {
        let keyInput = document.getElementById('activation-key').value.trim();
        let keyMsg = document.getElementById('key-msg');
        
        if (keyMsg) {
            keyMsg.innerText = "✅ Kích hoạt thành công!";
            keyMsg.style.color = "#00ff66";
        }
        
        // Ẩn form đăng nhập, hiện tool
        document.getElementById('key-input-container').style.display = 'none';
        document.getElementById('info-panel-menu').style.display = 'flex';
        document.getElementById('tool-locked-content').style.display = 'block';
        
        // Điền thông tin fake
        document.getElementById('infoKeyStr').innerText = keyInput ? keyInput.toUpperCase() : 'MINHBEOSTORE';
        document.getElementById('infoHsd').innerText = 'VĨNH VIỄN';
        
        // Hiện 2 cục tool
        document.getElementById('tool-ui').style.display = 'flex';
        document.getElementById('tool-ui-md5').style.display = 'flex';

        // Bắt đầu chạy thuật toán
        startSimulation();
    };

    window.logoutKey = function() {
        location.reload();
    };

    // ==========================================
    // 5. THUẬT TOÁN CHẠY PHIÊN TÀI XỈU
    // ==========================================
    let timeLeft = 25;
    let isShowingResult = false;
    let huWin = 0, huLose = 0, md5Win = 0, md5Lose = 0;

    function startNewSession() {
        isShowingResult = false;
        timeLeft = 25;

        let randomId = Math.floor(1000 + Math.random() * 9000);
        
        let sessEl = document.getElementById('session-id');
        let sessElMd5 = document.getElementById('session-id-md5');
        if(sessEl) sessEl.innerText = 'Phiên: #' + randomId;
        if(sessElMd5) sessElMd5.innerText = 'Phiên: #' + randomId;
        
        let resHu = document.getElementById('prediction-result');
        if(resHu) { resHu.innerText = 'Phân tích...'; resHu.className = 'result-text loading'; }
        
        let barHu = document.getElementById('confidence-bar');
        if(barHu) barHu.style.width = '0%';
        
        let txtHu = document.getElementById('confidence-text');
        if(txtHu) txtHu.innerText = 'Độ tin cậy: 0%';

        let resMd5 = document.getElementById('prediction-result-md5');
        if(resMd5) { resMd5.innerText = 'Phân tích...'; resMd5.className = 'result-text loading'; }
        
        let barMd5 = document.getElementById('confidence-bar-md5');
        if(barMd5) barMd5.style.width = '0%';
        
        let txtMd5 = document.getElementById('confidence-text-md5');
        if(txtMd5) txtMd5.innerText = 'Độ tin cậy: 0%';
    }

    function tickTimer() {
        if (!isShowingResult) {
            timeLeft--;
            if (timeLeft <= 0) {
                chotKetQua();
            }
        } else {
            timeLeft--;
            if (timeLeft <= 0) {
                startNewSession();
            }
        }
    }

    function chotKetQua() {
        isShowingResult = true;
        timeLeft = 5;

        let isTai = Math.random() > 0.5;
        let percent = Math.floor(75 + Math.random() * 20);

        // Cập nhật Hũ
        let resHu = document.getElementById('prediction-result');
        if(resHu) { resHu.innerText = isTai ? 'TÀI' : 'XỈU'; resHu.className = 'result-text ' + (isTai ? 'tai' : 'xiu'); }
        
        let barHu = document.getElementById('confidence-bar');
        if(barHu) barHu.style.width = percent + '%';
        
        let txtHu = document.getElementById('confidence-text');
        if(txtHu) txtHu.innerText = 'Độ tin cậy: ' + percent + '%';

        // Cập nhật MD5
        let resMd5 = document.getElementById('prediction-result-md5');
        if(resMd5) { resMd5.innerText = isTai ? 'TÀI' : 'XỈU'; resMd5.className = 'result-text ' + (isTai ? 'tai' : 'xiu'); }
        
        let barMd5 = document.getElementById('confidence-bar-md5');
        if(barMd5) barMd5.style.width = percent + '%';
        
        let txtMd5 = document.getElementById('confidence-text-md5');
        if(txtMd5) txtMd5.innerText = 'Độ tin cậy: ' + percent + '%';

        updateStats();
    }

    function updateStats() {
        if (Math.random() > 0.2) huWin++; else huLose++;
        if (Math.random() > 0.2) md5Win++; else md5Lose++;
        
        let hWin = document.getElementById('hu-win'); if(hWin) hWin.innerText = huWin;
        let hLose = document.getElementById('hu-lose'); if(hLose) hLose.innerText = huLose;
        let hRate = document.getElementById('hu-rate'); 
        if(hRate) hRate.innerText = (huWin + huLose > 0 ? Math.floor((huWin / (huWin + huLose)) * 100) : 0) + '%';

        let mWin = document.getElementById('md5-win'); if(mWin) mWin.innerText = md5Win;
        let mLose = document.getElementById('md5-lose'); if(mLose) mLose.innerText = md5Lose;
        let mRate = document.getElementById('md5-rate');
        if(mRate) mRate.innerText = (md5Win + md5Lose > 0 ? Math.floor((md5Win / (md5Win + md5Lose)) * 100) : 0) + '%';
    }

    function startSimulation() {
        startNewSession();
        // Đảm bảo không tạo ra nhiều vòng lặp trùng lặp nếu bấm nhiều lần
        if (window.simulationInterval) clearInterval(window.simulationInterval);
        window.simulationInterval = setInterval(tickTimer, 1000);
    }

    // ==========================================
    // 6. TỰ ĐỘNG CHẠY KHI VỪA MỞ TOOL
    // ==========================================
    // Nếu người dùng đã bấm nút Đăng nhập, nó sẽ gọi verifyKey. 
    // Tao tự động giả lập bấm nút sau 1 giây để vào luôn (nếu mày muốn)
    setTimeout(() => {
        let btn = document.getElementById('btn-login-text');
        if (btn) {
            let keyInput = document.getElementById('activation-key');
            if (keyInput && !keyInput.value) keyInput.value = 'minhbeostore';
            btn.click();
        }
    }, 1000);
    
});
