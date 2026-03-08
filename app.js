/* ============================================
   BEVITA INTAKE FORM — Application Logic
   ============================================ */

// ── Configuration ──
const CONFIG = {
    // Các API keys đã được di chuyển sang cấu hình bảo mật Environment Variables trên Vercel
    // Front-end sẽ tương tác thông qua các thư mục /api ảo của severless server.
    MAX_IMAGE_SIZE: 1200, // Max width/height in px (resize before upload)
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
        Current_Routine: '',
        Routine_Photos: '',
        Health_Status: '',
        Supplements: '',
        Lifestyle_Sleep: '',
        Lifestyle_Stress: '',
        Budget: '',
        Note: '',
    },
    skinGoals: [],
    supplements: [],
    healthData: {},
    skinPhotoUrls: [],
    routinePhotoUrls: [],
    botPronoun: 'Mai',    // Mặc định ban đầu
    userPronoun: 'bạn',   // Mặc định ban đầu
    history: [],          // Lịch sử duyệt form
};

// ── Screen Flow ──
const FLOW = [
    'welcome',
    'name', 'age', 'location', 'skin', 'photo-skin',           // Step 1
    'cosmetics', 'spa',                                          // Step 2
    'routine',                                                   // Step 3
    'health-intro', 'menstrual', 'pregnancy', 'medical',         // Step 4
    'supplements', 'sleep', 'stress', 'budget',
    'thankyou',
];

const STEP_MAP = {
    'welcome': 0, 'name': 1, 'age': 1, 'location': 1, 'skin': 1, 'photo-skin': 1,
    'cosmetics': 2, 'spa': 2,
    'routine': 3,
    'health-intro': 4, 'menstrual': 4, 'pregnancy': 4, 'medical': 4,
    'supplements': 4, 'sleep': 4, 'stress': 4, 'budget': 4, 'budget-suggest': 4,
    'thankyou': 4,
};

const PROGRESS_MAP = {
    'welcome': 0, 'name': 5, 'age': 12, 'location': 20, 'skin': 28, 'photo-skin': 35,
    'cosmetics': 42, 'spa': 50,
    'routine': 58,
    'health-intro': 62, 'menstrual': 68, 'pregnancy': 73, 'medical': 78,
    'supplements': 83, 'sleep': 88, 'stress': 92, 'budget': 96, 'budget-suggest': 98,
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
            // Re-trigger animations
            nextEl.querySelectorAll('.animate-in').forEach(el => {
                el.style.animation = 'none';
                el.offsetHeight; // force reflow
                el.style.animation = '';
            });
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
        this.saveState();
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
                    Object.assign(state, parsedState);
                    this.populateUIFromState();
                    this.goToScreen(state.currentScreen, true);
                }
            }
        } catch (e) {
            console.error('Failed to restore form state', e);
        }
    },

    populateUIFromState() {
        // Text inputs
        if (state.data.Full_Name) {
            document.getElementById('inputName').value = state.data.Full_Name;
            document.getElementById('ageGreeting').textContent = `Cảm ơn ${state.data.Full_Name}`;
        }
        if (state.data.Phone_Number) document.getElementById('inputPhone').value = state.data.Phone_Number;
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
        if (state.skinPhotoUrls.length > 0) this.restorePhotosUI('skin', state.skinPhotoUrls);
        if (state.routinePhotoUrls.length > 0) this.restorePhotosUI('routine', state.routinePhotoUrls);
    },

    restorePhotosUI(type, urls) {
        const areaEl = document.getElementById(type === 'skin' ? 'skinPhotoArea' : 'routinePhotoArea');
        const previewsEl = document.getElementById(type === 'skin' ? 'skinPreviews' : 'routinePreviews');
        if (!areaEl || !previewsEl) return;
        
        areaEl.classList.add('has-photos');
        
        urls.forEach((url) => {
            const preview = document.createElement('div');
            preview.className = 'photo-preview';
            preview.innerHTML = `
                <button class="remove-btn" onclick="App.removePhoto(this, '${type}')">×</button>
                ${type === 'skin' ? '<div class="photo-check"></div>' : ''}
                <img src="${url}" alt="Preview">
            `;
            const uploadBtn = previewsEl.querySelector('.upload-btn') || previewsEl.lastElementChild;
            if (uploadBtn) {
                previewsEl.insertBefore(preview, uploadBtn);
            } else {
                previewsEl.appendChild(preview);
            }
        });
        
        if (type === 'skin' && urls.length > 0) {
            const nextBtn = document.getElementById('btnSkinPhotoNext');
            if (nextBtn) nextBtn.classList.remove('hidden');
        }
        
        this.showPhotoStatus(type, `✅ Đã khôi phục ${urls.length} ảnh`);
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

    // ── Welcome ──
    startForm() {
        this.goToScreen('name');
    },

    showLater() {
        this.goToScreen('later');
    },

    // ── Step 1: Tên & SĐT ──
    submitNameAndPhone() {
        const name = document.getElementById('inputName').value.trim();
        const phone = document.getElementById('inputPhone').value.trim();
        
        if (!name) {
            this.shakeInput('inputName');
            return;
        }
        if (!phone || !/^[0-9+]{9,15}$/.test(phone)) {
            this.shakeInput('inputPhone');
            return;
        }
        
        state.data.Full_Name = name;
        state.data.Phone_Number = phone;
        document.getElementById('ageGreeting').textContent = `Cảm ơn ${name}`;
        this.goToScreen('age');
    },

    // ── Step 1: Tuổi ──
    selectAge(value) {
        state.data.Age_Group = value;
        
        // Update pronouns based on age
        if (value === '35–42 tuổi' || value === 'Trên 42 tuổi') {
            state.botPronoun = 'em';
            state.userPronoun = 'chị';
        } else {
            state.botPronoun = 'chị';
            state.userPronoun = 'em';
        }
        
        this.updateDynamicTexts();
        this.highlightSelected(event.target);
        setTimeout(() => this.goToScreen('location'), 300);
    },

    // ── Update Pronouns System ──
    updateDynamicTexts() {
        // Prepare capitalized versions
        const botC = state.botPronoun.charAt(0).toUpperCase() + state.botPronoun.slice(1);
        const userC = state.userPronoun.charAt(0).toUpperCase() + state.userPronoun.slice(1);

        document.querySelectorAll('.dynamic-text').forEach(el => {
            let template = el.dataset.template;
            if (template) {
                // Replace placeholders
                template = template
                    .replace(/{bot}/g, state.botPronoun)
                    .replace(/{botC}/g, botC)
                    .replace(/{user}/g, state.userPronoun)
                    .replace(/{userC}/g, userC);
                el.innerHTML = template;
            }
        });
    },

    // ── Step 1: Location ──
    selectLocation(value) {
        state.data.Location = value;
        this.highlightSelected(event.target);
        setTimeout(() => this.goToScreen('skin'), 300);
    },

    submitLocation() {
        const loc = document.getElementById('inputLocation').value.trim();
        if (!loc) {
            this.shakeInput('inputLocation');
            return;
        }
        state.data.Location = loc;
        this.goToScreen('skin');
    },

    // ── Step 1: Skin Condition (multi-select) ──
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
        state.data.Skin_Condition = state.skinGoals.join(', ');
        this.goToScreen('photo-skin');
    },

    // ── Step 1: Skin Photos ──
    async handleSkinPhotos(files) {
        await this.processPhotos(files, 'skin');
    },

    skipSkinPhotos() {
        this.goToScreen('cosmetics');
    },

    submitSkinPhotos() {
        if (state.skinPhotoUrls.length === 0) return;
        state.data.Skin_Photos = state.skinPhotoUrls.join(', ');
        this.goToScreen('cosmetics');
    },



    // ── Step 2: Cosmetics ──
    selectCosmetics(value) {
        state.data.History_Cosmetics = value;
        this.highlightSelected(event.target);

        // Flag kem trộn
        if (value.includes('kem trộn')) {
            state.data.Text = (state.data.Text ? state.data.Text + '; ' : '') + 'FLAG: cream_mixed';
        }

        setTimeout(() => {
            this.goToScreen('spa');
        }, 300);
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



    // ── Step 2: Spa ──
    selectSpa(value) {
        state.data.History_Spa = value;
        this.highlightSelected(event.target);
        setTimeout(() => this.goToScreen('routine'), 300);
    },

    submitSpaText() {
        const val = document.getElementById('inputSpa').value.trim();
        if (!val) {
            this.shakeInput('inputSpa');
            return;
        }
        state.data.History_Spa = val;
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
        this.goToScreen('budget');
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
            else if (type === 'pregnancy') this.goToScreen('medical');
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
        setTimeout(() => this.submitForm(), 300);
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

        // Show loading
        document.getElementById('loadingOverlay').classList.add('active');

        try {
            // Build payload — only include fields that exist in NocoDB
            // Note: Phone_Number is the display/primary field in NocoDB
            const payload = {
                Phone_Number: state.data.Phone_Number,
                Full_Name: state.data.Full_Name,
                Age_Group: state.data.Age_Group,
                Location: state.data.Location,
                Skin_Condition: state.data.Skin_Condition,
                History_Cosmetics: state.data.History_Cosmetics,
                History_Spa: state.data.History_Spa,
                Current_Routine: state.data.Current_Routine,
                Supplements: state.data.Supplements || null,
                Lifestyle_Sleep: state.data.Lifestyle_Sleep || null,
                Lifestyle_Stress: state.data.Lifestyle_Stress || null,
                Budget: state.data.Budget || null,
                Status: 'new',
                Health_Status: healthText || null,
                Note: state.data.Note || null,
                Submission_Date: now.toISOString(),
            };

            // Only add URL fields if they have values (NocoDB URL type rejects empty strings)
            if (state.data.Skin_Photos) payload.Skin_Photos = state.data.Skin_Photos;
            if (state.data.Routine_Photos) payload.Routine_Photos = state.data.Routine_Photos;

            console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
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
        this.goToScreen('thankyou');
    },

    // ── Photo Processing ──
    async processPhotos(files, type) {
        let currentUrls = type === 'skin' ? state.skinPhotoUrls : state.routinePhotoUrls;
        const maxLimit = type === 'skin' ? 3 : 5;

        if (currentUrls.length + files.length > maxLimit) {
            alert(`Chỉ được tải lên tối đa ${maxLimit} ảnh`);
            return;
        }

        const areaEl = document.getElementById(type === 'skin' ? 'skinPhotoArea' : 'routinePhotoArea');
        const previewsEl = document.getElementById(type === 'skin' ? 'skinPreviews' : 'routinePreviews');
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
                    <button class="remove-btn" onclick="App.removePhoto(this, '${type}')">×</button>
                    ${type === 'skin' ? '<div class="photo-check"></div>' : ''}
                    <img src="${e.target.result}" alt="Preview">
                `;
                previewsEl.insertBefore(preview, loader);
            };
            reader.readAsDataURL(file);

            // Upload to ImgBB
            try {
                const url = await this.uploadToImgBB(file);
                if (type === 'skin') {
                    state.skinPhotoUrls.push(url);
                } else {
                    state.routinePhotoUrls.push(url);
                }
            } catch (err) {
                console.error('Upload error:', err);
                uploadErrors++;
            }
        }

        if (loader) loader.remove();
        uploadLabel.style.display = 'inline-flex';

        // Check length and toggle Next buttons
        const count = type === 'skin' ? state.skinPhotoUrls.length : state.routinePhotoUrls.length;

        if (type === 'skin' && count > 0) {
            const nextBtn = document.getElementById('btnSkinPhotoNext');
            if (nextBtn) {
                nextBtn.classList.remove('hidden');
                nextBtn.classList.add('animate-in');
            }
        }

        if (uploadErrors > 0) {
            this.showPhotoStatus(type, `⚠️ Lỗi tải lên ${uploadErrors} ảnh. Vui lòng check F12 Console hoặc F5 thử lại.`);
        } else {
            this.showPhotoStatus(type, `✅ Đã tải lên ${count} ảnh`);
        }
    },

    showPhotoStatus(type, message) {
        const areaEl = document.getElementById(type === 'skin' ? 'skinPhotoArea' : 'routinePhotoArea');
        let statusEl = areaEl.querySelector('.photo-status');
        if (!statusEl) {
            statusEl = document.createElement('p');
            statusEl.className = 'photo-status';
            areaEl.appendChild(statusEl);
        }
        statusEl.textContent = message;
    },

    removePhoto(btn, type) {
        const previewEl = btn.closest('.photo-preview');
        // Handle indexing differently for skin/routine preview structure vs array state
        // This is safe since array matches UI sequentially, just filter correctly
        const index = Array.from(previewEl.parentNode.children).indexOf(previewEl);
        previewEl.remove();

        if (type === 'skin') {
            state.skinPhotoUrls.splice(index, 1);
            if (state.skinPhotoUrls.length === 0) {
                const nextBtn = document.getElementById('btnSkinPhotoNext');
                if (nextBtn) nextBtn.classList.add('hidden');
                document.getElementById('skinPhotoArea').classList.remove('has-photos');
            }
        } else {
            state.routinePhotoUrls.splice(index, 1);
            if (state.routinePhotoUrls.length === 0) {
                document.getElementById('routinePhotoArea').classList.remove('has-photos');
            }
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
    App.updateProgress();
    App.restoreState();
});
