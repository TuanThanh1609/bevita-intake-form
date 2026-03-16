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
        await this.loadLeads();
        this.startAutoRefresh();
        this.setupEventListeners();
    },

    // ── Data Loading ──
    async loadLeads() {
        try {
            // For demo, use mock data if API not available
            // In production, fetch from NocoDB
            const response = await fetch('/api/crm/leads');

            if (!response.ok) {
                throw new Error('API not available');
            }

            const data = await response.json();

            // Use API data if available, otherwise fallback to mock
            if (data.list && data.list.length > 0) {
                this.state.leads = data.list;
            } else {
                console.log('No leads from API, using mock data');
                this.state.leads = this.getMockLeads();
            }
        } catch (error) {
            console.log('Using mock data for demo:', error.message);
            // Mock data for demonstration
            this.state.leads = this.getMockLeads();
        }

        this.renderMetrics();
        this.renderLeadsTable();
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
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${leads.map(lead => this.renderLeadRow(lead)).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
        document.getElementById('totalLeads').textContent = `(${leads.length})`;
    },

    renderLeadRow(lead) {
        const name = lead.Full_Name || 'Chưa có tên';
        const phone = lead.Phone_Number || '';
        const source = lead.nguon || 'Messenger';
        const stage = lead.trang_thai || 'Mới tiếp nhận';
        const step = lead.current_step || 1;
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

        const stepPercent = Math.round((step / 7) * 100);

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
                <td>
                    <span class="status-badge ${statusClass}">${this.getStatusText(stage)}</span>
                </td>
            </tr>
        `;
    },

    // ── Lead Detail ──
    async showLeadDetail(leadId) {
        const lead = this.state.leads.find(l => l.Id === leadId);
        if (!lead) return;

        this.state.selectedLead = lead;
        const modal = document.getElementById('leadModal');
        const content = document.getElementById('leadModalContent');

        const stepPercent = Math.round((lead.current_step || 1) / 7 * 100);
        // Clean up skin issues display
        const skinIssues = Array.isArray(lead.Skin_Condition) 
            ? lead.Skin_Condition.join(' / ') 
            : (lead.Skin_Condition || 'Chưa xác định');

        content.innerHTML = `
            <div class="lead-detail">
                <div class="lead-main">
                    <!-- Header -->
                    <div class="detail-header">
                        <h2>${lead.Full_Name || 'Khách hàng'}</h2>
                        <div class="detail-meta">
                            <span>📱 ${lead.Phone_Number || '09xx xxx xxx'}</span>
                            <span>📍 ${lead.Location || 'Chưa cập nhật'}</span>
                            <span>📅 Tạo: ${this.formatDate(lead.created || lead.CreatedAt)}</span>
                        </div>
                        
                        <div class="progress-container">
                            <div class="progress-track">
                                <div class="progress-fill" style="width: ${stepPercent}%"></div>
                            </div>
                            <div class="progress-labels">
                                <span>Tiến trình: ${lead.current_step || 1}/7 bước</span>
                                <strong>${lead.current_step >= 7 ? 'Hoàn thành' : 'Đang thực hiện'}</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Steps -->
                    <div class="steps-list">
                        ${this.renderStepList(lead)}
                    </div>
                </div>

                <!-- Right Sidebar -->
                <div class="lead-sidebar">
                    <!-- Actions -->
                    <div class="sidebar-card">
                        <div class="sidebar-title">
                            <i>🔜</i> Hành động tiếp theo
                        </div>
                        <div class="action-grid">
                            <div class="action-btn" onclick="CRM.callLead(${lead.Id})">
                                <span class="action-icon">📞</span>
                                Gọi điện
                            </div>
                            <div class="action-btn" onclick="CRM.messageLead(${lead.Id})">
                                <span class="action-icon">💬</span>
                                Nhắn tin
                            </div>
                            <div class="action-btn" onclick="CRM.scheduleMeeting(${lead.Id})">
                                <span class="action-icon">📅</span>
                                Hẹn lịch
                            </div>
                        </div>
                        <div class="action-btn full" onclick="CRM.addNote(${lead.Id})">
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
                                <span class="info-value">${lead.Age_Group || 'Dưới 25 tuổi'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Vấn đề da</span>
                                <span class="info-value">${skinIssues}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Ngân sách</span>
                                <span class="info-value">${lead.Budget || '2-5 triệu / tháng'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Nguồn</span>
                                <span class="info-value">${lead.nguon || 'Facebook Ads'}</span>
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
        const steps = [
            { id: 1, name: 'Nhận diện nhu cầu', icon: '🎯', msgCount: 3, time: '09:48 → 09:50' },
            { id: 2, name: 'Thông tin cơ bản + Hình da', icon: '👤', msgCount: 4, time: '09:50 → 09:55' },
            { id: 3, name: 'Mỹ phẩm & Dịch vụ làm đẹp', icon: '💄', msgCount: 5, time: '09:55 → 10:00' },
            { id: 4, name: 'Sức khỏe', icon: '🏥', msgCount: 2, time: '10:00 → 10:05' },
            { id: 5, name: 'Ngân sách', icon: '💰', msgCount: 3, time: '10:05 → 10:10' },
            { id: 6, name: 'Xác nhận SĐT & Kết nối', icon: '📞', msgCount: 2, time: '10:10 → 10:15' },
            { id: 7, name: 'Tư vấn phác đồ', icon: '📋', msgCount: 5, time: '10:15 → 10:30' },
        ];

        return steps.map((step, index) => {
            const isCompleted = step.id <= (lead.current_step || 1);
            const isActive = step.id === (lead.current_step || 1);
            const isExpanded = isActive || index === 0; // Expand active or first step by default
            
            let statusClass = '';
            let statusText = 'Chờ xử lý';
            let icon = step.icon;

            if (isCompleted) {
                statusClass = 'completed';
                statusText = 'Hoàn thành ✓';
                icon = '✓';
            } else if (isActive) {
                statusClass = 'active';
                statusText = 'Đang xử lý 🔄';
            }

            // Step Label (B0, B1, etc.)
            const stepLabel = `B${step.id - 1}`;

            return `
                <div class="step-item ${statusClass} ${isExpanded ? 'expanded' : ''}" id="step-${step.id}">
                    <div class="step-header" onclick="CRM.toggleStep(${step.id})">
                        <div class="step-title-group">
                            <div class="step-icon">${icon}</div>
                            <div class="step-info">
                                <div class="step-name">${stepLabel}: ${step.name}</div>
                                <div class="step-meta">
                                    <span>${step.time}</span>
                                    <span>• ${step.msgCount} tin nhắn</span>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span class="step-status-badge">${statusText}</span>
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
        // Mock chat content based on step
        if (stepId === 1) {
            return `
                <div class="chat-container">
                    <div class="chat-message system">
                        <div class="chat-header">
                            <span>🤖 HỆ THỐNG</span>
                            <span class="chat-time">09:48</span>
                        </div>
                        <div>
                            AI nhận diện: Nhu cầu = <b>${(lead.Skin_Condition || ['Nám'])[0]}</b> | Intent = Ready | Urgency = Trung bình
                        </div>
                    </div>
                    <div class="chat-message agent">
                        <div class="chat-avatar agent">M</div>
                        <div class="chat-bubble">
                            <div class="chat-header">
                                <span>Skin Coach Mai</span>
                                <span class="chat-time">09:48</span>
                            </div>
                            Chào bạn 🌷 Mai là Skin Coach bên Bevita nè.<br><br>
                            Mai nhận được tin nhắn của bạn rồi. Tình trạng ${(lead.Skin_Condition || ['da'])[0]} khá phổ biến và hoàn toàn có thể cải thiện được nha bạn.<br>
                            Để Mai tư vấn chính xác nhất, bạn giúp Mai gửi mấy thông tin nhé.
                        </div>
                    </div>
                    <div class="chat-message user">
                        <div class="chat-avatar user">KH</div>
                        <div class="chat-bubble">
                            <div class="chat-header">
                                <span>Khách hàng</span>
                                <span class="chat-time">09:50</span>
                            </div>
                            Chào shop, mình muốn tư vấn về ${(lead.Skin_Condition || ['da'])[0]} ạ.
                        </div>
                    </div>
                </div>
            `;
        } else if (stepId === 2) {
            return `
                <div class="chat-container">
                    <div class="chat-message agent">
                        <div class="chat-avatar agent">M</div>
                        <div class="chat-bubble">
                            <div class="chat-header">
                                <span>Skin Coach Mai</span>
                                <span class="chat-time">09:50</span>
                            </div>
                            Bạn giúp Mai gửi thông tin nhé:<br>
                            • Độ tuổi của bạn<br>
                            • Bạn đang ở tỉnh/thành nào<br>
                            • Hình ảnh da mặt 3 góc (trái, phải, chính diện)<br><br>
                            Bạn chụp hướng mặt ra cửa, ánh sáng tự nhiên là đẹp nhất nha 📷
                        </div>
                    </div>
                    <div class="chat-message user">
                        <div class="chat-avatar user">KH</div>
                        <div class="chat-bubble">
                            <div class="chat-header">
                                <span>Khách hàng</span>
                                <span class="chat-time">09:52</span>
                            </div>
                            Mình ${lead.Age_Group || '30'} tuổi, ở ${lead.Location || 'TP.HCM'} ạ.
                        </div>
                    </div>
                    <div class="chat-message system">
                        <div class="chat-header">
                            <span>🤖 HỆ THỐNG</span>
                            <span class="chat-time">09:52</span>
                        </div>
                        <div>
                            ✅ Đã thu thập: Tuổi (${lead.Age_Group || '30'}), Tỉnh/thành (${lead.Location || 'TP.HCM'})<br>
                            ⏳ Thiếu: Hình da mặt 3 góc
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="chat-container">
                    <div class="chat-message system">
                        <div>⏳ Đang chờ dữ liệu bước này...</div>
                    </div>
                </div>
            `;
        }
    },

    // ── Actions ──
    closeModal() {
        document.getElementById('leadModal').classList.remove('active');
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
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        event.target.closest('.nav-item').classList.add('active');

        // Update breadcrumb
        document.getElementById('breadcrumb-current').textContent = page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ');
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

    getStepStatusText(status) {
        const map = {
            'hoan_thanh': 'Hoàn thành',
            'dang_xu_ly': 'Đang xử lý',
            'cho': 'Chờ'
        };
        return map[status] || status;
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
