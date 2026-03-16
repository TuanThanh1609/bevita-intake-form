/* ============================================
   BEVITA INTAKE FORM — Application Logic
   ============================================ */

// ── Configuration ──
const CONFIG = {
    // Các API keys đã được di chuyển sang cấu hình bảo mật Environment Variables trên Vercel
    // Front-end sẽ tương tác thông qua các thư mục /api ảo của severless server.
    MAX_IMAGE_SIZE: 1200, // Max width/height in px (resize before upload)
    APP_VERSION: '20260316_2', // Version for cache busting - CRM fields added
};

// ── Form State ──
const state = {
    currentScreen: 'welcome',
    currentStep: 0, // 0=welcome, 1-4=steps
    data: {
        Full_Name: '',
        Phone_Number: '',
        Age_Group: '',
        Location: '',
        Skin_Condition: '',
        Skin_Photos: '',
        History_Cosmetics: '',
        History_Spa: '',
        History_Spa_Service: '',
        History_Spa_Results: '',
        Current_Routine: '',
        Routine_Photos: '',
        Health_Status: '',
        Supplements: '',
        Lifestyle_Sleep: '',
        Lifestyle_Stress: '',
        Budget: '',
        Note: '',
        fbpageid: '',
        fb_pid: '',
        fbads_id: '',
    },
    skinGoals: [],
    supplements: [],
    isFromUrl: false, // Flag khi chuyển màn hình từ URL params
    spaServices: [],
    healthData: {},
    skinPhotoUrls: { front: null, left: null, right: null },
    routinePhotoUrls: [],
    botPronoun: 'Mai',    // Mặc định ban đầu
    userPronoun: 'bạn',   // Mặc định ban đầu
    history: [],          // Lịch sử duyệt form
    nocoDbId: null,       // Track NocoDB Record ID
};

// ── Screen Flow ──
const FLOW = [
    'welcome',
    'age', 'location', 'skin', 'photo-skin',                    // Step 1
    'cosmetics', 'spa',                                          // Step 2
    'routine',                                                   // Step 3
    'health-intro', 'menstrual', 'pregnancy', 'medical',         // Step 4
    'supplements', 'sleep', 'stress', 'budget',
    'confirm-phone',                                             // Xác nhận + SĐT
    'thankyou',
];

const STEP_MAP = {
    'welcome': 0, 'age': 1, 'location': 1, 'skin': 1, 'photo-skin': 1, // Bước 1: Thông tin
    'cosmetics': 2, 'spa': 2, 'spa-services': 2, 'spa-results': 2, 'routine': 2, // Bước 2: Lịch sử (bao gồm cả Hiện tại cũ)
    'health-intro': 3, 'menstrual': 3, 'pregnancy': 3, 'medical': 3,
    'supplements': 3, 'sleep': 3, 'stress': 3, 'budget': 3, 'budget-suggest': 3, // Bước 3: Sức khỏe
    'confirm-phone': 4,
    'thankyou': 4, // Bước 4: Hoàn thành
};

const PROGRESS_MAP = {
    'welcome': 0, 'age': 8, 'location': 16, 'skin': 24, 'photo-skin': 32,
    'cosmetics': 40, 'spa': 48, 'spa-services': 52, 'spa-results': 56, 'routine': 60,
    'health-intro': 64, 'menstrual': 70, 'pregnancy': 76, 'medical': 82,
    'supplements': 88, 'sleep': 92, 'stress': 96, 'budget': 98, 'budget-suggest': 98,
    'confirm-phone': 100,
    'thankyou': 100,
};

// ── App Module ──
const App = {
    // ── Navigation ──
    goToScreen(screenId, isBack = false) {
        if (!isBack && state.currentScreen && state.currentScreen !== 'welcome' && state.currentScreen !== 'later' && state.currentScreen !== 'thankyou') {
            state.history.push(state.currentScreen);
        }

        const currentEl = document.getElementById(`screen-${state.currentScreen}`);
        const nextEl = document.getElementById(`screen-${screenId}`);

        if (currentEl) currentEl.classList.remove('active');
        if (nextEl) {
            nextEl.classList.add('active');
            // Skip animations when coming from URL params to avoid flicker
            if (!state.isFromUrl) {
                nextEl.querySelectorAll('.animate-in').forEach(el => {
                    el.style.animation = 'none';
                    el.offsetHeight; // force reflow
                    el.style.animation = '';
                });
            } else {
                // Reset flag after first use
                state.isFromUrl = false;
                // Also hide animated elements to prevent flicker
                nextEl.querySelectorAll('.animate-in').forEach(el => {
                    el.style.opacity = '1';
                });
            }
        }

        state.currentScreen = screenId;
        state.currentStep = STEP_MAP[screenId] || 0;

        // Toggle global back button
        const btnBackGlobal = document.getElementById('btnBackGlobal');
        if (btnBackGlobal) {
            if (screenId === 'welcome' || screenId === 'later' || screenId === 'thankyou' || state.history.length === 0) {
                btnBackGlobal.classList.add('hidden');
            } else {
                btnBackGlobal.classList.remove('hidden');
            }
        }

        this.updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Khởi tạo màn hình skin nếu có nhu cầu từ URL
        if (screenId === 'skin') {
            this.initSkinScreen();
        }

        this.saveState();

        // ── Auto-save to NocoDB (debounced) ──
        if (screenId !== 'welcome' && (state.data.fb_pid || state.data.Full_Name || state.data.Phone_Number || state.history.length > 0)) {
            // Debounce: cancel previous pending save, wait 3s before actually saving
            if (this._autoSaveTimer) clearTimeout(this._autoSaveTimer);
            this._autoSaveTimer = setTimeout(() => this.submitPartialProgress(screenId), 3000);
        }
    },

    goBack() {
        if (state.history.length > 0) {
            const prevScreen = state.history.pop();
            this.goToScreen(prevScreen, true);
        }
    },

    saveState() {
        if (state.currentScreen && state.currentScreen !== 'thankyou') {
            localStorage.setItem('bevita_form_state', JSON.stringify(state));
        }
    },

    restoreState() {
        try {
            const saved = localStorage.getItem('bevita_form_state');
            if (saved) {
                const parsedState = JSON.parse(saved);
                if (parsedState.currentScreen && parsedState.currentScreen !== 'welcome' && parsedState.currentScreen !== 'thankyou') {
                    if (Array.isArray(parsedState.skinPhotoUrls)) parsedState.skinPhotoUrls = { front: null, left: null, right: null };
                    const targetScreen = parsedState.currentScreen;
                    const initialScreen = state.currentScreen; // typically 'welcome'
                    Object.assign(state, parsedState);
                    state.currentScreen = initialScreen; // temporarily reset so goToScreen hides it
                    this.populateUIFromState();
                    this.goToScreen(targetScreen, true);
                }
            }
        } catch (e) {
            console.error('Failed to restore form state', e);
        }
    },

    populateUIFromState() {
        // Text inputs
        if (state.data.Full_Name) {
            document.getElementById('ageGreeting').textContent = `Cảm ơn ${state.data.Full_Name}`;
        }
        if (state.data.Phone_Number) {
            const phoneInput = document.getElementById('inputConfirmPhone');
            if (phoneInput) phoneInput.value = state.data.Phone_Number;
        }
        if (state.data.Location) document.getElementById('inputLocation').value = state.data.Location;
        if (state.data.History_Cosmetics) document.getElementById('inputCosmetics').value = state.data.History_Cosmetics;
        if (state.data.Current_Routine) document.getElementById('inputRoutine').value = state.data.Current_Routine;
        
        if (state.healthData.menstrual) document.getElementById('inputMenstrual').value = state.healthData.menstrual;
        if (state.healthData.pregnancy) document.getElementById('inputPregnancy').value = state.healthData.pregnancy;
        if (state.healthData.medical) document.getElementById('inputMedical').value = state.healthData.medical;
        if (state.data.Supplements) document.getElementById('inputSupplements').value = state.data.Supplements;
        
        // Helper to re-select pills visually
        const selectPills = (containerId, values) => {
            const container = document.getElementById(containerId);
            if (!container || !values) return;
            const btnArr = Array.from(container.querySelectorAll('.pill-btn'));
            const valArray = Array.isArray(values) ? values : [values];
            btnArr.forEach(btn => {
                if (valArray.some(v => v.includes(btn.textContent.trim()) || btn.textContent.trim().includes(v))) {
                    btn.classList.add('selected');
                }
            });
        };

        selectPills('screen-age', state.data.Age_Group);
        if (state.data.Age_Group) this.updateDynamicTexts(); 
        
        if (state.skinGoals.length > 0) {
           selectPills('screen-skin', state.skinGoals);
           document.getElementById('btnSkinNext').classList.remove('hidden');
        }
        
        if (state.data.History_Spa) {
             if (state.data.History_Spa !== "Chưa bao giờ") {
                 selectPills('screen-spa', "Đã từng đi");
                 document.getElementById('inputSpaInfo').value = state.data.History_Spa;
                 document.getElementById('spaExtraInput').classList.remove('hidden');
             } else {
                 selectPills('screen-spa', "Chưa bao giờ");
             }
        }
        selectPills('screen-sleep', state.data.Lifestyle_Sleep);
        selectPills('screen-stress', state.data.Lifestyle_Stress);
        selectPills('screen-budget', state.data.Budget);

        // Restore photo previews
        if (state.routinePhotoUrls && state.routinePhotoUrls.length > 0) {
            this.restorePhotosUI('routine', state.routinePhotoUrls);
        }
        if (state.skinPhotoUrls && (state.skinPhotoUrls.front || state.skinPhotoUrls.left || state.skinPhotoUrls.right)) {
            this.restorePhotosUI('skin', state.skinPhotoUrls);
        }
    },

    restorePhotosUI(type, data) {
        if (type === 'skin') {
            this.updateWizardUI();
            return;
        }

        const areaEl = document.getElementById('routinePhotoArea');
        const previewsEl = document.getElementById('routinePreviews');
        if (!areaEl || !previewsEl) return;
        
        areaEl.classList.add('has-photos');
        const urls = data;
        
        urls.forEach((url) => {
            const preview = document.createElement('div');
            preview.className = 'photo-preview';
            preview.innerHTML = `
                <button class="remove-btn" onclick="App.removePhoto(this, 'routine')">×</button>
                <img src="${url}" alt="Preview">
            `;
            const uploadBtn = previewsEl.querySelector('.upload-btn') || previewsEl.lastElementChild;
            if (uploadBtn) {
                previewsEl.insertBefore(preview, uploadBtn);
            } else {
                previewsEl.appendChild(preview);
            }
        });
        
        this.showPhotoStatus('routine', `✅ Đã khôi phục ${urls.length} ảnh`);
    },

    updateProgress() {
        const pct = PROGRESS_MAP[state.currentScreen] || 0;
        document.getElementById('progressFill').style.width = pct + '%';

        document.querySelectorAll('.step-dot').forEach(dot => {
            const step = parseInt(dot.dataset.step);
            dot.classList.remove('active', 'completed');
            if (step === state.currentStep) dot.classList.add('active');
            else if (step < state.currentStep) dot.classList.add('completed');
        });
    },

    // ── Personalized Bot Response Utility ──
    showBotResponse(screenId, message, nextScreen, delay = 5000) {
        const screen = document.getElementById(`screen-${screenId}`);
        if (!screen) {
            this.goToScreen(nextScreen);
            return;
        }
        const chatArea = screen.querySelector('.chat-area');
        if (!chatArea) {
            this.goToScreen(nextScreen);
            return;
        }

        // Hide buttons to prevent double-clicks
        const actionsArea = screen.querySelector('.actions-area');
        if (actionsArea) actionsArea.style.display = 'none';

        // Create and append bot response bubble
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble bot animate-in';
        bubble.innerHTML = message;
        chatArea.appendChild(bubble);

        // Create typing indicator
        const typingBubble = document.createElement('div');
        typingBubble.className = 'typing-indicator animate-in';
        typingBubble.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatArea.appendChild(typingBubble);

        // Scroll to show the response and typing indicator
        chatArea.scrollTop = chatArea.scrollHeight;

        // Navigate after delay
        setTimeout(() => {
            this.goToScreen(nextScreen);
            // Restore actions area for when user navigates back
            if (actionsArea) actionsArea.style.display = '';
            // Remove the bubbles so they don't duplicate on revisit
            bubble.remove();
            typingBubble.remove();
        }, delay);
    },

    // ── Welcome ──
    startForm() {
        // Set ageGreeting from URL name (since we skip screen-name)
        if (state.data.Full_Name) {
            document.getElementById('ageGreeting').textContent = `Cảm ơn ${state.data.Full_Name}`;
        }
        this.goToScreen('age');
    },

    showLater() {
        this.goToScreen('later');
    },

    // ── Step 1: Tuổi ──
    selectAge(value) {
        state.data.Age_Group = value;
        
        // Update pronouns based on age — only ≥42 swaps to em/chị
        if (value === 'Trên 42 tuổi') {
            state.botPronoun = 'em';
            state.userPronoun = 'chị';
        } else {
            state.botPronoun = 'chị';
            state.userPronoun = 'em';
        }
        
        this.updateDynamicTexts();
        this.updateAgeBasedContent();
        this.highlightSelected(event.target);
        setTimeout(() => this.goToScreen('location'), 300);
    },

    // ── Update Pronouns System ──
    updateDynamicTexts() {
        // Prepare capitalized versions
        const botC = state.botPronoun.charAt(0).toUpperCase() + state.botPronoun.slice(1);
        const userC = state.userPronoun.charAt(0).toUpperCase() + state.userPronoun.slice(1);

        // Determine polite particle based on age group
        // When Bot says "Em" (≥42): Bot is younger → uses "ạ"
        // When Bot says "Chị" (<42): Bot is older → no "ạ"
        const isOver42 = state.data.Age_Group === 'Trên 42 tuổi';
        const polite = isOver42 ? 'ạ' : '';

        document.querySelectorAll('.dynamic-text').forEach(el => {
            let template = el.dataset.template;
            if (template) {
                // Replace placeholders
                template = template
                    .replace(/{bot}/g, state.botPronoun)
                    .replace(/{botC}/g, botC)
                    .replace(/{user}/g, state.userPronoun)
                    .replace(/{userC}/g, userC)
                    .replace(/{polite}/g, polite);
                el.innerHTML = template;
            }
        });
    },

    // ── Update content based on age group (TIN 06A/B, TIN 07A/B) ──
    updateAgeBasedContent() {
        const isOver42 = state.data.Age_Group === 'Trên 42 tuổi';
        const bot = state.botPronoun;
        const user = state.userPronoun;
        const botC = bot.charAt(0).toUpperCase() + bot.slice(1);
        const userC = user.charAt(0).toUpperCase() + user.slice(1);

        // ── TIN 06: Cosmetics screen ──
        const cosmeticsGreeting = document.getElementById('cosmeticsGreeting');
        const cosmeticsQuestion = document.getElementById('cosmeticsQuestion');
        const cosmeticsGrid = document.getElementById('cosmeticsGrid');

        if (isOver42) {
            // TIN 06B — ≥42 tuổi
            if (cosmeticsGreeting) {
                cosmeticsGreeting.innerHTML = `Cảm ơn ${user} đã gửi hình! ${botC} xem kỹ da ${user} ngay nha 🌷`;
                cosmeticsGreeting.dataset.template = `Cảm ơn {user} đã gửi hình! {botC} xem kỹ da {user} ngay nha 🌷`;
            }
            if (cosmeticsQuestion) {
                cosmeticsQuestion.innerHTML = `Trước khi ${bot} nhận xét, cho ${bot} hỏi thêm một chút về các sản phẩm chăm sóc da nhé:<br><br>Các loại mỹ phẩm ${user} đã từng dùng để trị nám, chăm sóc da... là của hãng nào?`;
                cosmeticsQuestion.dataset.template = `Trước khi {bot} nhận xét, cho {bot} hỏi thêm một chút về các sản phẩm chăm sóc da nhé:<br><br>Các loại mỹ phẩm {user} đã từng dùng để trị nám, chăm sóc da... là của hãng nào?`;
            }
            if (cosmeticsGrid) {
                cosmeticsGrid.innerHTML = `
                    <button class="pill-btn option" onclick="App.selectCosmetics('Chưa dùng gì đặc trị')">Chưa dùng gì đặc trị</button>
                    <button class="pill-btn option" onclick="App.selectCosmetics('Dược mỹ phẩm (La Roche, Avène...)')">Dược mỹ phẩm (La Roche, Avène...)</button>
                    <button class="pill-btn option" onclick="App.selectCosmetics('Cao cấp (SK-II, Estée Lauder...)')">Cao cấp (SK-II, Estée Lauder...)</button>
                    <button class="pill-btn option" onclick="App.selectCosmetics('Sản phẩm thuốc / bác sĩ kê')">Sản phẩm thuốc / bác sĩ kê</button>
                `;
            }
        } else {
            // TIN 06A — <42 tuổi
            if (cosmeticsGreeting) {
                cosmeticsGreeting.innerHTML = `Cảm ơn ${user} đã gửi hình! ${botC} xem kỹ da ${user} ngay nha 🌷`;
                cosmeticsGreeting.dataset.template = `Cảm ơn {user} đã gửi hình! {botC} xem kỹ da {user} ngay nha 🌷`;
            }
            if (cosmeticsQuestion) {
                cosmeticsQuestion.innerHTML = `Trước khi ${bot} nhận xét, cho ${bot} hỏi thêm một chút về các sản phẩm chăm sóc da nhé:<br><br>${userC} đã từng dùng loại mỹ phẩm nào để trị mụn, nám, hay chăm sóc da chưa?`;
                cosmeticsQuestion.dataset.template = `Trước khi {bot} nhận xét, cho {bot} hỏi thêm một chút về các sản phẩm chăm sóc da nhé:<br><br>{userC} đã từng dùng loại mỹ phẩm nào để trị mụn, nám, hay chăm sóc da chưa?`;
            }
            if (cosmeticsGrid) {
                cosmeticsGrid.innerHTML = `
                    <button class="pill-btn option" onclick="App.selectCosmetics('Chưa dùng gì đặc trị')">Chưa dùng gì đặc trị</button>
                    <button class="pill-btn option" onclick="App.selectCosmetics('Dùng dược mỹ phẩm')">Dùng dược mỹ phẩm</button>
                    <button class="pill-btn option" onclick="App.selectCosmetics('Dùng mỹ phẩm thường')">Dùng mỹ phẩm thường</button>
                    <button class="pill-btn option" onclick="App.selectCosmetics('Nghi dùng kem trộn')">Nghi dùng kem trộn</button>
                `;
            }
        }

        // ── TIN 07: Spa screen ──
        const spaQuestion = document.getElementById('spaQuestion');
        const spaExample = document.getElementById('spaExample');
        const spaGrid = document.getElementById('spaGrid');

        if (isOver42) {
            // TIN 07B — ≥42 tuổi
            if (spaQuestion) {
                spaQuestion.innerHTML = `${userC} đã từng đến spa hoặc thẩm mỹ viện điều trị da chưa?`;
                spaQuestion.dataset.template = `{userC} đã từng đến spa hoặc thẩm mỹ viện điều trị da chưa?`;
            }
            if (spaExample) {
                spaExample.innerHTML = `<em>(Ví dụ: peel da, tiêm meso, laser, RF nâng cơ, căng chỉ...)</em>`;
            }
            if (spaGrid) {
                spaGrid.innerHTML = `
                    <button class="pill-btn option" onclick="App.selectSpa('Chưa bao giờ')">Chưa bao giờ</button>
                    <button class="pill-btn option" onclick="App.selectSpa('Đã làm vài lần')">Đã làm vài lần</button>
                    <button class="pill-btn option" onclick="App.selectSpa('Đang điều trị định kỳ')">Đang điều trị định kỳ</button>
                `;
            }
            const spaResultsGrid = document.getElementById('spaResultsGrid');
            if (spaResultsGrid) {
                spaResultsGrid.innerHTML = `
                    <button class="pill-btn option" onclick="App.selectSpaResult('Sáng, đều màu hơn')">Sáng, đều màu hơn</button>
                    <button class="pill-btn option" onclick="App.selectSpaResult('Cải thiện nhưng không lâu')">Cải thiện nhưng không lâu</button>
                    <button class="pill-btn option" onclick="App.selectSpaResult('Không thay đổi nhiều')">Không thay đổi nhiều</button>
                    <button class="pill-btn option" onclick="App.selectSpaResult('Da nhạy cảm hơn sau đó')">Da nhạy cảm hơn sau đó</button>
                `;
            }

            // ── TIN 09: Health Intro ──
            const btnContinueHealth = document.getElementById('btnContinueHealth');
            if (btnContinueHealth) {
                btnContinueHealth.innerHTML = `Tiếp tục đi em`;
                btnContinueHealth.dataset.template = `Tiếp tục đi em`;
            }

        } else {
            // TIN 07A — <42 tuổi
            if (spaQuestion) {
                spaQuestion.innerHTML = `${userC} đã từng đến spa hoặc thẩm mỹ viện để chăm sóc da chưa?`;
                spaQuestion.dataset.template = `{userC} đã từng đến spa hoặc thẩm mỹ viện để chăm sóc da chưa?`;
            }
            if (spaExample) {
                spaExample.innerHTML = `<em>(Ví dụ: peel da, tiêm meso, laser, RF nâng cơ...)</em>`;
            }
            if (spaGrid) {
                spaGrid.innerHTML = `
                    <button class="pill-btn option" onclick="App.selectSpa('Chưa bao giờ')">Chưa bao giờ</button>
                    <button class="pill-btn option" onclick="App.selectSpa('Đã làm 1–2 lần')">Đã làm 1–2 lần</button>
                    <button class="pill-btn option" onclick="App.selectSpa('Đang điều trị định kỳ')">Đang điều trị định kỳ</button>
                `;
            }
            const spaResultsGrid = document.getElementById('spaResultsGrid');
            if (spaResultsGrid) {
                spaResultsGrid.innerHTML = `
                    <button class="pill-btn option" onclick="App.selectSpaResult('Da đỏ rồi hết')">Da đỏ rồi hết</button>
                    <button class="pill-btn option" onclick="App.selectSpaResult('Nám sáng hơn')">Nám sáng hơn</button>
                    <button class="pill-btn option" onclick="App.selectSpaResult('Nám sạm lại sau đó')">Nám sạm lại sau đó</button>
                    <button class="pill-btn option" onclick="App.selectSpaResult('Da bình thường, không thay đổi nhiều')">Da bình thường, không thay đổi nhiều</button>
                `;
            }

            // ── TIN 09: Health Intro ──
            const btnContinueHealth = document.getElementById('btnContinueHealth');
            if (btnContinueHealth) {
                btnContinueHealth.innerHTML = `Tiếp tục đi em`;
                btnContinueHealth.dataset.template = `Tiếp tục đi em`;
            }
        }
    },

    // ── Step 1: Location ──
    selectLocation(value) {
        state.data.Location = value;
        this.highlightSelected(event.target);

        // Nếu có nhu cầu từ URL, skip luôn bước skin
        if (state.data.Skin_Issues && state.data.Skin_Issues.length > 0 && state.data.FromUrl_NhuCau) {
            state.data.Skin_Condition = state.data.Skin_Issues.join(', ');
            // Hiển thị tin nhắn cá nhân hóa và chuyển thẳng sang chụp hình
            setTimeout(() => this.goToScreenWithSkinIssues('photo-skin'), 300);
        } else {
            setTimeout(() => this.goToScreen('skin'), 300);
        }
    },

    submitLocation() {
        const loc = document.getElementById('inputLocation').value.trim();
        if (!loc) {
            this.shakeInput('inputLocation');
            return;
        }
        state.data.Location = loc;

        // Nếu có nhu cầu từ URL, skip luôn bước skin
        if (state.data.Skin_Issues && state.data.Skin_Issues.length > 0 && state.data.FromUrl_NhuCau) {
            state.data.Skin_Condition = state.data.Skin_Issues.join(', ');
            this.goToScreenWithSkinIssues('photo-skin');
        } else {
            this.goToScreen('skin');
        }
    },

    // ── Chuyển màn hình với tin nhắn cá nhân hóa từ URL ──
    goToScreenWithSkinIssues(screenId) {
        const currentScreen = state.currentScreen;
        const screenEl = document.getElementById(`screen-${currentScreen}`);
        if (!screenEl) {
            this.goToScreen(screenId);
            return;
        }

        // Tạo bubble loading "..." để tạo cảm giác mượt mà
        const chatArea = screenEl.querySelector('.chat-area');
        if (chatArea) {
            // Tạo loading với HTML rõ ràng hơn
            const loadingBubble = document.createElement('div');
            loadingBubble.className = 'chat-bubble bot typing animate-in';
            loadingBubble.id = 'loading-typing';
            loadingBubble.innerHTML = '...';
            loadingBubble.style.cssText = 'background: white; padding: 14px 24px; min-width: 50px; text-align: center;';
            chatArea.appendChild(loadingBubble);

            // Cuộn xuống bottom
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        // Sau 1.5s: Hiển thị tin nhắn cá nhân hóa và chuyển màn hình
        setTimeout(() => {
            // Xóa bubble loading
            const loadingEl = document.getElementById('loading-typing');
            if (loadingEl) loadingEl.remove();

            // Hiển thị tin nhắn cá nhân hóa
            this.showSkinIssuesFromUrl();

            // Chuyển sang màn hình đích sau 1.5s nữa
            setTimeout(() => {
                this.goToScreen(screenId);
            }, 1500);
        }, 1500);
    },

    // ── Step 1: Skin Condition (multi-select) ──
    initSkinScreen() {
        // Kiểm tra nếu có Skin_Issues từ URL, skip luôn bước này
        if (state.data.Skin_Issues && state.data.Skin_Issues.length > 0 && state.data.FromUrl_NhuCau) {
            // Lưu dữ liệu và chuyển thẳng sang chụp hình
            state.data.Skin_Condition = state.data.Skin_Issues.join(', ');

            // Hiển thị tin nhắn Bot cá nhân hóa trước khi chuyển
            this.showSkinIssuesFromUrl();

            // Chuyển sang màn hình chụp hình sau 1.5 giây
            setTimeout(() => {
                this.goToScreen('photo-skin');
            }, 1500);
        }
    },

    toggleSkin(btn, value) {
        btn.classList.toggle('selected');
        if (state.skinGoals.includes(value)) {
            state.skinGoals = state.skinGoals.filter(v => v !== value);
        } else {
            state.skinGoals.push(value);
        }
        
        const nextBtn = document.getElementById('btnSkinNext');
        if (state.skinGoals.length > 0) {
            nextBtn.classList.remove('hidden');
            nextBtn.classList.add('animate-in');
        } else {
            nextBtn.classList.add('hidden');
        }
    },

    submitSkin() {
        // Nếu đã có Skin_Issues từ URL, skip phần chọn vấn đề da
        if (state.data.Skin_Issues && state.data.Skin_Issues.length > 0 && state.data.FromUrl_NhuCau) {
            state.data.Skin_Condition = state.data.Skin_Issues.join(', ');
            // Hiển thị thông báo cá nhân hóa
            this.showSkinIssuesFromUrl();
            return;
        }

        state.data.Skin_Condition = state.skinGoals.join(', ');
        this.goToScreen('photo-skin');
    },

    // ── Hiển thị thông báo khi có nhu cầu từ URL ──
    showSkinIssuesFromUrl() {
        const issues = state.data.Skin_Issues;
        const issueText = issues.join(', ');
        const bot = state.botPronoun;
        const botC = bot.charAt(0).toUpperCase() + bot.slice(1);
        const user = state.userPronoun;
        const userC = user.charAt(0).toUpperCase() + user.slice(1);

        // Cập nhật câu hỏi chụp hình với nội dung cá nhân hóa
        const photoQuestion = document.getElementById('photoSkinQuestion');
        if (photoQuestion) {
            const personalizedMsg = `Để xem tình trạng da <strong>${issueText}</strong> thật sự của ${user}, ${user} gửi giúp ${bot} <strong>3 tấm hình da mặt</strong> nhé 📸`;
            photoQuestion.innerHTML = personalizedMsg;
            photoQuestion.dataset_template = personalizedMsg;
        }

        // Kiểm tra nếu đã có tin nhắn cá nhân hóa rồi thì không thêm nữa
        const existingGreeting = document.getElementById('url-greeting-bubble');
        if (existingGreeting) return;

        // Tạo tin nhắn chào cá nhân hóa và thêm vào đầu chat
        const greetingBubble = document.createElement('div');
        greetingBubble.className = 'chat-bubble bot animate-in';
        greetingBubble.id = 'url-greeting-bubble'; // Đánh dấu để tránh duplicate
        greetingBubble.innerHTML = `<strong>${botC} hiểu rồi!</strong><br><br>Từ nhu cầu của ${user}, ${bot} thấy da có vấn đề: <strong>${issueText}</strong>.<br><br>${botC} sẽ tư vấn phác đồ phù hợp nhé! 🌷`;

        const photoSkinScreen = document.getElementById('screen-photo-skin');
        if (photoSkinScreen) {
            const chatArea = photoSkinScreen.querySelector('.chat-area');
            if (chatArea) {
                // Thêm sau avatar row
                const avatarRow = chatArea.querySelector('.bot-avatar-row');
                if (avatarRow && avatarRow.nextSibling) {
                    chatArea.insertBefore(greetingBubble, avatarRow.nextSibling);
                } else {
                    chatArea.insertBefore(greetingBubble, chatArea.firstChild);
                }
            }
        }
    },

    // ── Step 1: Skin Photos (1-Button Sequential Wizard) ──
    getMissingSkinPhotoSlot() {
        if (!state.skinPhotoUrls.front) return 'front';
        if (!state.skinPhotoUrls.left) return 'left';
        if (!state.skinPhotoUrls.right) return 'right';
        return null;
    },

    updateWizardUI() {
        const slots = [
            { id: 'front', title: 'Góc 1<br>Thẳng', text: 'Góc 1 (Chính diện)' },
            { id: 'left', title: 'Góc 2<br>Trái', text: 'Góc 2 (Nghiêng trái)' },
            { id: 'right', title: 'Góc 3<br>Phải', text: 'Góc 3 (Nghiêng phải)' }
        ];

        const missingSlotId = this.getMissingSkinPhotoSlot();
        const nextBtn = document.getElementById('btnSkinPhotoNext');
        const uploadBtn = document.getElementById('wizard-upload-label');
        const statusText = document.getElementById('wizard-status-text');
        const btnText = document.getElementById('wizard-btn-text');

        // Render thumbnails
        slots.forEach(slot => {
            const thumbEl = document.getElementById(`wizard-thumb-${slot.id}`);
            if (!thumbEl) return;
            
            const url = state.skinPhotoUrls[slot.id];
            if (url) {
                thumbEl.classList.add('has-photo');
                thumbEl.classList.remove('active');
                thumbEl.innerHTML = `
                    <button class="remove-btn" onclick="App.removeSkinPhotoSlot('${slot.id}')">×</button>
                    <img src="${url}" alt="Preview">
                `;
            } else {
                thumbEl.classList.remove('has-photo');
                thumbEl.innerHTML = slot.title;
                if (slot.id === missingSlotId) {
                    thumbEl.classList.add('active');
                } else {
                    thumbEl.classList.remove('active');
                }
            }
        });

        // Update actions area
        if (missingSlotId) {
            const currentSlot = slots.find(s => s.id === missingSlotId);
            nextBtn.classList.add('hidden');
            uploadBtn.style.display = 'inline-flex';
            uploadBtn.style.opacity = '1';
            uploadBtn.style.pointerEvents = 'auto';
            statusText.textContent = `Vui lòng chụp ${currentSlot.text}`;
            btnText.textContent = `📷 Chụp Góc ${slots.indexOf(currentSlot) + 1}`;
        } else {
            nextBtn.classList.remove('hidden');
            nextBtn.classList.add('animate-in');
            uploadBtn.style.display = 'none';
            statusText.textContent = `Đã đủ 3 góc ảnh! Hãy bấm Tiếp tục.`;
        }
    },

    async handleWizardUpload(files) {
        if (!files || files.length === 0) return;
        const file = files[0];
        const missingSlotId = this.getMissingSkinPhotoSlot();
        if (!missingSlotId) return;

        const statusText = document.getElementById('wizard-status-text');
        const uploadBtn = document.getElementById('wizard-upload-label');
        const btnText = document.getElementById('wizard-btn-text');
        
        statusText.textContent = 'Đang tải ảnh lên...';
        btnText.textContent = '⏳ Đang xử lý...';
        uploadBtn.style.opacity = '0.7';
        uploadBtn.style.pointerEvents = 'none';
        
        try {
            const url = await this.uploadToImgBB(file);
            state.skinPhotoUrls[missingSlotId] = url;
            this.updateWizardUI();
        } catch (err) {
            console.error('Upload error:', err);
            statusText.textContent = 'Lỗi tải lên! Vui lòng thử lại.';
            this.updateWizardUI(); // Reset button state
        }
        
        // Reset file input
        document.getElementById('wizard-file-input').value = '';
    },
    
    removeSkinPhotoSlot(slotId) {
        state.skinPhotoUrls[slotId] = null;
        this.updateWizardUI();
    },

    skipSkinPhotos() {
        this.goToScreen('cosmetics');
    },

    submitSkinPhotos() {
        const { front, left, right } = state.skinPhotoUrls;
        if (!front || !left || !right) return;
        state.data.Skin_Photos = front;
        state.data.Skin_photo_2 = left;
        state.data.Skin_photo_3 = right;
        this.goToScreen('cosmetics');
    },



    // ── Step 2: Cosmetics ──
    selectCosmetics(value) {
        state.data.History_Cosmetics = value;
        this.highlightSelected(event.target);

        // Flag kem trộn
        if (value.includes('kem trộn')) {
            state.data.Text = (state.data.Text ? state.data.Text + '; ' : '') + 'FLAG: cream_mixed';
            const bot = state.botPronoun;
            const botC = bot.charAt(0).toUpperCase() + bot.slice(1);
            const user = state.userPronoun;
            const isOver42 = state.data.Age_Group === 'Trên 42 tuổi';

            // Phản hồi khác nhau theo nhóm tuổi
            const message = isOver42
                ? `${botC} hiểu rồi! Kem trộn thường chứa corticoid và làm da quen thuốc — da sẽ cần thêm thời gian phục hồi hơn một chút.<br><br>Nhưng không sao nhé, ${bot} sẽ tư vấn phác đồ phù hợp cho da ${user} 🌷`
                : `Chị hiểu rồi! Kem trộn thường chứa corticoid và làm da quen thuốc — da sẽ cần thêm thời gian phục hồi hơn một chút.<br><br>Nhưng không sao nhé, chị sẽ tư vấn phác đồ phù hợp cho da em 🌷`;

            this.showBotResponse('cosmetics', message, 'spa');
        } else {
            setTimeout(() => {
                this.goToScreen('spa');
            }, 300);
        }
    },

    submitCosmeticsText() {
        const val = document.getElementById('inputCosmetics').value.trim();
        if (!val) {
            this.shakeInput('inputCosmetics');
            return;
        }
        state.data.History_Cosmetics = val;
        this.goToScreen('spa');
    },



    // ── Step 2.2: Spa ──
    selectSpa(value) {
        state.data.History_Spa = value;
        this.highlightSelected(event.target);

        const isOver42 = state.data.Age_Group === 'Trên 42 tuổi';

        if (value === 'Chưa bao giờ') {
            const user = state.userPronoun;
            // Phản hồi khác nhau theo nhóm tuổi
            const message = isOver42
                ? `Vậy thì ${user} chưa có tiền sử điều trị gì — dễ bắt đầu phác đồ từ đầu hơn 😊`
                : `Vậy thì em chưa có tiền sử điều trị gì — dễ bắt đầu phác đồ từ đầu hơn 😊`;
            this.showBotResponse('spa', message, 'routine');
        } else {
            // "Đã làm..." / "Đang điều trị..."
            setTimeout(() => this.goToScreen('spa-services'), 300);
        }
    },

    submitSpaText() {
        const val = document.getElementById('inputSpa').value.trim();
        if (!val) {
            this.shakeInput('inputSpa');
            return;
        }
        state.data.History_Spa = val;
        this.goToScreen('spa-services');
    },

    // ── Step 2.3: Spa Services (Sub-question) ──
    toggleSpaService(btn, value) {
        if (!state.spaServices) state.spaServices = [];
        const index = state.spaServices.indexOf(value);
        if (index > -1) {
            state.spaServices.splice(index, 1);
            btn.classList.remove('selected');
        } else {
            state.spaServices.push(value);
            btn.classList.add('selected');
        }
    },

    submitSpaServices() {
        const input = document.getElementById('inputSpaServices');
        const customService = input ? input.value.trim() : '';

        const allServices = [...(state.spaServices || [])];
        if (customService) allServices.push(customService);

        if (allServices.length === 0) {
            this.shakeInput('inputSpaServices');
            return;
        }

        state.data.History_Spa_Service = allServices.join(', ');

        const isOver42 = state.data.Age_Group === 'Trên 42 tuổi';
        const bot = state.botPronoun;
        const user = state.userPronoun;
        const userC = user.charAt(0).toUpperCase() + user.slice(1);

        // Phản hồi khác nhau theo nhóm tuổi
        const message = isOver42
            ? `Các liệu trình xâm lấn khá phổ biến và hiệu quả nếu chọn đúng nơi uy tín.`
            : `Tuỳ liệu trình mà da sẽ có phản ứng khác nhau — chị sẽ lưu ý điều này khi lên phác đồ cho em nhé.`;

        // Using default 5000ms delay for responses
        this.showBotResponse('spa-services', message, 'spa-results');
    },

    // ── Step 2.4: Spa Results (Sub-question) ──
    selectSpaResult(value) {
        state.data.History_Spa_Results = value;
        this.highlightSelected(event.target);
        setTimeout(() => this.goToScreen('routine'), 300);
    },

    submitSpaResultsText() {
        const input = document.getElementById('inputSpaResults');
        if (!input || !input.value.trim()) {
            this.shakeInput('inputSpaResults');
            return;
        }
        state.data.History_Spa_Results = input.value.trim();
        this.goToScreen('routine');
    },

    // ── Step 3: Current Routine ──
    async handleRoutinePhotos(files) {
        await this.processPhotos(files, 'routine');
    },

    submitRoutine() {
        const text = document.getElementById('inputRoutine').value.trim();
        state.data.Current_Routine = text || '(Đã gửi ảnh)';

        if (state.routinePhotoUrls.length > 0) {
            state.data.Routine_Photos = state.routinePhotoUrls.join(', ');
        }

        this.goToScreen('health-intro');
    },

    // ── Step 4: Health Intro ──
    continueHealth() {
        this.goToScreen('menstrual');
    },

    skipHealth() {
        const isOver42 = state.data.Age_Group === 'Trên 42 tuổi';
        const message = isOver42
            ? `Dạ không sao! Sau này trong quá trình tư vấn Mai hỏi thêm cũng được nhé 😊`
            : `Không sao! Sau này trong quá trình tư vấn chị hỏi thêm cũng được nhé 😊`;
        this.showBotResponse('health-intro', message, 'budget');
    },

    // ── Step 4: Health sub-questions ──
    selectHealth(type, value) {
        state.healthData[type] = value;
        this.highlightSelected(event.target);

        // Build health status string for flags
        if (value.includes('Không đều') || value.includes('mãn kinh')) {
            state.data.Text = (state.data.Text ? state.data.Text + '; ' : '') + 'FLAG: hormonal_imbalance';
        }
        if (value.includes('tránh thai')) {
            state.data.Text = (state.data.Text ? state.data.Text + '; ' : '') + 'FLAG: on_contraceptives';
        }
        if (value.includes('Đang mang thai')) {
            state.data.Text = (state.data.Text ? state.data.Text + '; ' : '') + 'FLAG: pregnant';
        }

        setTimeout(() => {
            if (type === 'menstrual') this.goToScreen('pregnancy');
            else if (type === 'pregnancy') {
                if (value === 'Đang mang thai') {
                    const isOver42 = state.data.Age_Group === 'Trên 42 tuổi';
                    const message = isOver42
                        ? `Dạ chị đang mang thai thì cần lưu ý một số hoạt chất đặc biệt — Mai sẽ tư vấn riêng cho chị nhé 🤰`
                        : `Chị đang mang thai thì cần lưu ý một số hoạt chất đặc biệt — chị sẽ tư vấn riêng cho em nhé 🤰`;
                    this.showBotResponse('pregnancy', message, 'medical');
                } else {
                    this.goToScreen('medical');
                }
            }
            else if (type === 'medical') this.goToScreen('supplements');
        }, 300);
    },

    submitMedicalText() {
        const val = document.getElementById('inputMedical').value.trim();
        if (!val) {
            this.shakeInput('inputMedical');
            return;
        }
        state.healthData.medical = val;
        if (val.match(/gan|thận|tiểu đường/i)) {
            state.data.Text = (state.data.Text ? state.data.Text + '; ' : '') + 'FLAG: medical_flag';
        }
        this.goToScreen('supplements');
    },

    // ── Step 4: Supplements (multi-select) ──
    toggleSupplement(btn, value) {
        // When "Không uống gì" is selected, deselect all others
        if (value === 'Không uống gì') {
            state.supplements = ['Không uống gì'];
            btn.closest('.pills-grid').querySelectorAll('.pill-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        } else {
            // Remove "Không uống gì" if selecting something else
            state.supplements = state.supplements.filter(v => v !== 'Không uống gì');
            btn.closest('.pills-grid').querySelectorAll('.pill-btn').forEach(b => {
                if (b.textContent.trim() === 'Không uống gì') b.classList.remove('selected');
            });

            btn.classList.toggle('selected');
            if (state.supplements.includes(value)) {
                state.supplements = state.supplements.filter(v => v !== value);
            } else {
                state.supplements.push(value);
            }
        }

        // Flag oral retinol
        if (value.includes('Vitamin A') && state.supplements.includes(value)) {
            state.data.Text = (state.data.Text ? state.data.Text + '; ' : '') + 'FLAG: oral_retinol';
        }
    },

    submitSupplements() {
        const extra = document.getElementById('inputSupplements').value.trim();
        if (extra) state.supplements.push(extra);

        state.data.Supplements = state.supplements.length > 0
            ? state.supplements.join(', ')
            : 'Không uống gì';

        this.goToScreen('sleep');
    },

    // ── Step 4: Sleep ──
    selectSleep(value) {
        state.data.Lifestyle_Sleep = value;
        this.highlightSelected(event.target);
        setTimeout(() => this.goToScreen('stress'), 300);
    },

    // ── Step 4: Stress ──
    selectStress(value) {
        state.data.Lifestyle_Stress = value;
        this.highlightSelected(event.target);
        setTimeout(() => this.goToScreen('budget'), 300);
    },

    // ── Step 4: Budget ──
    selectBudget(value) {
        if (value === 'Chưa xác định') {
            this.highlightSelected(event.target);
            setTimeout(() => this.goToScreen('budget-suggest'), 300);
            return;
        }

        state.data.Budget = value;
        this.highlightSelected(event.target);
        setTimeout(() => this.goToScreen('confirm-phone'), 300);
    },

    // ── Submit Form ──
    async submitForm() {
        // Build Health info string from healthData
        // Note: Health_Status on NocoDB is MultiSelect with no options defined,
        // so we store health details in the Text field instead
        const healthParts = [];
        if (state.healthData.menstrual) healthParts.push(`Kinh nguyệt: ${state.healthData.menstrual}`);
        if (state.healthData.pregnancy) healthParts.push(`Thai sản: ${state.healthData.pregnancy}`);
        if (state.healthData.medical) healthParts.push(`Bệnh lý: ${state.healthData.medical}`);
        const healthText = healthParts.join('; ');

        // Auto-generate Title
        const now = new Date();
        state.data.Title = `Lead_${state.data.Full_Name}_${now.toISOString().slice(0,10)}`;
        state.data.Status = 'new';

        // CRM Fields - Initialize tracking
        state.data.current_step = 7; // Completed all 7 steps
        state.data.step_status = 'hoan_thanh';
        state.data.trang_thai = 'Mới tiếp nhận';
        state.data.follow_up_status = 'active';
        state.data.nguon = state.data.fbpageid ? 'Facebook Ads' : 'Messenger';
        state.data.ngay_tiep_nhan = now.toISOString();
        state.data.last_response = now.toISOString();

        // Show loading
        document.getElementById('loadingOverlay').classList.add('active');

        try {
            // Build payload — only include fields that exist in NocoDB
            // Note: Phone_Number is the display/primary field in NocoDB
            const payload = {
                Title: state.data.Title,
                Phone_Number: String(state.data.Phone_Number || ''),
                Full_Name: state.data.Full_Name,
                Age_Group: state.data.Age_Group,
                Location: state.data.Location,
                Skin_Condition: state.data.Skin_Condition,
                History_Cosmetics: state.data.History_Cosmetics,
                History_Spa: state.data.History_Spa,
                History_Spa_Service: state.data.History_Spa_Service || null,
                History_Spa_Results: state.data.History_Spa_Results || null,
                Current_Routine: state.data.Current_Routine,
                Supplements: state.data.Supplements || null,
                Lifestyle_Sleep: state.data.Lifestyle_Sleep || null,
                Lifestyle_Stress: state.data.Lifestyle_Stress || null,
                Budget: state.data.Budget || null,
                Status: 'new',
                Health_Status: healthText || null,
                Note: state.data.Note || null,
                Submission_Date: now.toISOString(),
                last_step: 'completed',
            };

            // Add Facebook tracking fields from Smax URL params
            if (state.data.fbpageid) payload.fbpageid = state.data.fbpageid;
            if (state.data.fb_pid) payload.fb_pid = state.data.fb_pid;
            if (state.data.fbads_id) payload.fbads_id = state.data.fbads_id;

            // CRM Tracking Fields
            payload.current_step = state.data.current_step || 7;
            payload.step_status = state.data.step_status || 'hoan_thanh';
            payload.trang_thai = state.data.trang_thai || 'Mới tiếp nhận';
            payload.follow_up_status = state.data.follow_up_status || 'active';
            payload.follow_up_count = 0;
            payload.nguon = state.data.nguon || 'Messenger';
            payload.ngay_tiep_nhan = state.data.ngay_tiep_nhan || now.toISOString();
            payload.last_response = state.data.last_response || now.toISOString();

            // Only add URL fields if they have values (NocoDB URL type rejects empty strings)
            if (state.data.Skin_Photos) payload.Skin_Photos = state.data.Skin_Photos;
            if (state.data.Skin_photo_2) payload.Skin_photo_2 = state.data.Skin_photo_2;
            if (state.data.Skin_photo_3) payload.Skin_photo_3 = state.data.Skin_photo_3;
            if (state.data.Routine_Photos) payload.Routine_Photos = state.data.Routine_Photos;

            console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

            const response = await fetch('/api/submit', {
                method: state.nocoDbId ? 'PATCH' : 'POST', // Use PATCH if record exists, though on final submit we'd prefer final update
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(state.nocoDbId ? Object.assign({ Id: state.nocoDbId }, payload) : payload),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('❌ NocoDB Error Response:', errorBody);
                throw new Error(`NocoDB Error: ${response.status} — ${errorBody}`);
            }

            console.log('✅ Lead submitted successfully:', await response.json());
            localStorage.removeItem('bevita_form_state');
        } catch (err) {
            console.error('❌ Submit error:', err);
            alert('Có lỗi khi gửi thông tin. Vui lòng thử lại!');
            document.getElementById('loadingOverlay').classList.remove('active');
            return;
        }

        document.getElementById('loadingOverlay').classList.remove('active');

        // Render summary on thankyou screen
        const summaryEl = document.getElementById('summaryContent');
        if (summaryEl) summaryEl.innerHTML = this.generateSummaryHTML();

        this.goToScreen('thankyou');
    },

    // ── Auto-save Progress (Partial Submit) ──
    async submitPartialProgress(currentScreen) {
        // Build minimal payload with last_step
        const now = new Date();
        const title = state.data.Full_Name
             ? `Lead_${state.data.Full_Name}_${now.toISOString().slice(0,10)}` 
             : `Lead_Partial_${now.toISOString().slice(0,10)}`;

        const payload = {
            Full_Name: state.data.Full_Name || null,
            Phone_Number: state.data.Phone_Number || null,
            Age_Group: state.data.Age_Group || null,
            Location: state.data.Location || null,
            Skin_Condition: state.data.Skin_Condition || null,
            History_Cosmetics: state.data.History_Cosmetics || null,
            History_Spa: state.data.History_Spa || null,
            Current_Routine: state.data.Current_Routine || null,
            Budget: state.data.Budget || null,
            Status: 'draft', // Identify as partial draft
            last_step: currentScreen,
        };

        if (state.data.fbpageid) payload.fbpageid = state.data.fbpageid;
        if (state.data.fb_pid) payload.fb_pid = state.data.fb_pid;
        if (state.data.fbads_id) payload.fbads_id = state.data.fbads_id;

        try {
            const isPatch = Boolean(state.nocoDbId);
            const method = isPatch ? 'PATCH' : 'POST';
            
            // If patching in NocoDB, must include Id and maybe pass as array or directly
            const reqBody = isPatch ? { Id: state.nocoDbId, ...payload } : payload;

            const response = await fetch('/api/submit', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody),
            });

            if (!response.ok) {
                console.warn('Partial save failed (expected if tracking off). Status:', response.status);
                return;
            }

            const data = await response.json();
            
            // If it was a POST, NocoDB returns the new record Id
            if (!isPatch && data && data.data && data.data.Id) {
                state.nocoDbId = data.data.Id;
                this.saveState(); // store nocoDbId
            }
        } catch (err) {
            console.warn('Silent partial submit error:', err);
        }
    },

    // ── Confirm Phone (cuối form) ──
    submitConfirmPhone() {
        let phone = document.getElementById('inputConfirmPhone').value.trim();

        if (!phone) {
            this.showError('inputConfirmPhone', 'Vui lòng nhập số điện thoại');
            return;
        }

        // Chuẩn hóa số điện thoại Việt Nam
        // Loại bỏ các ký tự không phải số
        phone = phone.replace(/[^0-9]/g, '');

        // Kiểm tra 10 số (đầu số Việt Nam)
        if (!/^0[0-9]{9}$/.test(phone) && !/^[0-9]{9,10}$/.test(phone)) {
            this.showError('inputConfirmPhone', 'Số điện thoại phải có 10 chữ số. Vui lòng nhập lại!');
            return;
        }

        // Nếu đầu số 84 (không có 0), thêm 0 vào đầu
        if (phone.startsWith('84')) {
            phone = '0' + phone;
        }

        state.data.Phone_Number = phone;
        this.submitForm();
    },

    // Hiển thị lỗi với shake animation
    showError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;

        // Thêm border đỏ
        input.style.borderColor = '#e74c3c';

        // Hiển thị message lỗi
        let errorEl = input.parentElement.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.style.cssText = 'color: #e74c3c; font-size: 12px; margin-top: 4px;';
            input.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
        errorEl.style.display = 'block';

        // Shake animation
        this.shakeInput(inputId);

        // Xóa lỗi khi user nhập lại
        input.addEventListener('input', function() {
            input.style.borderColor = '';
            if (errorEl) errorEl.style.display = 'none';
        }, { once: true });
    },

    // ── Generate Summary HTML ──
    generateSummaryHTML() {
        const d = state.data;
        const botC = state.botPronoun.charAt(0).toUpperCase() + state.botPronoun.slice(1);

        const rows = [
            { icon: '👤', label: 'Họ tên', value: d.Full_Name },
            { icon: '📞', label: 'Số điện thoại', value: d.Phone_Number },
            { icon: '🎂', label: 'Độ tuổi', value: d.Age_Group },
            { icon: '📍', label: 'Tỉnh/Thành', value: d.Location },
            { icon: '🌿', label: 'Vấn đề da', value: d.Skin_Condition },
            { icon: '💊', label: 'Mỹ phẩm đã dùng', value: d.History_Cosmetics },
            { icon: '💆', label: 'Spa / Thẩm mỹ', value: d.History_Spa },
            { icon: '💆‍♀️', label: 'Liệu trình đã làm', value: d.History_Spa_Service },
            { icon: '✨', label: 'Kết quả Spa', value: d.History_Spa_Results },
            { icon: '🧴', label: 'Routine hiện tại', value: d.Current_Routine },
            { icon: '💪', label: 'Sức khoẻ', value: d.Health_Status },
            { icon: '💊', label: 'TPCN', value: d.Supplements },
            { icon: '😴', label: 'Giấc ngủ', value: d.Lifestyle_Sleep },
            { icon: '😰', label: 'Stress', value: d.Lifestyle_Stress },
            { icon: '💰', label: 'Ngân sách', value: d.Budget },
        ];

        let html = '';
        rows.forEach(r => {
            if (r.value) {
                html += `<div class="summary-row">
                    <span class="summary-icon">${r.icon}</span>
                    <span class="summary-label">${r.label}</span>
                    <span class="summary-value">${r.value}</span>
                </div>`;
            }
        });

        return html;
    },

    // ── Photo Processing ──
    async processPhotos(files, type) {
        let currentUrls = state.routinePhotoUrls;
        const maxLimit = 5;

        if (currentUrls.length + files.length > maxLimit) {
            alert(`Chỉ được tải lên tối đa ${maxLimit} ảnh`);
            return;
        }

        const areaEl = document.getElementById('routinePhotoArea');
        const previewsEl = document.getElementById('routinePreviews');
        const uploadLabel = areaEl.querySelector('.upload-btn');

        areaEl.classList.add('has-photos');
        uploadLabel.style.display = 'none'; // Hide temporarily

        const loader = document.createElement('div');
        loader.className = 'photo-preview';
        loader.innerHTML = `<div class="photo-loader"></div>`;
        previewsEl.appendChild(loader);

        let uploadErrors = 0;
        for (const file of Array.from(files)) {
            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'photo-preview';
                preview.innerHTML = `
                    <button class="remove-btn" onclick="App.removePhoto(this, 'routine')">×</button>
                    <img src="${e.target.result}" alt="Preview">
                `;
                previewsEl.insertBefore(preview, loader);
            };
            reader.readAsDataURL(file);

            // Upload to ImgBB
            try {
                const url = await this.uploadToImgBB(file);
                state.routinePhotoUrls.push(url);
            } catch (err) {
                console.error('Upload error:', err);
                uploadErrors++;
            }
        }

        if (loader) loader.remove();
        uploadLabel.style.display = 'inline-flex';

        // Check length and toggle Next buttons
        const count = state.routinePhotoUrls.length;

        if (uploadErrors > 0) {
            this.showPhotoStatus('routine', `⚠️ Lỗi tải lên ${uploadErrors} ảnh. Vui lòng check F12 Console hoặc F5 thử lại.`);
        } else {
            this.showPhotoStatus('routine', `✅ Đã tải lên ${count} ảnh`);
        }
    },

    showPhotoStatus(type, message) {
        if (type !== 'routine') return;
        const areaEl = document.getElementById('routinePhotoArea');
        if (!areaEl) return;
        let statusEl = areaEl.querySelector('.photo-status');
        if (!statusEl) {
            statusEl = document.createElement('p');
            statusEl.className = 'photo-status';
            areaEl.appendChild(statusEl);
        }
        statusEl.textContent = message;
    },

    removePhoto(btn, type) {
        if (type !== 'routine') return;
        const previewEl = btn.closest('.photo-preview');
        const index = Array.from(previewEl.parentNode.children).indexOf(previewEl);
        previewEl.remove();

        state.routinePhotoUrls.splice(index, 1);
        if (state.routinePhotoUrls.length === 0) {
            document.getElementById('routinePhotoArea').classList.remove('has-photos');
            this.showPhotoStatus('routine', '');
        } else {
            this.showPhotoStatus('routine', `✅ Đã tải lên ${state.routinePhotoUrls.length} ảnh`);
        }
    },

    async uploadToImgBB(file) {
        // Resize image first
        const resizedBase64 = await this.resizeImage(file, CONFIG.MAX_IMAGE_SIZE);
        // Bỏ đi thẻ header data:image/jpeg;base64, để có thể truyền API thuận lợi
        const base64Data = resizedBase64.split(',')[1]; 

        const requestBody = { image: base64Data };

        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error(`Upload Error: ${response.status}`);

        const data = await response.json();
        return data.data.display_url;
    },

    resizeImage(file, maxSize) {
        return new Promise((resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                let { width, height } = img;

                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8)); // Force JPEG quality 0.8
            };

            img.src = URL.createObjectURL(file);
        });
    },

    // ── UI Helpers ──
    highlightSelected(btn) {
        const siblings = btn.closest('.pills-grid').querySelectorAll('.pill-btn');
        siblings.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    },

    shakeInput(inputId) {
        const el = document.getElementById(inputId);
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = 'shake 0.4s ease';
        el.focus();
        setTimeout(() => { el.style.animation = ''; }, 400);
    },
    // ── Parse Smax URL Parameters ──
    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);

        const fbpageid = params.get('fbpageid');
        const fbid = params.get('fbid');
        const name = params.get('name');
        const fbadid = params.get('fbadid');
        const phone = params.get('phone');
        const nhucau = params.get('nhucau');

        if (fbpageid) state.data.fbpageid = fbpageid;
        if (fbid) state.data.fb_pid = fbid;
        if (fbadid) state.data.fbads_id = fbadid;

        if (name) {
            state.data.Full_Name = decodeURIComponent(name);
        }

        if (phone) {
            state.data.Phone_Number = decodeURIComponent(phone);
            const phoneInput = document.getElementById('inputConfirmPhone');
            if (phoneInput) phoneInput.value = state.data.Phone_Number;
        }

        // Xử lý nhu cầu từ URL để cá nhân hóa
        let decodedNhucau = '';
        if (nhucau) {
            // Decode - thử cả single và double decode để xử lý various encoding
            try {
                decodedNhucau = decodeURIComponent(nhucau);
            } catch (e) {
                console.log('⚠️ Decode lỗi, thử double decode...');
                try {
                    decodedNhucau = decodeURIComponent(decodeURIComponent(nhucau));
                } catch (e2) {
                    decodedNhucau = nhucau;
                }
            }

            console.log('📋 Nhu cầu từ URL:', decodedNhucau);

            // Phân tích nhu cầu để xác định vấn đề da
            const skinIssues = this.analyzeSkinIssues(decodedNhucau);
            if (skinIssues.length > 0) {
                state.data.Skin_Issues = skinIssues;
                // Đánh dấu đã phân tích từ URL
                state.data.FromUrl_NhuCau = decodedNhucau;
                state.isFromUrl = true; // Flag để skip animation
            }
        }

        // KHÔNG lấy Age_Group từ URL - chỉ lấy từ webform
        // Chỉ phân tích vấn đề da từ nhu cầu

        console.log('📋 Smax URL Params parsed:', { fbpageid, fbid, name, fbadid, phone, nhucau });
    },

    // ── Phân tích nhu cầu da từ text ──
    analyzeSkinIssues(text) {
        const issues = [];
        const lowerText = text.toLowerCase();

        // Các từ khóa vấn đề da
        const keywords = {
            'Nám / tàn nhang': ['nám', 'tàn nhang', 'nám da', 'nám nội tiết', 'nám mảng', 'nám chân', 'nám sâu', 'nám nặng', 'sạm da', 'sạm nám', 'nám lâu năm', 'sạm nám', 'sạm'],
            'Mụn / thâm mụn': ['mụn', 'thâm mụn', 'mụn đầu đen', 'mụn trứng cá', 'mụn ẩn', 'mụn viêm', 'mụn nang', 'mụn bọc', 'da mụn', 'mụn dầu', 'mụn lâu năm', 'mụn tái phát', 'hay nổi mụn', 'mụn dai dẳng'],
            'Lão hoá / nhăn': ['lão hóa', 'nhăn', 'nếp nhăn', 'lão hoá', 'da nhăn', 'chảy xệch', 'chùng da', 'giãn da', 'thâm quần', 'vết chân chim', 'giảm collagen', 'kém săn chắc'],
            'Da xỉn / không đều màu': ['xỉn', 'không đều màu', 'thâm', 'da xỉn', 'xỉn màu', 'đốm nâu', 'da không đều', 'bắt nắng', 'da sạm', 'xỉn da', 'da xạm', 'thâm sạm']
        };

        for (const [issue, keywordsList] of Object.entries(keywords)) {
            for (const keyword of keywordsList) {
                if (lowerText.includes(keyword)) {
                    if (!issues.includes(issue)) {
                        issues.push(issue);
                    }
                    break;
                }
            }
        }

        return issues;
    },

    // ── Close Webview ──
    closeWebview() {
        // Try Messenger Extensions (if available)
        if (typeof MessengerExtensions !== 'undefined') {
            MessengerExtensions.requestCloseBrowser(
                function success() {},
                function error(err) { console.error('Messenger close error:', err); }
            );
        }
        // Try standard close
        window.close();
        
        // Mobile fallback tricks
        setTimeout(() => {
            // For iOS / generic webviews
            window.location.href = 'about:blank';
        }, 300);
        
        // Zalo / some other local webviews specific scheme hook if needed
        // but about:blank usually triggers the webview to close or reset
    },
};

// ── Shake Animation (injected via JS) ──
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
    }
`;
document.head.appendChild(shakeStyle);

// ── Keyboard support for text inputs ──
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        const active = document.activeElement;
        if (active && active.tagName === 'INPUT' && active.classList.contains('text-input')) {
            e.preventDefault();
            // Find the send button next to this input
            const sendBtn = active.closest('.input-group')?.querySelector('.send-btn');
            if (sendBtn) sendBtn.click();
        }
    }
});

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
    App.parseUrlParams();
    App.updateProgress();
    App.restoreState();
});
