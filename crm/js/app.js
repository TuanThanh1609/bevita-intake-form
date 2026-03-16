/* ============================================
   BEVITA CRM — Dashboard Logic
   ============================================ */

const CRM = {
    // Configuration - Replace with your NocoDB config
    config: {
        apiUrl: '/api/crm',
        tableId: 'muwldo248riapzx', // Same as main app
        refreshInterval: 30000, // 30 seconds
    },

    // State
    state: {
        leads: [],
        currentTab: 'leads',
        selectedLead: null,
    },

    // ── Initialization ──
    async init() {
        console.log('🚀 Initializing CRM Dashboard...');
        this.initTheme();
        await this.loadLeads();
        this.startAutoRefresh();
        this.setupEventListeners();
    },

    // ── Data Loading ──
    async loadLeads() {
        try {
            // For demo, use mock data if API not available
            // In production, fetch from NocoDB
            console.log('Fetching leads from API...');
            const response = await fetch('/api/crm/leads');

            console.log('API response status:', response.status);

            if (!response.ok) {
                throw new Error('API not available: ' + response.status);
            }

            const data = await response.json();
            console.log('API data received:', data);

            // Use API data if available, otherwise fallback to mock
            if (data.list && data.list.length > 0) {
                this.state.leads = data.list;
                console.log('Loaded', data.list.length, 'leads from API');
            } else {
                console.log('No leads from API, using mock data');
                this.state.leads = this.getMockLeads();
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            console.log('Using mock data for demo:', error.message);
            // Mock data for demonstration
            this.state.leads = this.getMockLeads();
        }

        this.renderMetrics();
        this.renderLeadsTable();
        console.log('✅ CRM: Rendered', this.state.leads.length, 'leads');
    },

    getMockLeads() {
        return [
            {
                Id: 1,
                Full_Name: 'Nguyễn Thị Hoa',
                Phone_Number: '0912345678',
                Age_Group: '25-34',
                Skin_Condition: ['Mụn', 'Da xỉn'],
                Location: 'TP.HCM',
                nguon: 'Zalo OA',
                trang_thai: 'Mới tiếp nhận',
                current_step: 1,
                step_status: 'dang_xu_ly',
                last_response: new Date(Date.now() - 5 * 60000).toISOString(),
                created: new Date(Date.now() - 30 * 60000).toISOString(),
            },
            {
                Id: 2,
                Full_Name: 'Trần Minh Châu',
                Phone_Number: '0987654321',
                Age_Group: '35-42',
                Skin_Condition: ['Nám'],
                Location: 'Hà Nội',
                nguon: 'Facebook Ads',
                trang_thai: 'Đang tư vấn',
                current_step: 3,
                step_status: 'dang_xu_ly',
                last_response: new Date(Date.now() - 15 * 60000).toISOString(),
                created: new Date(Date.now() - 2 * 3600000).toISOString(),
            },
            {
                Id: 3,
                Full_Name: 'Lê Thùy Dung',
                Phone_Number: '0934567890',
                Age_Group: 'Trên 42',
                Skin_Condition: ['Lão hóa', 'Nám'],
                Location: 'Đà Nẵng',
                nguon: 'Referral',
                trang_thai: 'Đang tư vấn',
                current_step: 5,
                step_status: 'hoan_thanh',
                last_response: new Date(Date.now() - 20 * 60000).toISOString(),
                created: new Date(Date.now() - 24 * 3600000).toISOString(),
            },
            {
                Id: 4,
                Full_Name: 'Phạm Lan Anh',
                Phone_Number: '0978123456',
                Age_Group: 'Dưới 25',
                Skin_Condition: ['Mụn'],
                Location: 'TP.HCM',
                nguon: 'Google Ads',
                trang_thai: 'Chờ KH phản hồi',
                current_step: 2,
                step_status: 'cho',
                last_response: new Date(Date.now() - 15 * 3600000).toISOString(),
                created: new Date(Date.now() - 20 * 3600000).toISOString(),
            },
            {
                Id: 5,
                Full_Name: 'Vũ Quỳnh Trang',
                Phone_Number: '0965123456',
                Age_Group: '30-42',
                Skin_Condition: ['Nám', 'Lão hóa'],
                Location: 'Hà Nội',
                nguon: 'Walk-in',
                trang_thai: 'Đang tư vấn',
                current_step: 5,
                step_status: 'hoan_thanh',
                last_response: new Date(Date.now() - 30 * 60000).toISOString(),
                created: new Date(Date.now() - 48 * 3600000).toISOString(),
            },
            {
                Id: 6,
                Full_Name: 'Đỗ Thanh Hà',
                Phone_Number: '0911988777',
                Age_Group: '35-42',
                Skin_Condition: ['Da xỉn'],
                Location: 'TP.HCM',
                nguon: 'Zalo OA',
                trang_thai: 'Đã tư vấn, chưa mua',
                current_step: 7,
                step_status: 'hoan_thanh',
                last_response: new Date(Date.now() - 5 * 3600000).toISOString(),
                created: new Date(Date.now() - 72 * 3600000).toISOString(),
            },
            {
                Id: 7,
                Full_Name: 'Hoàng Thị Mai',
                Phone_Number: '0944567890',
                Age_Group: '25-34',
                Skin_Condition: ['Mụn', 'Da xỉn'],
                Location: 'TP.HCM',
                nguon: 'Facebook Ads',
                trang_thai: 'Đã mua',
                current_step: 7,
                step_status: 'hoan_thanh',
                last_response: new Date(Date.now() - 1 * 3600000).toISOString(),
                created: new Date(Date.now() - 168 * 3600000).toISOString(),
            },
        ];
    },

    // ── Render Functions ──
    renderMetrics() {
        const leads = this.state.leads;
        const today = new Date().toDateString();

        // Leads today
        const leadsToday = leads.filter(l => {
            const created = new Date(l.created || l.CreatedAt).toDateString();
            return created === today;
        }).length;

        // Auto rate (leads with nhucau from URL - simulated)
        const autoRate = leads.length > 0 ? Math.round((leads.filter(l => l.nhucau || l.nguon === 'Facebook Ads').length / leads.length) * 100) : 0;

        // Follow-up active
        const followUpActive = leads.filter(l => l.follow_up_status === 'active').length;

        // Waiting reply (more than 1 hour without response)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const waitingReply = leads.filter(l => {
            const lastResponse = new Date(l.last_response || l.UpdatedAt);
            return lastResponse < oneHourAgo && l.trang_thai !== 'Đã chốt';
        }).length;

        // Update DOM
        document.getElementById('leadsToday').textContent = leadsToday;
        document.getElementById('autoRate').textContent = autoRate + '%';
        document.getElementById('followUpActive').textContent = followUpActive || 12;
        document.getElementById('waitingReply').textContent = waitingReply || 5;
    },

    renderLeadsTable() {
        const leads = this.state.leads;
        const container = document.getElementById('tableContent');

        if (leads.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <div class="empty-title">Chưa có leads nào</div>
                    <div class="empty-desc">Dữ liệu sẽ được đồng bộ từ Chatbot</div>
                </div>
            `;
            return;
        }

        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Khách hàng</th>
                        <th>Nguồn</th>
                        <th>Giai đoạn</th>
                        <th>Bước</th>
                        <th>Thiếu data</th>
                        <th>Phản hồi cuối</th>
                    </tr>
                </thead>
                <tbody>
                    ${leads.map(lead => this.renderLeadRow(lead)).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
        document.getElementById('totalLeads').textContent = `(${leads.length})`;
        console.log('✅ Rendered leads table with', leads.length, 'rows');
    },

    renderLeadRow(lead) {
        const name = lead.Full_Name || 'Chưa có tên';
        const phone = lead.Phone_Number || '';
        const source = lead.nguon || 'Messenger';
        const stage = lead.trang_thai || 'Mới tiếp nhận';
        const step = this.getEffectiveCurrentStep(lead);
        const lastResponse = this.formatTimeAgo(lead.last_response || lead.UpdatedAt);

        // Missing data
        const missing = [];
        if (!lead.Skin_Condition || lead.Skin_Condition.length === 0) missing.push('Hình da');
        if (!lead.Budget) missing.push('Ngân sách');
        if (!lead.Phone_Number) missing.push('SĐT');

        // Source badge class
        const sourceClass = source.toLowerCase().includes('zalo') ? 'zalo' :
                           source.toLowerCase().includes('facebook') ? 'facebook' : 'website';

        // Status class
        const statusClass = stage.includes('Mới') ? 'new' :
                           stage.includes('Khảo') ? 'survey' :
                           stage.includes('Đang') ? 'consulting' :
                           stage.includes('Chờ') ? 'waiting' : 'closed';

        const stepPercent = Math.round((step / 8) * 100);

        return `
            <tr onclick="CRM.showLeadDetail(${lead.Id})" style="cursor: pointer;">
                <td>
                    <div class="customer-cell">
                        <div class="customer-name">${name}</div>
                        <div class="customer-phone">${phone}</div>
                    </div>
                </td>
                <td>
                    <span class="source-badge ${sourceClass}">${source}</span>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${stage}</span>
                </td>
                <td>
                    <div class="step-progress">
                        <div class="step-bar">
                            <div class="step-fill" style="width: ${stepPercent}%"></div>
                        </div>
                        <span class="step-text">${step}/7</span>
                    </div>
                </td>
                <td>
                    <div class="missing-data">
                        ${missing.length > 0 ? missing.map(m => `<span class="missing-tag">${m}</span>`).join('') : '<span style="color: var(--accent)">✓ Đủ</span>'}
                    </div>
                </td>
                <td>
                    <span class="time-cell ${this.isRecent(lead.last_response) ? 'recent' : ''}">${lastResponse}</span>
                </td>
            </tr>
        `;
    },

    // ── Lead Detail ──
    async showLeadDetail(leadId) {
        const lead = this.state.leads.find(l => l.Id === leadId);
        if (!lead) return;

        const effectiveStep = this.getEffectiveCurrentStep(lead);
        const leadForView = { ...lead, current_step: effectiveStep };

        this.state.selectedLead = leadForView;
        const modal = document.getElementById('leadModal');
        const content = document.getElementById('leadModalContent');

        const stepPercent = Math.round((effectiveStep || 1) / 8 * 100);
        // Clean up skin issues display
        const skinIssues = Array.isArray(leadForView.Skin_Condition) 
            ? leadForView.Skin_Condition.join(' / ') 
            : (leadForView.Skin_Condition || 'Chưa xác định');

        content.innerHTML = `
            <div class="lead-detail">
                <div class="lead-main">
                    <!-- Header -->
                    <div class="detail-header">
                        <h2>${leadForView.Full_Name || 'Khách hàng'}</h2>
                        <div class="detail-meta">
                            <span>📱 ${leadForView.Phone_Number || '09xx xxx xxx'}</span>
                            <span>📍 ${leadForView.Location || 'Chưa cập nhật'}</span>
                            <span>📅 Tạo: ${this.formatDate(leadForView.created || leadForView.CreatedAt)}</span>
                        </div>
                        
                        <div class="progress-container">
                            <div class="progress-track">
                                <div class="progress-fill" style="width: ${stepPercent}%"></div>
                            </div>
                            <div class="progress-labels">
                                <span>Tiến trình: ${effectiveStep || 1}/8 bước</span>
                                <strong>${effectiveStep >= 8 ? 'Hoàn thành' : (effectiveStep >= 6 ? 'Chờ Gửi Phác Đồ' : 'Đang thực hiện')}</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Steps -->
                    <div class="steps-list">
                        ${this.renderStepList(leadForView)}
                    </div>
                </div>

                <!-- Right Sidebar -->
                <div class="lead-sidebar">
                    <!-- Actions -->
                    <div class="sidebar-card">
                        <div class="sidebar-title">
                            <i>🔜</i> Hành động tiếp theo
                        </div>
                        ${this.renderActionSuggestions(leadForView)}
                        <div class="action-grid">
                            <div class="action-btn" onclick="CRM.callLead(${leadForView.Id})">
                                <span class="action-icon">📞</span>
                                Gọi điện
                            </div>
                            <div class="action-btn" onclick="CRM.messageLead(${leadForView.Id})">
                                <span class="action-icon">💬</span>
                                Nhắn tin
                            </div>
                            <div class="action-btn" onclick="CRM.scheduleMeeting(${leadForView.Id})">
                                <span class="action-icon">📅</span>
                                Hẹn lịch
                            </div>
                        </div>
                        <div class="action-btn full" onclick="CRM.addNote(${leadForView.Id})">
                            <span class="action-icon">📝</span>
                            Ghi chú
                        </div>
                    </div>

                    <!-- Customer Info -->
                    <div class="sidebar-card">
                        <div class="sidebar-title">
                            <i>👤</i> Thông tin khách hàng
                        </div>
                        <div class="info-list">
                            <div class="info-item">
                                <span class="info-label">Độ tuổi</span>
                                <span class="info-value">${leadForView.Age_Group || 'Dưới 25 tuổi'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Vấn đề da</span>
                                <span class="info-value">${skinIssues}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Ngân sách</span>
                                <span class="info-value">${leadForView.Budget || '2-5 triệu / tháng'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Nguồn</span>
                                <span class="info-value">${leadForView.nguon || 'Facebook Ads'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Support Team -->
                    <div class="sidebar-card">
                        <div class="sidebar-title">
                            <i>👥</i> Đội ngũ hỗ trợ
                        </div>
                        <div class="team-list">
                            <div class="team-item">
                                <div class="team-avatar">A</div>
                                <div class="team-info">
                                    <div class="team-name">Nguyễn Văn A</div>
                                    <div class="team-role">Tư vấn viên</div>
                                </div>
                            </div>
                            <div class="team-item">
                                <div class="team-avatar">B</div>
                                <div class="team-info">
                                    <div class="team-name">Trần Thị B</div>
                                    <div class="team-role">Coach</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
    },

    toggleStep(stepId) {
        const step = document.getElementById(`step-${stepId}`);
        if (step) {
            step.classList.toggle('expanded');
        }
    },

    renderStepList(lead) {
        // B0-B5: Thu thập data từ Chatbot
        // B6: Chờ Consultant gửi Phác đồ
        // B7: Hoàn thành (đã gửi phác đồ)
        const steps = [
            { id: 1, name: 'Nhận diện nhu cầu', icon: '🎯', desc: 'B0' },
            { id: 2, name: 'Thông tin cơ bản + Hình da', icon: '👤', desc: 'B1' },
            { id: 3, name: 'Mỹ phẩm & Dịch vụ làm đẹp', icon: '💄', desc: 'B2' },
            { id: 4, name: 'Sức khỏe', icon: '🏥', desc: 'B3' },
            { id: 5, name: 'Ngân sách', icon: '💰', desc: 'B4' },
            { id: 6, name: 'Xác nhận SĐT & Kết nối', icon: '📞', desc: 'B5' },
            { id: 7, name: 'Chờ Gửi Phác Đồ', icon: '⏳', desc: 'B6', isConsultantStep: true },
            { id: 8, name: 'Hoàn thành', icon: '✅', desc: 'B7', isFinal: true },
        ];

        return steps.map((step, index) => {
            const currentStep = lead.current_step || 1;
            const isActive = step.id === currentStep;
            const isExpanded = isActive || index === 0;

            // B6 (id=7) là bước consultant gửi phác đồ
            // B7 (id=8) là hoàn thành sau khi đã gửi phác đồ
            let statusKey;
            if (step.isFinal) {
                // B7: Hoàn thành chỉ khi đã có phác đồ (current_step >= 8)
                statusKey = currentStep >= 8 ? 'hoan_thanh' : 'cho';
            } else if (step.isConsultantStep) {
                // B6: Mặc định là "Chờ Gửi Phác Đồ"
                statusKey = currentStep >= 8 ? 'hoan_thanh' : (isActive ? 'dang_xu_ly' : (currentStep > step.id ? 'hoan_thanh' : 'cho'));
            } else {
                // B0-B5: Theo logic cũ
                statusKey = step.id < currentStep ? 'hoan_thanh' : (isActive ? (lead.step_status || 'dang_xu_ly') : 'cho');
            }

            const statusText = this.getStepStatusText(statusKey, step.isConsultantStep);
            const isCompleted = statusKey === 'hoan_thanh';

            const statusClass = isCompleted ? 'completed' : '';
            const icon = isCompleted ? '✓' : step.icon;

            const stepLabel = step.desc || `B${step.id - 1}`;
            const filledCount = this.countStepFilled(step.id, lead);
            const metaText = step.isConsultantStep ? (currentStep >= 8 ? 'Đã gửi' : 'Chờ consultant') : `${filledCount} dữ liệu`;

            return `
                <div class="step-item ${statusClass} ${isExpanded ? 'expanded' : ''}" id="step-${step.id}">
                    <div class="step-header" onclick="CRM.toggleStep(${step.id})">
                        <div class="step-title-group">
                            <div class="step-icon">${icon}</div>
                            <div class="step-info">
                                <div class="step-name">${stepLabel}: ${step.name}</div>
                                <div class="step-meta">
                                    <span>• ${metaText}</span>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span class="step-status-badge">${this.escapeHtml(statusText)}</span>
                            <span class="step-toggle">▼</span>
                        </div>
                    </div>
                    <div class="step-content">
                        ${this.renderChatContent(step.id, lead)}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderChatContent(stepId, lead) {
        const name = this.escapeHtml(lead.Full_Name || 'Khách hàng');
        const phone = this.escapeHtml(lead.Phone_Number || 'Chưa có');
        const age = this.escapeHtml(lead.Age_Group || 'Chưa có');
        const location = this.escapeHtml(lead.Location || 'Chưa có');
        const skinConditions = this.escapeHtml(this.normalizeMulti(lead.Skin_Condition).join(' / ') || 'Chưa có');
        const need = this.escapeHtml(lead.nhucau || this.normalizeMulti(lead.Skin_Condition)[0] || 'Chưa xác định');

        if (stepId === 1) {
            return `
                <div class="chat-container">
                    <div class="chat-message system">
                        <div class="chat-header">
                            <span>🤖 HỆ THỐNG</span>
                            <span class="chat-time">${this.formatTimeOnly(lead.created || lead.CreatedAt)}</span>
                        </div>
                        <div>
                            AI nhận diện: Nhu cầu = <b>${need}</b><br>
                            Vấn đề da: <b>${skinConditions}</b>
                        </div>
                    </div>
                    <div class="chat-message user">
                        <div class="chat-avatar user">KH</div>
                        <div class="chat-bubble">
                            <div class="chat-header">
                                <span>${name}</span>
                                <span class="chat-time">${this.formatTimeOnly(lead.created || lead.CreatedAt)}</span>
                            </div>
                            Chào shop, mình muốn tư vấn về ${need} ạ.
                        </div>
                    </div>
                </div>
            `;
        }

        if (stepId === 2) {
            const photos = [
                ...this.splitUrls(lead.Skin_Photos),
                ...this.splitUrls(lead.Skin_photo_2),
                ...this.splitUrls(lead.Skin_photo_3),
            ].filter(Boolean);

            const photoGrid = photos.length
                ? `<div class="photo-grid">
                        ${photos.slice(0, 6).map(url => `<div class="photo-item"><img src="${this.escapeAttr(url)}" alt="Skin photo" loading="lazy"></div>`).join('')}
                   </div>`
                : '';

            const missing = [];
            if (!lead.Age_Group) missing.push('Tuổi');
            if (!lead.Location) missing.push('Tỉnh/thành');
            if (photos.length < 3) missing.push('Hình da mặt 3 góc');

            const collected = [
                lead.Age_Group ? `Tuổi (${lead.Age_Group})` : null,
                lead.Location ? `Tỉnh/thành (${lead.Location})` : null,
                photos.length ? `Hình da (${photos.length} ảnh)` : null,
            ].filter(Boolean).join(', ') || 'Chưa có';

            return `
                <div class="chat-container">
                    <div class="chat-message agent">
                        <div class="chat-avatar agent">M</div>
                        <div class="chat-bubble">
                            <div class="chat-header">
                                <span>Skin Coach</span>
                                <span class="chat-time">${this.formatTimeOnly(lead.created || lead.CreatedAt)}</span>
                            </div>
                            Bạn giúp mình gửi thông tin nhé:<br>
                            • Độ tuổi<br>
                            • Tỉnh/thành<br>
                            • Hình ảnh da mặt 3 góc (trái, phải, chính diện)
                        </div>
                    </div>
                    <div class="chat-message user">
                        <div class="chat-avatar user">KH</div>
                        <div class="chat-bubble">
                            <div class="chat-header">
                                <span>${name}</span>
                                <span class="chat-time">${this.formatTimeOnly(lead.UpdatedAt || lead.updated || lead.last_response)}</span>
                            </div>
                            <div class="kv">
                                <div class="k">Độ tuổi</div><div class="v">${age}</div>
                                <div class="k">Tỉnh/thành</div><div class="v">${location}</div>
                                <div class="k">Vấn đề da</div><div class="v">${skinConditions}</div>
                            </div>
                            ${photoGrid}
                        </div>
                    </div>
                    <div class="chat-message system">
                        <div class="chat-header">
                            <span>🤖 HỆ THỐNG</span>
                            <span class="chat-time">${this.formatTimeOnly(lead.UpdatedAt || lead.updated || lead.last_response)}</span>
                        </div>
                        <div>
                            ✅ Đã thu thập: ${this.escapeHtml(collected)}<br>
                            ${missing.length ? `⏳ Thiếu: ${this.escapeHtml(missing.join(', '))}` : '✅ Đủ dữ liệu bước này'}
                        </div>
                    </div>
                </div>
            `;
        }

        if (stepId === 3) {
            const cosmetics = this.escapeHtml(lead.History_Cosmetics || 'Chưa có');
            const spa = this.escapeHtml(lead.History_Spa || 'Chưa có');
            const spaService = this.escapeHtml(lead.History_Spa_Service || 'Chưa có');
            const spaResults = this.escapeHtml(lead.History_Spa_Results || 'Chưa có');

            return `
                <div class="chat-container">
                    <div class="chat-message system">
                        <div class="chat-header">
                            <span>🤖 HỆ THỐNG</span>
                            <span class="chat-time">${this.formatTimeOnly(lead.UpdatedAt || lead.last_response)}</span>
                        </div>
                        <div class="kv">
                            <div class="k">Lịch sử mỹ phẩm</div><div class="v">${cosmetics}</div>
                            <div class="k">Lịch sử spa</div><div class="v">${spa}</div>
                            <div class="k">Liệu trình</div><div class="v">${spaService}</div>
                            <div class="k">Kết quả</div><div class="v">${spaResults}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (stepId === 4) {
            const health = this.escapeHtml(lead.Health_Status || 'Chưa có');
            const supplements = this.escapeHtml(lead.Supplements || 'Chưa có');
            const sleep = this.escapeHtml(lead.Lifestyle_Sleep || 'Chưa có');
            const stress = this.escapeHtml(lead.Lifestyle_Stress || 'Chưa có');

            return `
                <div class="chat-container">
                    <div class="chat-message system">
                        <div class="chat-header">
                            <span>🤖 HỆ THỐNG</span>
                            <span class="chat-time">${this.formatTimeOnly(lead.UpdatedAt || lead.last_response)}</span>
                        </div>
                        <div class="kv">
                            <div class="k">Tình trạng sức khỏe</div><div class="v">${health}</div>
                            <div class="k">Thực phẩm chức năng</div><div class="v">${supplements}</div>
                            <div class="k">Giấc ngủ</div><div class="v">${sleep}</div>
                            <div class="k">Mức độ stress</div><div class="v">${stress}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (stepId === 5) {
            const budget = this.escapeHtml(lead.Budget || 'Chưa có');
            return `
                <div class="chat-container">
                    <div class="chat-message system">
                        <div class="chat-header">
                            <span>🤖 HỆ THỐNG</span>
                            <span class="chat-time">${this.formatTimeOnly(lead.UpdatedAt || lead.last_response)}</span>
                        </div>
                        <div class="kv">
                            <div class="k">Ngân sách</div><div class="v">${budget}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (stepId === 6) {
            const channel = this.escapeHtml(lead.nguon || 'Chưa có');
            return `
                <div class="chat-container">
                    <div class="chat-message system">
                        <div class="chat-header">
                            <span>🤖 HỆ THỐNG</span>
                            <span class="chat-time">${this.formatTimeOnly(lead.UpdatedAt || lead.last_response)}</span>
                        </div>
                        <div class="kv">
                            <div class="k">Số điện thoại</div><div class="v">${phone}</div>
                            <div class="k">Kênh</div><div class="v">${channel}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // B6 - Consultant step: Form nhập phác đồ
        if (stepId === 7) {
            const hasPhacDo = lead.phac_do && lead.phac_do.length > 0;
            const phacDo = this.escapeHtml(lead.phac_do || '');
            const daGui = lead.current_step >= 8;

            return `
                <div class="chat-container">
                    <div class="chat-message system">
                        <div class="chat-header">
                            <span>👩‍⚕️ CONSULTANT</span>
                            <span class="chat-time">${daGui ? this.formatTimeOnly(lead.phac_do_sent_at) : 'Chờ tạo'}</span>
                        </div>
                        ${daGui ? `
                            <div style="background: #E8F5E9; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                                <strong>✅ Đã gửi phác đồ</strong>
                            </div>
                            <div class="kv">
                                <div class="k">Phác đồ</div><div class="v">${phacDo}</div>
                            </div>
                        ` : `
                            <div style="background: #FFF3E0; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                                <strong>⏳ Chờ Consultant tạo và gửi phác đồ</strong>
                            </div>
                            <button class="btn-primary" onclick="CRM.openPhacDoForm(${lead.Id})" style="width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                                📝 Tạo Phác Đồ
                            </button>
                        `}
                    </div>
                </div>
            `;
        }

        const routine = this.escapeHtml(lead.Current_Routine || 'Chưa có');
        const routinePhotos = this.splitUrls(lead.Routine_Photos);
        const routineGrid = routinePhotos.length
            ? `<div class="photo-grid">
                    ${routinePhotos.slice(0, 6).map(url => `<div class="photo-item"><img src="${this.escapeAttr(url)}" alt="Routine photo" loading="lazy"></div>`).join('')}
               </div>`
            : '';

        const note = this.escapeHtml(lead.tu_van_vien_notes || lead.Note || 'Chưa có');

        return `
            <div class="chat-container">
                <div class="chat-message system">
                    <div class="chat-header">
                        <span>🤖 HỆ THỐNG</span>
                        <span class="chat-time">${this.formatTimeOnly(lead.UpdatedAt || lead.last_response)}</span>
                    </div>
                    <div class="kv">
                        <div class="k">Routine hiện tại</div><div class="v">${routine}</div>
                        <div class="k">Ghi chú</div><div class="v">${note}</div>
                    </div>
                    ${routineGrid}
                </div>
            </div>
        `;
    },

    // ── Actions ──
    closeModal() {
        document.getElementById('leadModal').classList.remove('active');
        // Close phac do form if open
        const phacDoModal = document.getElementById('phacDoModal');
        if (phacDoModal) phacDoModal.classList.remove('active');
    },

    openPhacDoForm(leadId) {
        const lead = this.state.leads.find(l => l.Id === leadId);
        if (!lead) return;

        // Create modal if not exists
        let modal = document.getElementById('phacDoModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'phacDoModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <div class="modal-title">📝 Tạo Phác Đồ Cho ${this.escapeHtml(lead.Full_Name || 'Khách hàng')}</div>
                    <button class="modal-close" onclick="CRM.closeModal()">×</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <strong>📋 Thông tin khách hàng:</strong><br>
                        <span style="font-size: 13px;">
                        • Tuổi: ${lead.Age_Group || 'Chưa có'}<br>
                        • Vấn đề da: ${this.normalizeMulti(lead.Skin_Condition).join(', ') || 'Chưa có'}<br>
                        • Nhu cầu: ${lead.nhucau || 'Chưa có'}<br>
                        • Ngân sách: ${lead.Budget || 'Chưa có'}
                        </span>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Mức độ nghiêm trọng (Severity):</label>
                        <select id="phacDoSeverity" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                            <option value="1">Mức 1 - Nhẹ</option>
                            <option value="2">Mức 2 - Trung bình</option>
                            <option value="3" selected>Mức 3 - Nặng</option>
                            <option value="4">Mức 4 - Rất nặng</option>
                            <option value="5">Mức 5 - Nghiêm trọng</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Chẩn đoán:</label>
                        <textarea id="phacDoDiagnosis" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; resize: vertical;" placeholder="Nhập chẩn đoán da..."></textarea>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Phác đồ điều trị:</label>
                        <textarea id="phacDoTreatment" rows="6" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; resize: vertical;" placeholder="1. Phục hồi da barrier (4-6 tuần)
2. Giảm melanin từ từ
3. Duy trì ổn định
..."></textarea>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Sản phẩm đề xuất:</label>
                        <textarea id="phacDoProducts" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; resize: vertical;" placeholder="Nhập sản phẩm đề xuất..."></textarea>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="phacDoSendZalo" checked style="width: 18px; height: 18px;">
                            <span>Gửi tin nhắn Zalo cho khách hàng</span>
                        </label>
                    </div>

                    <button onclick="CRM.submitPhacDo(${lead.Id})" style="width: 100%; padding: 14px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
                        ✅ Gửi Phác Đồ
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    },

    async submitPhacDo(leadId) {
        const severity = document.getElementById('phacDoSeverity').value;
        const diagnosis = document.getElementById('phacDoDiagnosis').value;
        const treatment = document.getElementById('phacDoTreatment').value;
        const products = document.getElementById('phacDoProducts').value;
        const sendZalo = document.getElementById('phacDoSendZalo').checked;

        if (!treatment) {
            alert('Vui lòng nhập phác đồ điều trị!');
            return;
        }

        const phacDo = `Mức độ: ${severity}\n\nChẩn đoán: ${diagnosis}\n\nPhác đồ điều trị:\n${treatment}\n\nSản phẩm đề xuất:\n${products}`;

        try {
            const response = await fetch('/api/crm/phacdo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Id: leadId,
                    phac_do: phacDo,
                    phac_do_severity: severity,
                    phac_do_diagnosis: diagnosis,
                    phac_do_treatment: treatment,
                    phac_do_products: products,
                    phac_do_sent_at: new Date().toISOString(),
                    send_zalo: sendZalo,
                    current_step: 8 // Move to B7 - Hoàn thành
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Đã gửi phác đồ thành công!');
                this.closeModal();
                // Reload data
                this.loadLeads();
            } else {
                alert('❌ Lỗi: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting phac do:', error);
            alert('❌ Có lỗi xảy ra!');
        }
    },

    callLead(leadId) {
        const lead = this.state.leads.find(l => l.Id === leadId);
        if (lead && lead.Phone_Number) {
            window.open(`tel:${lead.Phone_Number}`);
        }
    },

    messageLead(leadId) {
        const lead = this.state.leads.find(l => l.Id === leadId);
        if (lead && lead.Phone_Number) {
            window.open(`https://zalo.me/${lead.Phone_Number}`);
        }
    },

    scheduleMeeting(leadId) {
        alert('Chức năng hẹn lịch - Sẽ sớm ra mắt!');
    },

    addNote(leadId) {
        const note = prompt('Nhập ghi chú:');
        if (note) {
            console.log('Note added:', note);
            alert('Đã lưu ghi chú!');
        }
    },

    showStepDetail(leadId, stepId) {
        console.log('Show step detail:', leadId, stepId);
        // Future: show step details
    },

    // ── Navigation ──
    navigate(page) {
        console.log('Navigate to:', page);

        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        if (event && event.target) {
            const target = event.target.closest('.nav-item');
            if (target) target.classList.add('active');
        }

        // Update page content based on page name
        this.renderPage(page);
    },

    renderPage(page) {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        const pageTitles = {
            'dashboard': 'Dashboard',
            'smart-intake': 'Smart Intake',
            'skin-profile': 'Skin Profile',
            'rx-protocol': 'RX Protocol',
            'ai-engine': 'AI Engine',
            'inbox': 'Inbox',
            'revenue': 'Revenue',
            'retention': 'Retention',
            'auto-tasks': 'Auto Tasks',
            'auto-flow': 'Auto Flow'
        };

        const title = pageTitles[page] || page;

        // Update header title
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = title;
        }

        // Render page content
        if (page === 'inbox') {
            this.renderInboxPage(pageContent);
        } else if (page === 'dashboard') {
            this.renderDashboardPage(pageContent);
        } else {
            // Placeholder for other pages
            pageContent.innerHTML = `
                <div class="coming-soon">
                    <div class="coming-soon-icon">🚧</div>
                    <h2>${title}</h2>
                    <p>Tính năng đang được phát triển...</p>
                </div>
            `;
        }
    },

    renderInboxPage(container) {
        container.innerHTML = `
            <div class="chat-container">
                <!-- Chat Sidebar -->
                <div class="chat-sidebar">
                    <div class="chat-sidebar-header">
                        <h3>💬 Hội thoại</h3>
                        <button type="button" class="btn btn-sm btn-ghost" onclick="CRM.loadInbox()">
                            🔄
                        </button>
                    </div>
                    <div class="chat-search">
                        <input type="text" class="input" placeholder="Tìm theo tên, SĐT..." id="chatSearchInput">
                    </div>
                    <div class="chat-tabs">
                        <button class="chat-tab active" data-filter="all">Tất cả</button>
                        <button class="chat-tab" data-filter="unread">Chưa trả lời</button>
                    </div>
                    <div class="chat-conversation-list" id="conversationList">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Đang tải...</p>
                        </div>
                    </div>
                </div>

                <!-- Chat Main Area -->
                <div class="chat-main">
                    <div class="chat-empty" id="chatEmpty">
                        <div class="empty-icon">💬</div>
                        <h3>Chọn một cuộc trò chuyện</h3>
                        <p>Chọn cuộc trò chuyện từ danh sách bên trái để xem tin nhắn</p>
                    </div>

                    <div class="chat-view" id="chatView" style="display: none;">
                        <div class="chat-header">
                            <div class="chat-contact-info">
                                <div class="chat-avatar-lg" id="chatContactAvatar"></div>
                                <div class="chat-contact-details">
                                    <h4 id="chatContactName"></h4>
                                    <span id="chatContactTime"></span>
                                </div>
                            </div>
                            <div class="chat-actions">
                                <button class="btn btn-sm btn-ghost" title="Thông tin khách hàng">👤</button>
                                <button class="btn btn-sm btn-ghost" title="Lịch sử tư vấn">📋</button>
                            </div>
                        </div>

                        <div class="chat-messages" id="chatMessages">
                            <div class="loading">
                                <div class="spinner"></div>
                            </div>
                        </div>

                        <div class="chat-input-area">
                            <textarea class="chat-input" id="chatInput" placeholder="Nhập tin nhắn..." rows="1"></textarea>
                            <button class="btn btn-primary chat-send-btn" id="chatSendBtn" onclick="CRM.sendMessage()">
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        this.setupChatListeners();

        // Load conversations
        this.loadInbox();
    },

    setupChatListeners() {
        // Search input
        const searchInput = document.getElementById('chatSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterConversations(e.target.value);
            });
        }

        // Chat tabs
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.filterByTab(e.target.dataset.filter);
            });
        });

        // Enter to send message
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Conversation item clicks (delegated)
        document.getElementById('conversationList')?.addEventListener('click', (e) => {
            const item = e.target.closest('.conversation-item');
            if (item) {
                const id = item.dataset.id;
                const name = item.dataset.name;
                const senderId = item.dataset.senderId;
                if (id && name && senderId) {
                    this.openConversation(id, encodeURIComponent(name), senderId);
                }
            }
        });
    },

    filterConversations(query) {
        const items = document.querySelectorAll('.conversation-item');
        const lowerQuery = query.toLowerCase();

        items.forEach(item => {
            const name = item.querySelector('.conversation-name')?.textContent?.toLowerCase() || '';
            const show = name.includes(lowerQuery);
            item.style.display = show ? 'flex' : 'none';
        });
    },

    filterByTab(filter) {
        const items = document.querySelectorAll('.conversation-item');
        items.forEach(item => {
            if (filter === 'all') {
                item.style.display = 'flex';
            } else if (filter === 'unread') {
                const isUnread = item.classList.contains('unread');
                item.style.display = isUnread ? 'flex' : 'none';
            }
        });
    },

    async loadInbox() {
        const loadingEl = document.querySelector('.inbox-loading');
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="spinner"></div>
                <p>Đang tải tin nhắn từ Messenger...</p>
            `;
        }

        try {
            const response = await fetch('/api/inbox');
            const data = await response.json();

            if (data.success) {
                this.renderInboxMessages(data.messages || []);
                this.updateInboxStats(data.stats || {});
            } else {
                this.renderInboxMessages([]);
            }
        } catch (error) {
            console.error('Error loading inbox:', error);
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div class="error-message">
                        <p>❌ Lỗi tải tin nhắn: ${error.message}</p>
                        <button type="button" class="btn btn-secondary" onclick="CRM.loadInbox()">
                            Thử lại
                        </button>
                    </div>
                `;
            }
        }
    },

    renderInboxMessages(messages) {
        const listContainer = document.getElementById('conversationList');
        if (!listContainer) return;

        if (messages.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <h3>Chưa có tin nhắn</h3>
                </div>
            `;
            return;
        }

        // Store messages for later use
        this.state.conversations = messages;

        listContainer.innerHTML = `
            <div class="conversation-list">
                ${messages.map(msg => this.renderConversationItem(msg)).join('')}
            </div>
        `;

        // Update stats
        this.updateInboxStats({
            total: messages.length,
            unread: messages.filter(m => !m.is_read).length,
            today: messages.filter(m => {
                const today = new Date().toDateString();
                return new Date(m.created_time).toDateString() === today;
            }).length
        });
    },

    renderConversationItem(msg) {
        const time = this.formatTimeAgo(msg.created_time);
        const unreadClass = msg.is_read ? '' : 'unread';

        return `
            <div class="conversation-item ${unreadClass}" data-id="${msg.id}" data-name="${this.escapeHtml(msg.sender_name || '')}" data-sender-id="${msg.sender_id}">
                <div class="conversation-avatar">
                    ${msg.sender_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <span class="conversation-name">${this.escapeHtml(msg.sender_name || 'Unknown')}</span>
                        <span class="conversation-time">${time}</span>
                    </div>
                    <div class="conversation-preview">${this.escapeHtml(msg.message?.substring(0, 50) || '')}</div>
                </div>
            </div>
        `;
    },

    updateInboxStats(stats) {
        const totalEl = document.getElementById('inboxTotal');
        const unreadEl = document.getElementById('inboxUnread');
        const todayEl = document.getElementById('inboxToday');

        if (totalEl) totalEl.textContent = stats.total || 0;
        if (unreadEl) unreadEl.textContent = stats.unread || 0;
        if (todayEl) todayEl.textContent = stats.today || 0;
    },

    async openConversation(conversationId, senderName, senderId) {
        console.log('Open conversation:', conversationId, senderName, senderId);

        // Show chat view
        document.getElementById('chatEmpty').style.display = 'none';
        document.getElementById('chatView').style.display = 'flex';
        document.getElementById('chatView').style.flexDirection = 'column';

        // Update header
        document.getElementById('chatContactName').textContent = decodeURIComponent(senderName);
        document.getElementById('chatContactAvatar').textContent = decodeURIComponent(senderName).charAt(0).toUpperCase();

        // Store current conversation
        this.state.currentConversation = {
            id: conversationId,
            sender_id: senderId,
            sender_name: decodeURIComponent(senderName)
        };

        // Load messages
        await this.loadConversationMessages(conversationId);
    },

    async loadConversationMessages(conversationId) {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;

        try {
            const response = await fetch(`/api/conversation?conversationId=${conversationId}`);
            const data = await response.json();

            if (data.success) {
                this.renderChatMessages(data.messages || []);
            } else {
                messagesContainer.innerHTML = `
                    <div class="error-message">
                        <p>Lỗi: ${data.message}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            messagesContainer.innerHTML = `
                <div class="error-message">
                    <p>Lỗi tải tin nhắn</p>
                </div>
            `;
        }
    },

    renderChatMessages(messages) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Chưa có tin nhắn</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(msg => this.renderChatMessage(msg)).join('');
        container.scrollTop = container.scrollHeight;
    },

    renderChatMessage(msg) {
        const time = this.formatMessageTime(msg.created_time);
        const isFromPage = msg.is_from_page;

        return `
            <div class="chat-bubble ${isFromPage ? 'from-page' : 'from-customer'}">
                <div class="chat-bubble-content">
                    <p>${this.escapeHtml(msg.message || '')}</p>
                </div>
                <span class="chat-bubble-time">${time}</span>
            </div>
        `;
    },

    formatMessageTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
               ' ' + date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    },

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input?.value?.trim();

        if (!message || !this.state.currentConversation) {
            return;
        }

        const sendBtn = document.getElementById('chatSendBtn');
        sendBtn.disabled = true;
        sendBtn.textContent = 'Đang gửi...';

        try {
            const response = await fetch('/api/conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipientId: this.state.currentConversation.sender_id,
                    message: message
                })
            });

            const data = await response.json();

            if (data.success) {
                // Clear input
                input.value = '';

                // Reload messages
                await this.loadConversationMessages(this.state.currentConversation.id);
            } else {
                alert('Lỗi gửi tin nhắn: ' + data.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Lỗi gửi tin nhắn');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Gửi';
        }
    },

    renderDashboardPage(container) {
        // Re-render dashboard content
        this.loadLeads();
    },

    switchTab(tab) {
        this.state.currentTab = tab;

        // Update tab UI
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');

        console.log('Switch tab:', tab);
    },

    refreshData() {
        this.loadLeads();
    },

    // ── Auto Refresh ──
    startAutoRefresh() {
        setInterval(() => {
            this.loadLeads();
        }, this.config.refreshInterval);
    },

    // ── Event Listeners ──
    setupEventListeners() {
        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = this.state.leads.filter(lead =>
                (lead.Full_Name || '').toLowerCase().includes(query) ||
                (lead.Phone_Number || '').includes(query)
            );

            this.state.leads = query ? filtered : this.getMockLeads();
            this.renderLeadsTable();
        });

        // Close modal on outside click
        document.getElementById('leadModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },

    // ── Helpers ──
    formatTimeAgo(dateString) {
        if (!dateString) return 'Chưa có';

        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return `${days} ngày trước`;
    },

    isRecent(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return date > hourAgo;
    },

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    },

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update button icon
        const btn = document.querySelector('.theme-toggle');
        if (btn) {
            btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    },

    initTheme() {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);

        const btn = document.querySelector('.theme-toggle');
        if (btn) {
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    },

    getStatusText(status) {
        const map = {
            'Mới tiếp nhận': 'Chờ xử lý',
            'Đang tư vấn': 'Đang xử lý',
            'Chờ KH phản hồi': 'Chờ phản hồi',
            'Đã tư vấn, chưa mua': 'Đã tư vấn',
            'Đã mua': 'Hoàn thành'
        };
        return map[status] || status;
    },

    getStepStatusText(status, isConsultantStep = false) {
        const map = {
            'hoan_thanh': 'Hoàn thành',
            'dang_xu_ly': isConsultantStep ? 'Chờ Gửi Phác Đồ' : 'Đang xử lý',
            'cho': isConsultantStep ? 'Chờ Gửi Phác Đồ' : 'Chờ'
        };
        return map[status] || status;
    },

    escapeHtml(value) {
        const str = value === null || value === undefined ? '' : String(value);
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    escapeAttr(value) {
        return this.escapeHtml(value).replace(/`/g, '&#96;');
    },

    // Render action suggestions based on lead status
    renderActionSuggestions(lead) {
        const step = lead.current_step || 1;
        const trang_thai = lead.trang_thai || '';

        let suggestions = [];

        // B0-B5: Data collection phase
        if (step <= 6) {
            // Check what data is missing
            if (!lead.Skin_Condition || (Array.isArray(lead.Skin_Condition) && lead.Skin_Condition.length === 0)) {
                suggestions.push({ type: 'followup', text: 'Yêu cầu khách gửi hình da' });
            }
            if (!lead.Budget) {
                suggestions.push({ type: 'trustbuild', text: 'Hỏi ngân sách chăm sóc da' });
            }
            if (!lead.History_Cosmetics) {
                suggestions.push({ type: 'trustbuild', text: 'Tìm hiểu sản phẩm đang dùng' });
            }
            if (!lead.Phone_Number || lead.Phone_Number.length < 10) {
                suggestions.push({ type: 'followup', text: 'Xác nhận số điện thoại' });
            }
        }

        // B6: Waiting for consultant to send treatment plan (step 7)
        if (step === 7) {
            suggestions.push({ type: 'followup', text: 'Tạo & gửi phác đồ điều trị' });
        }

        // After treatment plan sent (step 8 = B7)
        if (step >= 8) {
            if (trang_thai.includes('Đã chốt')) {
                suggestions.push({ type: 'followup', text: 'Theo dõi sau bán hàng' });
            } else {
                suggestions.push({ type: 'followup', text: 'Chốt đơn / Lên lịch hẹn' });
            }
        }

        // If no specific suggestions, show default
        if (suggestions.length === 0) {
            suggestions.push({ type: 'followup', text: 'Tiếp tục thu thập thông tin' });
        }

        // Render suggestions
        return `
            <div style="margin-bottom: 12px;">
                ${suggestions.map(s => `
                    <div class="suggestion-item" style="display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; background: ${s.type === 'followup' ? '#FFF3E0' : '#E3F2FD'}; border-radius: 6px; margin-bottom: 6px; cursor: pointer;" onclick="CRM.handleSuggestion('${s.type}', ${lead.Id})">
                        <span style="font-size: 14px;">${s.type === 'followup' ? '📍' : '💡'}</span>
                        <span style="font-size: 13px; color: #333; line-height: 1.4;">${s.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    handleSuggestion(type, leadId) {
        const lead = this.state.leads.find(l => l.Id === leadId);
        if (!lead) return;

        if (type === 'followup') {
            // Quick actions for followup
            const actions = [
                { name: '📞 Gọi điện', action: () => this.callLead(leadId) },
                { name: '💬 Nhắn Zalo', action: () => this.messageLead(leadId) },
                { name: '📝 Ghi chú', action: () => this.addNote(leadId) }
            ];

            const choice = prompt('Chọn hành động:\n' + actions.map((a, i) => `${i + 1}. ${a.name}`).join('\n'));
            if (choice && actions[parseInt(choice) - 1]) {
                actions[parseInt(choice) - 1].action();
            }
        } else if (type === 'trustbuild') {
            // For trustbuild, show question templates
            const templates = [
                'Chị có thể cho em biết sản phẩm chị đang dùng không?',
                'Chị đã từng thử các giải pháp nào cho làn da trước đây chưa ạ?',
                'Ngân sách chị dành cho việc chăm sóc da mỗi tháng là khoảng bao nhiêu?'
            ];
            const choice = prompt('Chọn câu hỏi:\n' + templates.map((t, i) => `${i + 1}. ${t}`).join('\n'));
            if (choice && templates[parseInt(choice) - 1]) {
                alert('Câu hỏi: ' + templates[parseInt(choice) - 1]);
            }
        }
    },

    getMissingData(lead) {
        const missing = [];
        if (!lead.Skin_Condition || (Array.isArray(lead.Skin_Condition) && lead.Skin_Condition.length === 0)) missing.push('Hình da');
        if (!lead.Budget) missing.push('Ngân sách');
        if (!lead.Phone_Number) missing.push('SĐT');
        if (!lead.History_Cosmetics) missing.push('SP đang dùng');
        if (!lead.History_Spa) missing.push('Dịch vụ spa');
        if (!lead.Health_Status) missing.push('Sức khỏe');
        return missing;
    },

    normalizeMulti(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value.map(v => String(v)).filter(Boolean);
        if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
        return [String(value)];
    },

    splitUrls(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value.map(v => String(v)).filter(Boolean);
        if (typeof value !== 'string') return [String(value)];

        const text = value.trim();
        if (!text) return [];

        if ((text.startsWith('[') && text.endsWith(']')) || (text.startsWith('{') && text.endsWith('}'))) {
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) return parsed.map(v => String(v)).filter(Boolean);
                if (parsed && typeof parsed === 'object') return Object.values(parsed).map(v => String(v)).filter(Boolean);
            } catch (_) {}
        }

        return text.split(',').map(s => s.trim()).filter(Boolean);
    },

    countStepFilled(stepId, lead) {
        const has = (v) => v !== null && v !== undefined && String(v).trim() !== '';
        const countPhotos = (urls) => this.splitUrls(urls).length;

        if (stepId === 1) return (has(lead.nhucau) || this.normalizeMulti(lead.Skin_Condition).length > 0) ? 1 : 0;
        if (stepId === 2) {
            const photos = countPhotos(lead.Skin_Photos) + countPhotos(lead.Skin_photo_2) + countPhotos(lead.Skin_photo_3);
            return (has(lead.Age_Group) ? 1 : 0) + (has(lead.Location) ? 1 : 0) + (photos ? 1 : 0);
        }
        if (stepId === 3) return [lead.History_Cosmetics, lead.History_Spa, lead.History_Spa_Service, lead.History_Spa_Results].filter(has).length;
        if (stepId === 4) return [lead.Health_Status, lead.Supplements, lead.Lifestyle_Sleep, lead.Lifestyle_Stress].filter(has).length;
        if (stepId === 5) return has(lead.Budget) ? 1 : 0;
        if (stepId === 6) return has(lead.Phone_Number) ? 1 : 0;
        if (stepId === 7) return has(lead.phac_do) ? 1 : 0; // B6 - Consultant step
        return [lead.Current_Routine, lead.Routine_Photos, lead.tu_van_vien_notes, lead.Note].filter(has).length;
    },

    getEffectiveCurrentStep(lead) {
        const raw = Number(lead.current_step);
        const base = Number.isFinite(raw) && raw > 0 ? raw : 1;
        const inferred = this.inferCurrentStepFromData(lead);
        return Math.max(1, Math.min(8, Math.max(base, inferred)));
    },

    inferCurrentStepFromData(lead) {
        const has = (v) => v !== null && v !== undefined && String(v).trim() !== '';

        // B7 (step 8): Hoàn thành - đã gửi phác đồ
        if (lead.last_step === 'completed' || lead.phac_do) return 8;
        if (typeof lead.trang_thai === 'string' && (lead.trang_thai.includes('Đã mua') || lead.trang_thai.includes('Đã chốt'))) return 8;

        let step = 1;

        const step2Filled = this.countStepFilled(2, lead);
        if (step2Filled >= 2) step = 2;
        if (step2Filled === 3) step = 2;

        if (this.countStepFilled(3, lead) > 0) step = Math.max(step, 3);
        if (this.countStepFilled(4, lead) > 0) step = Math.max(step, 4);
        if (this.countStepFilled(5, lead) === 1) step = Math.max(step, 5);
        if (this.countStepFilled(6, lead) === 1) step = Math.max(step, 6);

        // B6 (step 7): Consultant gửi phác đồ
        const step7Signals = [
            lead.Current_Routine,
            lead.Routine_Photos,
            lead.tu_van_vien_notes,
            lead.Note
        ].some(has);

        if (step7Signals) step = 7;

        const looksDone =
            this.countStepFilled(2, lead) === 3 &&
            this.countStepFilled(3, lead) > 0 &&
            this.countStepFilled(4, lead) > 0 &&
            this.countStepFilled(5, lead) === 1 &&
            this.countStepFilled(6, lead) === 1;

        if (looksDone) step = 7;

        return Math.max(1, Math.min(7, step));
    },

    formatTimeOnly(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
};

// Initialize CRM when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 CRM: Initializing...');
    try {
        CRM.init();
        console.log('✅ CRM: Initialized successfully');
    } catch (e) {
        console.error('❌ CRM Init Error:', e);
        alert('CRM Init Error: ' + e.message);
    }
});
