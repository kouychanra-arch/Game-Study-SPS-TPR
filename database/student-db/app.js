// Initialize the shared UI layout
document.addEventListener('DOMContentLoaded', () => {
  initSharedPage('២២. ឃ្លាំងទិន្នន័យសិស្ស (Student Database)', true);
  
  // Set up search listener
  document.getElementById('dbSearch').addEventListener('input', renderTable);
  
  // Set up file input listener for Excel import
  document.getElementById('excelInput').addEventListener('change', handleExcelImport);

  // Load table data
  renderTable();
});

// Render table elements
function renderTable() {
  const students = getStudents();
  const tbody = document.getElementById('studentTableBody');
  const query = document.getElementById('dbSearch').value.toLowerCase().trim();
  
  tbody.innerHTML = '';
  
  let maleCount = 0;
  let femaleCount = 0;
  let scoreSum = 0;
  let matchCount = 0;

  students.forEach((student, index) => {
    // Collect totals regardless of search filter
    if (student.gender === 'ប្រុស') maleCount++;
    if (student.gender === 'ស្រី') femaleCount++;
    scoreSum += Number(student.score);
    
    // Filter matching
    const matchesSearch = student.name.toLowerCase().includes(query);
    if (!matchesSearch && query !== '') return;

    matchCount++;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${escapeHtml(student.name)}</strong></td>
      <td>
        <span class="gender-badge ${student.gender === 'ស្រី' ? 'gender-female' : 'gender-male'}">
          ${student.gender === 'ស្រី' ? '👩 ស្រី' : '👦 ប្រុស'}
        </span>
      </td>
      <td><span style="font-weight: 700;">${student.score}</span> / ១០០</td>
      <td style="text-align: center;">
        <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; margin-right: 0.5rem;" onclick="openEditModal(${index})">📝 កែ</button>
        <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="deleteStudent(${index})">🗑️ លុប</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (tbody.children.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          ❌ គ្មានទិន្នន័យសិស្សឡើយ។ សូមចុចប៊ូតុង "បន្ថែមសិស្ស" ឬ "បញ្ចូលពី Excel"។
        </td>
      </tr>
    `;
  }

  // Update Stats Cards
  document.getElementById('totalStudents').textContent = students.length;
  document.getElementById('totalMale').textContent = maleCount;
  document.getElementById('totalFemale').textContent = femaleCount;
  const avg = students.length > 0 ? (scoreSum / students.length).toFixed(1) : 0;
  document.getElementById('avgScore').textContent = avg;
}

// Modal handling
function openAddModal() {
  playClickSound();
  document.getElementById('modalTitle').textContent = '➕ បន្ថែមសិស្សថ្មី';
  document.getElementById('studentIndex').value = '';
  document.getElementById('studName').value = '';
  document.getElementById('studGender').value = 'ប្រុស';
  document.getElementById('studScore').value = '';
  
  document.getElementById('studentModal').classList.add('active');
}

function openEditModal(index) {
  playClickSound();
  const students = getStudents();
  const student = students[index];
  
  document.getElementById('modalTitle').textContent = '📝 កែប្រែទិន្នន័យសិស្ស';
  document.getElementById('studentIndex').value = index;
  document.getElementById('studName').value = student.name;
  document.getElementById('studGender').value = student.gender;
  document.getElementById('studScore').value = student.score;
  
  document.getElementById('studentModal').classList.add('active');
}

function closeModal() {
  playClickSound();
  document.getElementById('studentModal').classList.remove('active');
}

// Save Student Form
function saveStudentForm(event) {
  event.preventDefault();
  playClickSound();
  
  const indexVal = document.getElementById('studentIndex').value;
  const name = document.getElementById('studName').value.trim();
  const gender = document.getElementById('studGender').value;
  const score = parseInt(document.getElementById('studScore').value);

  if (!name) {
    showToast('សូមបញ្ចូលឈ្មោះសិស្ស!', 'error');
    return;
  }
  if (isNaN(score) || score < 0 || score > 100) {
    showToast('ពិន្ទុត្រូវចន្លោះពី ០ ដល់ ១០០!', 'error');
    return;
  }

  const students = getStudents();
  const newStudent = { name, gender, score };

  if (indexVal === '') {
    // Add new
    students.push(newStudent);
    showToast('បានបន្ថែមសិស្សថ្មីដោយជោគជ័យ!', 'success');
  } else {
    // Edit existing
    const idx = parseInt(indexVal);
    students[idx] = newStudent;
    showToast('បានកែប្រែទិន្នន័យសិស្សរួចរាល់!', 'success');
  }

  saveStudents(students);
  closeModal();
  renderTable();
  playSuccessSound();
}

// Delete student
function deleteStudent(index) {
  playClickSound();
  if (confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សនេះមែនទេ?')) {
    const students = getStudents();
    students.splice(index, 1);
    saveStudents(students);
    renderTable();
    showToast('បានលុបទិន្នន័យសិស្សរួចរាល់!', 'success');
  }
}

// Clear all database
function clearDatabase() {
  playClickSound();
  if (confirm('⚠️ ប្រយ័ត្ន៖ តើអ្នកចង់សម្អាតលុបទិន្នន័យសិស្សទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានឡើយ!')) {
    saveStudents([]);
    renderTable();
    showToast('បានលុបសម្អាតឃ្លាំងទិន្នន័យទាំងអស់!', 'success');
  }
}

// Excel Export function (SheetJS)
function exportToExcel() {
  playClickSound();
  const students = getStudents();
  if (students.length === 0) {
    showToast('គ្មានទិន្នន័យសម្រាប់នាំចេញទេ!', 'error');
    playFailSound();
    return;
  }

  // Format data for spreadsheet
  const data = students.map((s, idx) => ({
    'ល.រ': idx + 1,
    'ឈ្មោះសិស្ស': s.name,
    'ភេទ': s.gender,
    'ពិន្ទុ': s.score
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb = workbook, worksheet, "បញ្ជីពិន្ទុសិស្ស");
  
  // Download file
  XLSX.writeFile(workbook, "បញ្ជីពិន្ទុសិស្ស_បឋមសិក្សា.xlsx");
  showToast('បាននាំចេញឯកសារ Excel ជោគជ័យ!', 'success');
  playSuccessSound();
  triggerConfetti();
}

// Excel Template download
function downloadTemplate() {
  playClickSound();
  const templateData = [
    { 'ឈ្មោះសិស្ស': 'កុសល', 'ភេទ': 'ប្រុស', 'ពិន្ទុ': 85 },
    { 'ឈ្មោះសិស្ស': 'សុភា', 'ភេទ': 'ស្រី', 'ពិន្ទុ': 90 },
    { 'ឈ្មោះសិស្ស': 'វិច្ឆិកា', 'ភេទ': 'ស្រី', 'ពិន្ទុ': 78 }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "គំរូសិស្ស");
  
  XLSX.writeFile(workbook, "គំរូ_បញ្ជីឈ្មោះសិស្ស.xlsx");
  showToast('បានទាញយកឯកសារគំរូ Excel ជោគជ័យ!', 'success');
  playSuccessSound();
}

// Excel Import function (SheetJS)
function handleExcelImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  playClickSound();
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const importedStudents = jsonData.map(row => {
        // Try various column names (Khmer and English fallbacks)
        const name = row['ឈ្មោះសិស្ស'] || row['ឈ្មោះ'] || row['Name'] || row['name'] || '';
        const gender = row['ភេទ'] || row['Gender'] || row['gender'] || 'ប្រុស';
        const score = parseInt(row['ពិន្ទុ'] || row['Score'] || row['score'] || 0);
        
        return {
          name: name.toString().trim(),
          gender: (gender.toString().trim() === 'ស្រី' || gender.toString().trim().toLowerCase() === 'female') ? 'ស្រី' : 'ប្រុស',
          score: isNaN(score) ? 0 : Math.min(100, Math.max(0, score))
        };
      }).filter(s => s.name !== '');

      if (importedStudents.length > 0) {
        const current = getStudents();
        const combined = [...current, ...importedStudents];
        saveStudents(combined);
        renderTable();
        showToast(`បានបញ្ចូលសិស្សចំនួន ${importedStudents.length} នាក់ជោគជ័យ!`, 'success');
        playSuccessSound();
        triggerConfetti();
      } else {
        showToast('រកមិនឃើញទិន្នន័យសិស្សត្រឹមត្រូវនៅក្នុងឯកសារ Excel ទេ!', 'error');
        playFailSound();
      }
    } catch (err) {
      console.error(err);
      showToast('ការអានឯកសារ Excel មានបញ្ហា!', 'error');
      playFailSound();
    }
  };

  reader.readAsArrayBuffer(file);
  // Clear the input so same file can be uploaded again
  event.target.value = '';
}

// Helper to escape HTML tags
function escapeHtml(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}
