let sampleSubjects = [];
const logInfo = (msg, data) => console.log('🔍', msg, data || '');
const logWarn = (msg, data) => console.log('⚠️', msg, data || '');
const logError = (msg, data) => console.error('❌', msg, data || '');
const logSuccess = (msg, data) => console.log('✅', msg, data || '');
const logDebug = (msg, data) => console.log('🐛', msg, data || '');
function loadSubjectsFromData() {
    try {
        console.log('🔄 Đang tải dữ liệu từ data.js...');
        if (typeof UET_SUBJECTS_DATA !== 'undefined' && UET_SUBJECTS_DATA) {
            sampleSubjects = UET_SUBJECTS_DATA.map(item => {
                const sessions = createSessionsFromSimpleData(item);
                const subjectType = determineSubjectType(item.ma_hoc_phan, item.hoc_phan);
                return {
                    id: item.ma_lhp,
                    code: item.ma_hoc_phan,
                    name: item.hoc_phan,
                    credits: parseInt(item.so_tin_chi) || 3,
                    type: subjectType,
                    sessions: sessions,
                    prerequisites: [],
                    description: `${item.hoc_phan} - HKI 2025-2026`,
                    instructor: item.giang_vien || '',
                    capacity: item.so_sv_du_kien || '',
                    form: 'Trực tiếp',
                    program: 'HKI 2025-2026',
                    class_number: item.nhom || '',
                    note_1: item.ghi_chu || '',
                    note_2: '',
                    stt: item.stt,
                    thu: item.thu,
                    tiet: item.tiet,
                    giang_duong: item.giang_duong
                };
            });
            logSuccess(`Đã tải ${sampleSubjects.length} môn học từ data.js`);
            return true;
        } else {
            logWarn('Không tìm thấy UET_SUBJECTS_DATA, chuyển sang JSON...');
            return false;
        }
    } catch (error) {
        logError('Lỗi khi tải dữ liệu từ data.js:', error);
        return false;
    }
}
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
async function loadSubjectsFromJSON() {
    try {
        console.log('🔄 Đang tải dữ liệu từ JSON...');
        const response = await fetch('TKB HKI 2025-2026_fixed.json');
        const data = await response.json();
        sampleSubjects = data.map(item => ({
            id: item.id || item.ma_lhp,
            code: item.code || item.ma_lhp,
            name: item.name || item.mon,
            credits: parseInt(item.credits) || parseInt(item.tc) || 3,
            type: item.type || determineSubjectType(item.code || item.ma_lhp, item.name || item.mon),
            sessions: item.sessions || [],
            prerequisites: item.prerequisites || [],
            description: item.description || `${item.name || item.mon} - ${item.course_suggestion || item.program || ''}`,
            instructor: item.instructor || item.giang_vien || '',
            capacity: item.capacity || item.si_so || '',
            form: item.form || item.hinh_thuc || '',
            program: item.course_suggestion || item.program || '',
            note_1: item.note_1 || item.ghi_chu_1 || '',
            note_2: item.note_2 || item.ghi_chu_2 || '',
            class_number: item.class_number || item.nhom || ''
        }));
        console.log(`✅ Đã tải ${sampleSubjects.length} môn học từ JSON`);
        return true;
    } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu JSON:', error);
        loadSampleData();
        return false;
    }
}
function createSessions(item) {
    if (item.sessions && item.sessions.length > 0) {
        return item.sessions;
    }
    const thu = parseInt(item.Thu) || parseInt(item.thu) || 1;
    const ca = parseInt(item.Ca) || parseInt(item.ca) || 1;
    const phong = item.Giang_Duong || item.giang_duong || `${item.Ma_LHP || item.ma_lhp || item.code}-Room`;
    return [{
        day: thu,
        period: ca,
        room: phong,
        weeks: '1-15'
    }];
}
function createSessionsFromJSON(item) {
    if (item.sessions && item.sessions.length > 0) {
        return item.sessions;
    }
    const thu = parseInt(item.thu) || 1;
    const ca = parseInt(item.ca) || 1;
    const phong = item.giang_duong || `${item.ma_lhp}-Room`;
    return [{
        day: thu,
        period: ca,
        room: phong,
        weeks: '1-15'
    }];
}
function createSessionsFromSimpleData(item) {
    const sessions = [];
    const thu = item.thu;
    let dayNum = 0;
    if (thu && thu.toString().trim()) {
        if (thu === 'CN') {
            dayNum = 7;
        } else if (thu.toString().match(/^\d+$/)) {
            dayNum = parseInt(thu);
        }
    }
    const tiet = item.tiet;
    let periodStart = 1;
    let periodEnd = 1;
    if (tiet && tiet.toString().trim()) {
        const tietStr = tiet.toString().trim();
        if (tietStr.includes('-')) {
            const parts = tietStr.split('-');
            if (parts.length === 2) {
                periodStart = parseInt(parts[0]) || 1;
                periodEnd = parseInt(parts[1]) || periodStart;
            }
        } else if (tietStr.match(/^\d+$/)) {
            periodStart = parseInt(tietStr);
            periodEnd = periodStart;
        }
    }
    if (dayNum > 0 && periodStart > 0) {
        for (let period = periodStart; period <= periodEnd; period++) {
            sessions.push({
                day: dayNum,
                period: period,
                room: item.giang_duong || `${item.ma_lhp}-Room`,
                weeks: '1-15'
            });
        }
    }
    return sessions;
}
function loadSampleData() {
    sampleSubjects = [
        {
            id: 'INT1008',
            code: 'INT1008',
            name: 'Nhập môn lập trình',
            credits: 4,
            type: 'major',
            sessions: [
                { day: 1, period: 1, room: 'TC-201', weeks: '1-15' }
            ],
            prerequisites: [],
            description: 'Môn học cơ bản về lập trình với ngôn ngữ C/C++'
        }
    ];
    console.log(`📚 Đã tải ${sampleSubjects.length} môn học mẫu`);
}
const timeSlots = [
    { period: 1, time: '07:00 - 09:40' },
    { period: 2, time: '09:45 - 12:25' },
    { period: 3, time: '13:00 - 15:40' },
    { period: 4, time: '15:45 - 18:25' }
];
let selectedSubjects = [];
let currentSchedule = {};
let draggedSubject = null;
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
async function initializeApp() {
    logInfo('Bắt đầu khởi tạo ứng dụng...');
    const dataLoaded = loadSubjectsFromData();
    logInfo('Data.js loaded:', { success: dataLoaded, count: sampleSubjects.length });
    if (!dataLoaded) {
        logWarn('Data.js failed, trying JSON...');
        const jsonLoaded = await loadSubjectsFromJSON();
        logInfo('JSON loaded:', { success: jsonLoaded, count: sampleSubjects.length });
        if (!jsonLoaded) {
            logWarn('JSON failed, trying CSV...');
            await loadSubjectsFromCSV();
            logInfo('CSV loaded, count:', sampleSubjects.length);
        }
    }
    loadImportedSubjects(); // Tải dữ liệu từ PDF nếu có
    logInfo('After import, total subjects:', sampleSubjects.length);
    renderSubjectsList();
    createScheduleTable();
    setupEventListeners();
    loadSavedSchedule();
    updateScheduleInfo();
    console.log('✅ Hoàn thành khởi tạo ứng dụng');
}
function loadImportedSubjects() {
    const importedData = localStorage.getItem('imported_subjects');
    if (importedData) {
        try {
            const importedSubjects = JSON.parse(importedData);
            if (importedSubjects && importedSubjects.length > 0) {
                const existingCodes = sampleSubjects.map(s => s.id);
                const newSubjects = importedSubjects.filter(s => !existingCodes.includes(s.id));
                sampleSubjects.push(...newSubjects);
                showToast(`Đã tải ${importedSubjects.length} môn học từ file PDF!`, 'success');
                localStorage.removeItem('imported_subjects');
            }
        } catch (error) {
            console.error('Error loading imported subjects:', error);
        }
    }
}
function renderSubjectsList() {
    const container = document.getElementById('subjectsList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    let filteredSubjects = sampleSubjects.filter(subject => {
        const matchesSearch = subject.code.toLowerCase().includes(searchTerm) ||
                            subject.name.toLowerCase().includes(searchTerm) ||
                            subject.id.toLowerCase().includes(searchTerm) ||
                            (subject.instructor && subject.instructor.toLowerCase().includes(searchTerm)) ||
                            (subject.program && subject.program.toLowerCase().includes(searchTerm));
        const matchesFilter = activeFilter === 'all' || subject.type === activeFilter;
        return matchesSearch && matchesFilter;
    });
    container.innerHTML = '';
    filteredSubjects.forEach(subject => {
        const subjectElement = createSubjectElement(subject);
        container.appendChild(subjectElement);
    });
    const countElement = document.getElementById('subjectsCount');
    if (countElement) {
        countElement.textContent = `${filteredSubjects.length} môn học`;
    }
}
function hasScheduleConflict(subject) {
    if (selectedSubjects.length === 0) return false;
    
    // Lấy tất cả môn học cùng LHP để kiểm tra toàn bộ
    const allSameLHPSubjects = sampleSubjects.filter(s => s.id === subject.id);
    
    for (const checkSubject of allSameLHPSubjects) {
        for (const session of checkSubject.sessions) {
            for (const selectedSubject of selectedSubjects) {
                for (const selectedSession of selectedSubject.sessions) {
                    if (session.day === selectedSession.day && 
                        session.period === selectedSession.period) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
function createSubjectElement(subject) {
    const div = document.createElement('div');
    div.className = 'subject-item';
    div.dataset.subjectId = subject.id;
    div.draggable = true;
    const isSelected = selectedSubjects.some(s => s.id === subject.id);
    const hasConflict = !isSelected && hasScheduleConflict(subject);
    
    if (isSelected) {
        div.classList.add('selected');
    } else if (hasConflict) {
        div.classList.add('conflict');
        div.title = '⚠️ Môn học này có lịch trùng với môn đã chọn';
    }
    div.innerHTML = `
        <div class="subject-code">${subject.code}</div>
        <div class="subject-lhp" style="font-size: 11px; color: #666; margin-top: 2px;">
            LHP: ${subject.id}
            ${subject.class_number ? `<span style="background: #e3f2fd; padding: 1px 4px; border-radius: 3px; margin-left: 5px;">${subject.class_number}</span>` : ''}
        </div>
        <div class="subject-name">${subject.name}</div>
        <div class="subject-info">
            <span class="subject-credits">${subject.credits} TC</span>
            <span class="subject-type ${subject.type}">${getTypeDisplayName(subject.type)}</span>
        </div>
        ${subject.instructor ? `<div class="subject-instructor">👨‍🏫 ${subject.instructor}</div>` : ''}
        ${subject.program ? `<div class="subject-program">🎓 ${subject.program}</div>` : ''}
    `;
    div.addEventListener('click', () => showSubjectModal(subject));
    div.addEventListener('dragstart', (e) => handleDragStart(e, subject));
    div.addEventListener('dragend', handleDragEnd);
    return div;
}
function showGroupSelectionModal(subject, clSubjects, n1Subjects, n2Subjects) {
    logInfo('Group selection modal opened for:', {
        code: subject.code,
        clCount: clSubjects.length,
        n1Count: n1Subjects.length,
        n2Count: n2Subjects.length
    });
    logDebug('CL subjects details:', clSubjects.map(s => ({
        code: s.code,
        name: s.name,
        sessions: s.sessions.length,
        instructor: s.instructor
    })));
    const modal = document.getElementById('subjectModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    const addBtn = document.getElementById('addToSchedule');
    logDebug('Modal elements check:', {
        modal: modal ? 'found' : 'NOT FOUND',
        title: title ? 'found' : 'NOT FOUND',
        body: body ? 'found' : 'NOT FOUND',
        addBtn: addBtn ? 'found' : 'NOT FOUND'
    });
    if (!modal) {
        logError('Modal element not found!');
        return;
    }
    title.textContent = `Chọn nhóm thực hành - ${subject.code}`;
    let groupHTML = `
        <div class="group-selection">
            <p><strong>Đã chọn lớp chung (CL)</strong> cho môn ${subject.code} - ${subject.name}</p>
            <p>Vui lòng chọn nhóm thực hành:</p>
            <div class="group-options">
                <div class="group-option" data-group="n1">
                    <div class="group-header">
                        <input type="radio" name="practiceGroup" value="n1" id="group-n1">
                        <label for="group-n1"><strong>📚 Nhóm N1</strong></label>
                    </div>
                    <div class="group-schedule">
    `;
    n1Subjects.forEach(s => {
        s.sessions.forEach(session => {
            groupHTML += `<div class="schedule-item">• Thứ ${session.day}, Tiết ${session.period}, Phòng ${session.room}</div>`;
        });
        if (s.instructor) {
            groupHTML += `<div class="instructor-info">👨‍🏫 ${s.instructor}</div>`;
        }
    });
    groupHTML += `
                    </div>
                </div>
                <div class="group-option" data-group="n2">
                    <div class="group-header">
                        <input type="radio" name="practiceGroup" value="n2" id="group-n2">
                        <label for="group-n2"><strong>🔬 Nhóm N2</strong></label>
                    </div>
                    <div class="group-schedule">
    `;
    n2Subjects.forEach(s => {
        s.sessions.forEach(session => {
            groupHTML += `<div class="schedule-item">• Thứ ${session.day}, Tiết ${session.period}, Phòng ${session.room}</div>`;
        });
        if (s.instructor) {
            groupHTML += `<div class="instructor-info">👨‍🏫 ${s.instructor}</div>`;
        }
    });
    groupHTML += `
                    </div>
                </div>
                <div class="group-option" data-group="cl-only">
                    <div class="group-header">
                        <input type="radio" name="practiceGroup" value="cl-only" id="group-cl-only">
                        <label for="group-cl-only"><strong>🏛️ Chỉ lớp chung (không thực hành)</strong></label>
                    </div>
                </div>
            </div>
        </div>
    `;
    body.innerHTML = `<div class="modal-body-content">${groupHTML}</div>`;
    addBtn.textContent = 'Xác nhận chọn nhóm';
    addBtn.disabled = true; // Disable cho đến khi chọn
    const radioButtons = body.querySelectorAll('input[name="practiceGroup"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            addBtn.disabled = false;
        });
    });
    addBtn.onclick = () => {
        const selectedGroup = body.querySelector('input[name="practiceGroup"]:checked');
        if (!selectedGroup) {
            showToast('Vui lòng chọn nhóm thực hành', 'warning');
            return;
        }
        let subjectsToAdd = [...clSubjects];
        let message = '';
        switch (selectedGroup.value) {
            case 'n1':
                subjectsToAdd.push(...n1Subjects);
                message = `Đã thêm lớp CL + nhóm N1 cho ${subject.id}`;
                break;
            case 'n2':
                subjectsToAdd.push(...n2Subjects);
                message = `Đã thêm lớp CL + nhóm N2 cho ${subject.id}`;
                break;
            case 'cl-only':
                message = `Đã thêm chỉ lớp chung cho ${subject.id}`;
                break;
        }
        showToast(message, 'info');
        performAddSubjects(subjectsToAdd, subject);
        modal.style.display = 'none';
        modal.classList.remove('modal-force-show');
    };
    modal.style.display = 'block';
    logDebug('Modal display set to block:', {
        modalDisplay: modal.style.display,
        modalVisible: modal.offsetHeight > 0,
        modalId: modal.id
    });
    modal.classList.add('modal-force-show');
}
function showSubjectModal(subject) {
    const modal = document.getElementById('subjectModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    const addBtn = document.getElementById('addToSchedule');
    title.textContent = `[${subject.id}] ${subject.code} - ${subject.name}`;
    const allSameLHPSubjects = sampleSubjects.filter(s => s.id === subject.id);
    const clSubjects = allSameLHPSubjects.filter(s => s.class_number === 'CL');
    const n1Subjects = allSameLHPSubjects.filter(s => s.class_number === 'N1');
    const n2Subjects = allSameLHPSubjects.filter(s => s.class_number === 'N2');
    let scheduleHTML = '<div><strong>Lịch học:</strong></div>';
    if (clSubjects.length > 0) {
        scheduleHTML += '<div style="margin-top: 8px;"><strong>🏛️ Lớp chung (CL):</strong></div><ul>';
        clSubjects.forEach(s => {
            s.sessions.forEach(session => {
                scheduleHTML += `<li>Thứ ${session.day}, Tiết ${session.period}, Phòng ${session.room} - ${s.instructor}</li>`;
            });
        });
        scheduleHTML += '</ul>';
    }
    if (n1Subjects.length > 0 || n2Subjects.length > 0) {
        scheduleHTML += '<div style="margin-top: 8px;"><strong>🧪 Nhóm thực hành (chọn 1):</strong></div>';
        if (n1Subjects.length > 0) {
            scheduleHTML += '<div style="margin-left: 15px;"><strong>Nhóm N1:</strong></div><ul>';
            n1Subjects.forEach(s => {
                s.sessions.forEach(session => {
                    scheduleHTML += `<li>Thứ ${session.day}, Tiết ${session.period}, Phòng ${session.room} - ${s.instructor}</li>`;
                });
            });
            scheduleHTML += '</ul>';
        }
        if (n2Subjects.length > 0) {
            scheduleHTML += '<div style="margin-left: 15px;"><strong>Nhóm N2:</strong></div><ul>';
            n2Subjects.forEach(s => {
                s.sessions.forEach(session => {
                    scheduleHTML += `<li>Thứ ${session.day}, Tiết ${session.period}, Phòng ${session.room} - ${s.instructor}</li>`;
                });
            });
            scheduleHTML += '</ul>';
        }
    }
    body.innerHTML = `
        <div class="modal-body-content">
            <p><strong>Mã LHP:</strong> ${subject.id}</p>
            <p><strong>Số tín chỉ:</strong> ${subject.credits}</p>
            <p><strong>Loại môn:</strong> ${getTypeDisplayName(subject.type)}</p>
            <p><strong>Giảng viên:</strong> ${subject.instructor || 'Chưa có thông tin'}</p>
            <p><strong>Sĩ số:</strong> ${subject.capacity || 'Chưa có thông tin'}</p>
            <p><strong>Hình thức:</strong> ${subject.form || 'Chưa có thông tin'}</p>
            <p><strong>Chương trình:</strong> ${subject.program || 'Chưa có thông tin'}</p>
            ${subject.class_number ? `<p><strong>Nhóm hiện tại:</strong> ${subject.class_number}</p>` : ''}
            <p><strong>Mô tả:</strong> ${subject.description}</p>
            <p><strong>Môn tiên quyết:</strong> ${subject.prerequisites.length > 0 ? subject.prerequisites.join(', ') : 'Không có'}</p>
            ${scheduleHTML}
            ${subject.note_1 ? `<p><strong>Ghi chú 1:</strong> ${subject.note_1}</p>` : ''}
            ${subject.note_2 ? `<p><strong>Ghi chú 2:</strong> ${subject.note_2}</p>` : ''}
        </div>
    `;
    const isAlreadySelected = selectedSubjects.some(s => s.id === subject.id);
    addBtn.textContent = isAlreadySelected ? 'Đã có trong TKB' : 'Thêm vào TKB';
    addBtn.disabled = isAlreadySelected;
    if (!isAlreadySelected) {
        if (subject.class_number === 'CL') {
            addBtn.textContent = 'Thêm lớp chung';
        } else if (subject.class_number === 'N1') {
            addBtn.textContent = 'Thêm CL + N1';
        } else if (subject.class_number === 'N2') {
            addBtn.textContent = 'Thêm CL + N2';
        } else {
            addBtn.textContent = 'Thêm vào TKB';
        }
    }
    addBtn.onclick = () => {
        if (!isAlreadySelected) {
            addSubjectToSchedule(subject);
            modal.style.display = 'none';
        }
    };
    modal.style.display = 'block';
}
function createScheduleTable() {
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';
    timeSlots.forEach(slot => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.className = 'time-slot';
        timeCell.innerHTML = `<div>Ca ${slot.period}</div><div style="font-size: 10px; font-weight: normal;">${slot.time}</div>`;
        row.appendChild(timeCell);
        // Create cells for days 2-7 (Thứ 2 to Thứ 7) plus day 1 for Sunday
        for (let day = 2; day <= 7; day++) {
            const cell = document.createElement('td');
            cell.className = 'schedule-cell';
            cell.dataset.day = day;
            cell.dataset.period = slot.period;
            cell.addEventListener('dragover', handleDragOver);
            cell.addEventListener('drop', handleDrop);
            cell.addEventListener('dragleave', handleDragLeave);
            row.appendChild(cell);
        }
        // Add Sunday cell (day 1)
        const sundayCell = document.createElement('td');
        sundayCell.className = 'schedule-cell';
        sundayCell.dataset.day = 1;
        sundayCell.dataset.period = slot.period;
        sundayCell.addEventListener('dragover', handleDragOver);
        sundayCell.addEventListener('drop', handleDrop);
        sundayCell.addEventListener('dragleave', handleDragLeave);
        row.appendChild(sundayCell);
        tbody.appendChild(row);
    });
    renderSchedule();
}
function renderSchedule() {
    logInfo('Rendering schedule with selected subjects:', selectedSubjects.length);
    document.querySelectorAll('.class-item').forEach(item => item.remove());
    document.querySelectorAll('.schedule-cell').forEach(cell => {
        cell.classList.remove('occupied', 'conflict');
    });
    selectedSubjects.forEach((subject, index) => {
        logDebug(`Subject ${index + 1}:`, {
            code: subject.code,
            group: subject.class_number,
            sessions: subject.sessions.length
        });
        subject.sessions.forEach((session, sessionIndex) => {
            logDebug(`  Session ${sessionIndex + 1}:`, {
                day: session.day,
                period: session.period,
                room: session.room
            });
            const cell = document.querySelector(`[data-day="${session.day}"][data-period="${session.period}"]`);
            if (cell) {
                const classItem = createClassItem(subject, session);
                cell.appendChild(classItem);
                cell.classList.add('occupied');
                logDebug(`    Added to schedule cell successfully`);
            } else {
                logError(`Cell not found for day ${session.day}, period ${session.period}`);
            }
        });
    });
    checkScheduleConflicts();
    logSuccess('Schedule rendered successfully');
}// Tạo phần tử lớp học trong lịch
function createClassItem(subject, session) {
    const div = document.createElement('div');
    div.className = 'class-item';
    div.dataset.subjectId = subject.id;
    div.innerHTML = `
        <div class="class-code">${subject.code}</div>
        <div class="class-name">${subject.name}</div>
        <div class="class-room">${session.room}</div>
        ${subject.instructor ? `<div class="class-instructor">${subject.instructor}</div>` : ''}
    `;
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Bạn có muốn xóa môn ${subject.code} khỏi thời khóa biểu?`)) {
            removeSubjectFromSchedule(subject.id);
        }
    });
    return div;
}
function addSubjectToSchedule(subject) {
    logInfo('Adding subject to schedule:', {
        code: subject.code,
        name: subject.name,
        group: subject.class_number,
        sessions: subject.sessions.length
    });
    const sameLHPSubjects = selectedSubjects.filter(s => s.id === subject.id);
    if (sameLHPSubjects.length > 0) {
        logWarn(`Môn ${subject.id} đã có trong thời khóa biểu`);
        showToast(`Môn ${subject.id} đã có trong thời khóa biểu`, 'warning');
        return;
    }
    const allSameLHPSubjects = sampleSubjects.filter(s => s.id === subject.id);
    logDebug('All same LHP subjects found:', allSameLHPSubjects.length);
    const clSubjects = allSameLHPSubjects.filter(s => s.class_number === 'CL');
    const n1Subjects = allSameLHPSubjects.filter(s => s.class_number === 'N1');
    const n2Subjects = allSameLHPSubjects.filter(s => s.class_number === 'N2');
    logDebug('Groups found:', {
        CL: clSubjects.length,
        N1: n1Subjects.length,
        N2: n2Subjects.length
    });
    let subjectsToAdd = [];
    if (subject.class_number === 'CL') {
        subjectsToAdd = [...clSubjects];
        if (n1Subjects.length > 0 && n2Subjects.length > 0) {
            logInfo('Showing group selection modal with CL subjects:', subjectsToAdd.length);
            showGroupSelectionModal(subject, subjectsToAdd, n1Subjects, n2Subjects);
            return;
        }
        else if (n1Subjects.length > 0) {
            subjectsToAdd.push(...n1Subjects);
            showToast(`Đã thêm lớp CL + N1 cho ${subject.id}`, 'info');
        }
        else if (n2Subjects.length > 0) {
            subjectsToAdd.push(...n2Subjects);
            showToast(`Đã thêm lớp CL + N2 cho ${subject.id}`, 'info');
        }
        else {
            showToast(`Đã thêm ${clSubjects.length} tiết học cho lớp ${subject.id}`, 'info');
        }
    } else if (subject.class_number === 'N1' || subject.class_number === 'N2') {
        subjectsToAdd = [...clSubjects];
        if (subject.class_number === 'N1') {
            subjectsToAdd.push(...n1Subjects);
            showToast(`Đã thêm lớp CL + nhóm N1 cho ${subject.id}`, 'info');
        } else {
            subjectsToAdd.push(...n2Subjects);
            showToast(`Đã thêm lớp CL + nhóm N2 cho ${subject.id}`, 'info');
        }
    } else {
        subjectsToAdd = [subject];
    }
    performAddSubjects(subjectsToAdd, subject);
}
function performAddSubjects(subjectsToAdd, originalSubject) {
    logInfo('Performing add subjects:', {
        count: subjectsToAdd.length,
        subjects: subjectsToAdd.map(s => `${s.code} (${s.class_number}) - ${s.sessions.length} sessions`)
    });
    const allConflicts = [];
    subjectsToAdd.forEach(subjectToAdd => {
        const conflicts = checkSubjectConflicts(subjectToAdd);
        allConflicts.push(...conflicts);
    });
    if (allConflicts.length > 0) {
        const conflictMessages = allConflicts.map(c => `${c.code} - Thứ ${c.day}, Tiết ${c.period}`);
        logWarn('Schedule conflicts found:', conflictMessages);
        if (!confirm(`Có xung đột lịch học:\n${conflictMessages.join('\n')}\n\nBạn có muốn tiếp tục?`)) {
            return;
        }
    }
    const missingPrereqs = originalSubject.prerequisites.filter(prereq =>
        !selectedSubjects.some(s => s.code === prereq)
    );
    if (missingPrereqs.length > 0) {
        logWarn('Missing prerequisites:', missingPrereqs);
        showToast(`Cảnh báo: Môn học này cần các môn tiên quyết: ${missingPrereqs.join(', ')}`, 'warning');
    }
    selectedSubjects.push(...subjectsToAdd);
    logSuccess('Added to selectedSubjects. Total now:', selectedSubjects.length);
    renderSubjectsList();
    renderSchedule();
    updateScheduleInfo();
    const addedCount = subjectsToAdd.length;
    const mainMessage = `Đã thêm ${originalSubject.id} vào thời khóa biểu`;
    const detailMessage = addedCount > 1 ? ` (${addedCount} tiết học)` : '';
    showToast(mainMessage + detailMessage, 'success');
}
function removeSubjectFromSchedule(subjectId) {
    const clickedSubject = selectedSubjects.find(s => s.id === subjectId);
    if (!clickedSubject) return;
    const beforeCount = selectedSubjects.length;
    selectedSubjects = selectedSubjects.filter(s => s.id !== subjectId);
    const removedCount = beforeCount - selectedSubjects.length;
    renderSubjectsList();
    renderSchedule();
    updateScheduleInfo();
    const message = removedCount > 1
        ? `Đã xóa ${clickedSubject.id} khỏi thời khóa biểu (${removedCount} tiết học)`
        : `Đã xóa ${clickedSubject.id} khỏi thời khóa biểu`;
    showToast(message, 'success');
}
function checkSubjectConflicts(newSubject) {
    const conflicts = [];
    newSubject.sessions.forEach(newSession => {
        selectedSubjects.forEach(existingSubject => {
            existingSubject.sessions.forEach(existingSession => {
                if (newSession.day === existingSession.day &&
                    newSession.period === existingSession.period) {
                    conflicts.push({
                        code: existingSubject.code,
                        day: existingSession.day,
                        period: existingSession.period
                    });
                }
            });
        });
    });
    return conflicts;
}
function checkScheduleConflicts() {
    const occupiedSlots = {};
    selectedSubjects.forEach(subject => {
        subject.sessions.forEach(session => {
            const key = `${session.day}-${session.period}`;
            if (occupiedSlots[key]) {
                const cells = document.querySelectorAll(`[data-day="${session.day}"][data-period="${session.period}"]`);
                cells.forEach(cell => cell.classList.add('conflict'));
            } else {
                occupiedSlots[key] = true;
            }
        });
    });
}
function updateScheduleInfo() {
    const totalCredits = selectedSubjects.reduce((sum, subject) => sum + subject.credits, 0);
    const totalSubjects = selectedSubjects.length;
    document.getElementById('totalCredits').textContent = totalCredits;
    document.getElementById('totalSubjects').textContent = totalSubjects;
}
function handleDragStart(e, subject) {
    draggedSubject = subject;
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
}
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedSubject = null;
    document.querySelectorAll('.drop-zone, .drop-zone-invalid').forEach(cell => {
        cell.classList.remove('drop-zone', 'drop-zone-invalid');
    });
}
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedSubject) {
        const cell = e.currentTarget;
        const day = parseInt(cell.dataset.day);
        const period = parseInt(cell.dataset.period);
        const canDrop = draggedSubject.sessions.some(session =>
            session.day === day && session.period === period
        );
        if (canDrop && !cell.classList.contains('occupied')) {
            cell.classList.add('drop-zone');
        } else {
            cell.classList.add('drop-zone-invalid');
        }
    }
}
function handleDrop(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    if (draggedSubject && cell.classList.contains('drop-zone')) {
        addSubjectToSchedule(draggedSubject);
    }
    cell.classList.remove('drop-zone', 'drop-zone-invalid');
}
function handleDragLeave(e) {
    e.currentTarget.classList.remove('drop-zone', 'drop-zone-invalid');
}
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', renderSubjectsList);
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderSubjectsList();
        });
    });
    document.querySelector('.close').addEventListener('click', () => {
        logDebug('Close modal button clicked');
        const modal = document.getElementById('subjectModal');
        modal.style.display = 'none';
        modal.classList.remove('modal-force-show');
    });
    document.getElementById('closeModal').addEventListener('click', () => {
        logDebug('Close modal button clicked (closeModal)');
        const modal = document.getElementById('subjectModal');
        modal.style.display = 'none';
        modal.classList.remove('modal-force-show');
    });
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('subjectModal');
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.classList.remove('modal-force-show');
        }
    });
    document.getElementById('importPDF').addEventListener('click', openPDFReader);
    document.getElementById('exportExcel').addEventListener('click', exportScheduleToExcel);
    document.getElementById('clearSchedule').addEventListener('click', clearSchedule);
    document.getElementById('saveSchedule').addEventListener('click', saveSchedule);
    document.getElementById('loadSchedule').addEventListener('click', loadSchedule);
}
function exportScheduleToExcel() {
    if (selectedSubjects.length === 0) {
        showToast('Chưa có môn học nào trong thời khóa biểu', 'warning');
        return;
    }
    console.log('📊 Đang xuất thời khóa biểu ra Excel...');
    const scheduleMatrix = [];
    const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    scheduleMatrix.push(['Tiết', ...daysOfWeek]);
    for (let period = 1; period <= 15; period++) {
        const row = [`Tiết ${period}`];
        for (let day = 1; day <= 7; day++) {
            let cellContent = '';
            selectedSubjects.forEach(subject => {
                subject.sessions.forEach(session => {
                    if (session.day === day && session.period === period) {
                        cellContent = `${subject.code}\n${subject.name}\n${session.room}\n${subject.instructor}`;
                    }
                });
            });
            row.push(cellContent);
        }
        scheduleMatrix.push(row);
    }
    const worksheet = XLSX.utils.aoa_to_sheet(scheduleMatrix);
    const colWidths = [
        { wch: 10 },  // Tiết
        { wch: 25 },  // Thứ 2
        { wch: 25 },  // Thứ 3
        { wch: 25 },  // Thứ 4
        { wch: 25 },  // Thứ 5
        { wch: 25 },  // Thứ 6
        { wch: 25 },  // Thứ 7
        { wch: 25 }   // Chủ nhật
    ];
    worksheet['!cols'] = colWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Thời Khóa Biểu');
    const detailData = [
        ['STT', 'Mã HP', 'Tên môn học', 'Tín chỉ', 'Lớp HP', 'Nhóm', 'Giảng viên', 'Thứ', 'Tiết', 'Phòng học'],
        ...selectedSubjects.map((subject, index) => {
            return subject.sessions.map((session, sessionIndex) => [
                sessionIndex === 0 ? index + 1 : '',
                sessionIndex === 0 ? subject.code : '',
                sessionIndex === 0 ? subject.name : '',
                sessionIndex === 0 ? subject.credits : '',
                sessionIndex === 0 ? subject.id : '',
                sessionIndex === 0 ? subject.class_number : '',
                sessionIndex === 0 ? subject.instructor : '',
                `Thứ ${session.day}`,
                session.period,
                session.room
            ]);
        }).flat()
    ];
    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
    detailSheet['!cols'] = [
        { wch: 5 },   // STT
        { wch: 12 },  // Mã HP
        { wch: 40 },  // Tên môn học
        { wch: 8 },   // Tín chỉ
        { wch: 15 },  // Lớp HP
        { wch: 8 },   // Nhóm
        { wch: 25 },  // Giảng viên
        { wch: 10 },  // Thứ
        { wch: 8 },   // Tiết
        { wch: 20 }   // Phòng học
    ];
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Chi tiết môn học');
    const now = new Date();
    const fileName = `TKB_UET_HKI_2025-2026_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    console.log(`✅ Đã xuất thời khóa biểu ra file: ${fileName}`);
    showToast(`Đã xuất thời khóa biểu ra file Excel: ${fileName}`, 'success');
}
function openPDFReader() {
    window.open('pdf-reader.html', '_blank');
}
function clearSchedule() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ thời khóa biểu?')) {
        selectedSubjects = [];
        renderSubjectsList();
        renderSchedule();
        updateScheduleInfo();
        showToast('Đã xóa toàn bộ thời khóa biểu', 'success');
    }
}
function saveSchedule() {
    const scheduleData = {
        subjects: selectedSubjects.map(s => s.id),
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('uet_schedule', JSON.stringify(scheduleData));
    showToast('Đã lưu thời khóa biểu', 'success');
}
function loadSchedule() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    loadScheduleFromData(data);
                    showToast('Đã tải thời khóa biểu từ file', 'success');
                } catch (error) {
                    showToast('File không hợp lệ', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}
function loadSavedSchedule() {
    const saved = localStorage.getItem('uet_schedule');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            loadScheduleFromData(data);
        } catch (error) {
            console.error('Error loading saved schedule:', error);
        }
    }
}
function loadScheduleFromData(data) {
    if (data.subjects && Array.isArray(data.subjects)) {
        selectedSubjects = [];
        data.subjects.forEach(subjectId => {
            const subject = sampleSubjects.find(s => s.id === subjectId);
            if (subject) {
                selectedSubjects.push(subject);
            }
        });
        renderSubjectsList();
        renderSchedule();
        updateScheduleInfo();
    }
}
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
function getTypeDisplayName(type) {
    const typeNames = {
        'major': 'Chuyên ngành',
        'general': 'Đại cương',
        'elective': 'Tự chọn'
    };
    return typeNames[type] || type;
}
function determineSubjectType(code, name) {
    if (code.startsWith('INT') || code.startsWith('ICT') || code.startsWith('AIT') ||
        code.startsWith('CTE') || code.startsWith('RBE')) {
        return 'major';
    } else if (code.startsWith('MAT') || code.startsWith('PHY') ||
              code.startsWith('ENG') || code.startsWith('HIS') ||
              code.startsWith('POL') || code.startsWith('SCI')) {
        return 'general';
    } else {
        return 'elective';
    }
}
function exportSchedule() {
    const scheduleData = {
        subjects: selectedSubjects,
        timestamp: new Date().toISOString(),
        metadata: {
            totalCredits: selectedSubjects.reduce((sum, subject) => sum + subject.credits, 0),
            totalSubjects: selectedSubjects.length
        }
    };
    const dataStr = JSON.stringify(scheduleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `tkb_uet_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Đã xuất thời khóa biểu', 'success');
}
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const actionsDiv = document.querySelector('.actions');
        if (actionsDiv) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-primary';
            exportBtn.innerHTML = '📤 Xuất TKB';
            exportBtn.addEventListener('click', exportSchedule);
            actionsDiv.appendChild(exportBtn);
        }
    }, 1000);
});
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                saveSchedule();
                break;
            case 'o':
                e.preventDefault();
                loadSchedule();
                break;
            case 'n':
                e.preventDefault();
                clearSchedule();
                break;
        }
    }
});