
// STUDENTFLOW - STUDENT MANAGEMENT SYSTEM

const sampleStudents = [
  {name:"Aarav Sharma",email:"aarav@gmail.com",id:"STU001",course:"Computer Science",date:"2026-09-12",status:"Active"},
  {name:"Priya Patel",email:"priya@gmail.com",id:"STU002",course:"Web Development",date:"2026-09-15",status:"Active"},
  {name:"Rohan Das",email:"rohan@gmail.com",id:"STU003",course:"Data Science",date:"2026-09-20",status:"Inactive"},
  {name:"Ananya Roy",email:"ananya@gmail.com",id:"STU004",course:"UI/UX Design",date:"2026-10-01",status:"Active"},
  {name:"Kabir Mehta",email:"kabir@gmail.com",id:"STU005",course:"Computer Science",date:"2026-10-05",status:"Active"}
];

let students = JSON.parse(localStorage.getItem("studentFlowData")) || sampleStudents;

const $ = id => document.getElementById(id);

function saveData() {
  localStorage.setItem("studentFlowData", JSON.stringify(students));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;",
    '"':"&quot;", "'":"&#39;"
  })[char]);
}

function initials(name) {
  return name.split(" ").map(part => part[0]).slice(0,2).join("").toUpperCase();
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    day:"2-digit", month:"short", year:"numeric"
  });
}

function renderDashboard() {
  const active = students.filter(s => s.status === "Active").length;
  const inactive = students.filter(s => s.status === "Inactive").length;
  const courses = [...new Set(students.map(s => s.course.trim().toLowerCase()).filter(Boolean))];

  $("totalStudents").textContent = students.length;
  $("activeStudents").textContent = active;
  $("inactiveStudents").textContent = inactive;
  $("totalCourses").textContent = courses.length;
  $("studentCount").textContent = students.length;

  updateCourseFilter();
  renderStudents();
}

function updateCourseFilter() {
  const select = $("courseFilter");
  const current = select.value;
  const courses = [...new Set(students.map(s => s.course).filter(Boolean))];

  select.innerHTML = '<option value="All">All Courses</option>' +
    courses.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");

  if (courses.includes(current)) select.value = current;
}

function renderStudents() {
  const search = $("searchInput").value.toLowerCase().trim();
  const status = $("statusFilter").value;
  const course = $("courseFilter").value;

  const filtered = students.map((student,index) => ({...student,index}))
    .filter(s => {
      const matchesSearch = [s.name,s.email,s.id,s.course]
        .some(value => value.toLowerCase().includes(search));

      const matchesStatus = status === "All" || s.status === status;
      const matchesCourse = course === "All" || s.course === course;

      return matchesSearch && matchesStatus && matchesCourse;
    });

  $("studentTable").innerHTML = filtered.map(s => {
    const colors = [
      ["#eeeaff","#7765df"],
      ["#e8f7f0","#38a879"],
      ["#fff0e5","#dc9552"],
      ["#e9f2ff","#538edb"],
      ["#ffeaf1","#d66f96"]
    ];
    const color = colors[s.index % colors.length];

    return `
      <tr>
        <td>
          <div class="student-cell">
            <div class="student-avatar" style="background:${color[0]};color:${color[1]}">
              ${escapeHTML(initials(s.name))}
            </div>
            <div>
              <div class="student-name">${escapeHTML(s.name)}</div>
              <div class="student-email">${escapeHTML(s.email)}</div>
            </div>
          </div>
        </td>
        <td><span class="id-text">${escapeHTML(s.id)}</span></td>
        <td>${escapeHTML(s.course)}</td>
        <td>${formatDate(s.date)}</td>
        <td><span class="status ${s.status}">${s.status}</span></td>
        <td>
          <button class="action-btn edit" data-index="${s.index}" title="Edit">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-btn delete" data-index="${s.index}" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>`;
  }).join("");

  $("emptyState").style.display = filtered.length ? "none" : "block";
  $("showingText").textContent =
    `Showing ${filtered.length} of ${students.length} students`;
}

// OPEN AND CLOSE MODAL
function openModal(index = null) {
  $("studentForm").reset();
  $("editIndex").value = index === null ? "" : index;
  $("modalTitle").textContent = index === null ? "Add New Student" : "Edit Student";

  $("studentDate").value = new Date().toISOString().slice(0,10);
  $("studentStatus").value = "Active";

  if (index !== null) {
    const s = students[index];
    $("studentName").value = s.name;
    $("studentEmail").value = s.email;
    $("studentId").value = s.id;
    $("studentCourse").value = s.course;
    $("studentDate").value = s.date;
    $("studentStatus").value = s.status;
  }

  $("studentModal").classList.add("show");
  $("studentName").focus();
}

function closeModal() {
  $("studentModal").classList.remove("show");
}

$("addStudentBtn").addEventListener("click", () => openModal());
$("bannerAdd").addEventListener("click", () => openModal());
$("closeModal").addEventListener("click", closeModal);
$("cancelModal").addEventListener("click", closeModal);

$("studentModal").addEventListener("click", e => {
  if (e.target === $("studentModal")) closeModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

// ADD OR UPDATE STUDENT
$("studentForm").addEventListener("submit", e => {
  e.preventDefault();

  const editIndex = $("editIndex").value;

  const student = {
    name: $("studentName").value.trim(),
    email: $("studentEmail").value.trim(),
    id: $("studentId").value.trim(),
    course: $("studentCourse").value.trim(),
    date: $("studentDate").value,
    status: $("studentStatus").value
  };

  const duplicate = students.some((s,i) =>
    s.id.toLowerCase() === student.id.toLowerCase() &&
    String(i) !== editIndex
  );

  if (duplicate) {
    alert("This Student ID already exists. Please use a different ID.");
    return;
  }

  if (editIndex === "") {
    students.unshift(student);
    showToast("Student added successfully!");
  } else {
    students[Number(editIndex)] = student;
    showToast("Student updated successfully!");
  }

  saveData();
  renderDashboard();
  closeModal();
});

// EDIT AND DELETE
$("studentTable").addEventListener("click", e => {
  const button = e.target.closest("button");
  if (!button) return;

  const index = Number(button.dataset.index);

  if (button.classList.contains("edit")) {
    openModal(index);
  }

  if (button.classList.contains("delete")) {
    const confirmed = confirm(
      `Are you sure you want to delete ${students[index].name}?`
    );

    if (confirmed) {
      students.splice(index,1);
      saveData();
      renderDashboard();
      showToast("Student deleted successfully!");
    }
  }
});

// SEARCH AND FILTERS
$("searchInput").addEventListener("input", renderStudents);
$("statusFilter").addEventListener("change", renderStudents);
$("courseFilter").addEventListener("change", renderStudents);

// TOAST NOTIFICATION
let toastTimer;

function showToast(message) {
  $("toastMessage").textContent = message;
  $("toast").classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    $("toast").classList.remove("show");
  }, 2500);
}

// CURRENT DATE
$("todayDate").textContent = new Date().toLocaleDateString("en-IN", {
  day:"numeric", month:"short", year:"numeric"
});

// INITIALIZE APP
saveData();
renderDashboard();
