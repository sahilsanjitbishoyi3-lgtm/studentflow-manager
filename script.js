
"use strict";

// ==========================================
// STUDENTFLOW - SMART STUDENT MANAGEMENT
// ==========================================

// SAMPLE STUDENTS
const sampleStudents = [
  {
    name: "Aarav Sharma",
    email: "aarav@gmail.com",
    id: "STU001",
    course: "Computer Science",
    date: "2026-09-12",
    status: "Active"
  },
  {
    name: "Priya Patel",
    email: "priya@gmail.com",
    id: "STU002",
    course: "Web Development",
    date: "2026-09-15",
    status: "Active"
  },
  {
    name: "Rohan Das",
    email: "rohan@gmail.com",
    id: "STU003",
    course: "Data Science",
    date: "2026-09-20",
    status: "Inactive"
  },
  {
    name: "Ananya Roy",
    email: "ananya@gmail.com",
    id: "STU004",
    course: "UI/UX Design",
    date: "2026-10-01",
    status: "Active"
  },
  {
    name: "Kabir Mehta",
    email: "kabir@gmail.com",
    id: "STU005",
    course: "Computer Science",
    date: "2026-10-05",
    status: "Active"
  }
];

// ==========================================
// STORAGE
// ==========================================

const STORAGE_KEY = "studentFlowData";

function loadStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return sampleStudents;
    }

    const data = JSON.parse(saved);

    if (!Array.isArray(data)) {
      return sampleStudents;
    }

    return data;
  } catch (error) {
    console.error("Could not load student data:", error);
    return sampleStudents;
  }
}

let students = loadStudents();

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    return true;
  } catch (error) {
    console.error("Could not save student data:", error);
    alert("Unable to save data in this browser.");
    return false;
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date + "T00:00:00");

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function renderDashboard() {
  const active = students.filter(
    student => student.status === "Active"
  ).length;

  const inactive = students.filter(
    student => student.status === "Inactive"
  ).length;

  const courses = new Set(
    students.map(student => student.course.trim().toLowerCase())
  );

  $("totalStudents").textContent = students.length;
  $("activeStudents").textContent = active;
  $("inactiveStudents").textContent = inactive;
  $("totalCourses").textContent = courses.size;
  $("studentCount").textContent = students.length;

  updateCourseFilter();
  renderStudents();
}

// ==========================================
// COURSE FILTER
// ==========================================

function updateCourseFilter() {
  const select = $("courseFilter");
  const current = select.value;

  const courses = [
    ...new Set(
      students.map(student => student.course).filter(Boolean)
    )
  ];

  select.innerHTML =
    '<option value="All">All Courses</option>' +
    courses.map(course =>
      `<option value="${escapeHTML(course)}">${escapeHTML(course)}</option>`
    ).join("");

  if (courses.includes(current)) {
    select.value = current;
  }
}

// ==========================================
// DISPLAY STUDENTS
// ==========================================

function renderStudents() {
  const search = $("searchInput").value.toLowerCase().trim();
  const status = $("statusFilter").value;
  const course = $("courseFilter").value;

  const filtered = students
    .map((student, index) => ({ ...student, index }))
    .filter(student => {

      const matchesSearch = [
        student.name,
        student.email,
        student.id,
        student.course
      ].some(value =>
        value.toLowerCase().includes(search)
      );

      const matchesStatus =
        status === "All" || student.status === status;

      const matchesCourse =
        course === "All" || student.course === course;

      return matchesSearch && matchesStatus && matchesCourse;
    });

  const colors = [
    ["#321747", "#e4a0ff"],
    ["#153c36", "#72e9b3"],
    ["#452a1c", "#ffc17d"],
    ["#172c4d", "#88baff"],
    ["#461d37", "#ff9acb"]
  ];

  $("studentTable").innerHTML = filtered.map(student => {

    const color = colors[student.index % colors.length];

    return `
      <tr>
        <td>
          <div class="student-cell">
            <div class="student-avatar"
              style="background:${color[0]};color:${color[1]}">
              ${escapeHTML(initials(student.name))}
            </div>

            <div>
              <div class="student-name">
                ${escapeHTML(student.name)}
              </div>

              <div class="student-email">
                ${escapeHTML(student.email)}
              </div>
            </div>
          </div>
        </td>

        <td>
          <span class="id-text">${escapeHTML(student.id)}</span>
        </td>

        <td>${escapeHTML(student.course)}</td>

        <td>${formatDate(student.date)}</td>

        <td>
          <span class="status ${student.status}">
            ${student.status}
          </span>
        </td>

        <td>
          <button class="action-btn edit"
            data-index="${student.index}" title="Edit Student">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button class="action-btn delete"
            data-index="${student.index}" title="Delete Student">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("emptyState").style.display =
    filtered.length ? "none" : "block";

  $("showingText").textContent =
    `Showing ${filtered.length} of ${students.length} students`;
}

// ==========================================
// OPEN ADD / EDIT MODAL
// ==========================================

function openModal(index = null) {

  $("studentForm").reset();

  $("editIndex").value =
    index === null ? "" : index;

  $("modalTitle").textContent =
    index === null ? "Add New Student" : "Edit Student";

  $("studentDate").value =
    new Date().toLocaleDateString("en-CA");

  $("studentStatus").value = "Active";

  if (index !== null) {

    const student = students[index];

    if (!student) return;

    $("studentName").value = student.name;
    $("studentEmail").value = student.email;
    $("studentId").value = student.id;
    $("studentCourse").value = student.course;
    $("studentDate").value = student.date;
    $("studentStatus").value = student.status;
  }

  $("studentModal").classList.add("show");
  $("studentName").focus();
}

function closeModal() {
  $("studentModal").classList.remove("show");
}

// ==========================================
// MODAL BUTTONS
// ==========================================

$("addStudentBtn").addEventListener("click", () => {
  openModal();
});

$("bannerAdd").addEventListener("click", () => {
  openModal();
});

$("enrollmentLink").addEventListener("click", () => {
  openModal();
});

$("closeModal").addEventListener("click", closeModal);

$("cancelModal").addEventListener("click", closeModal);

$("studentModal").addEventListener("click", event => {
  if (event.target === $("studentModal")) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});

// ==========================================
// ADD AND UPDATE STUDENTS
// ==========================================

$("studentForm").addEventListener("submit", event => {

  event.preventDefault();

  const editIndex = $("editIndex").value;

  const student = {
    name: $("studentName").value.trim(),
    email: $("studentEmail").value.trim(),
    id: $("studentId").value.trim(),
    course: $("studentCourse").value.trim(),
    date: $("studentDate").value,
    status: $("studentStatus").value
  };

  // CHECK REQUIRED INFORMATION

  if (
    !student.name ||
    !student.email ||
    !student.id ||
    !student.course ||
    !student.date
  ) {
    alert("Please fill in all student details.");
    return;
  }

  // CHECK DUPLICATE STUDENT ID

  const duplicate = students.some((existing, index) =>
    existing.id.toLowerCase() === student.id.toLowerCase() &&
    String(index) !== editIndex
  );

  if (duplicate) {
    alert("This Student ID already exists. Please use another ID.");
    return;
  }

  // ADD STUDENT

  if (editIndex === "") {

    students.unshift(student);

    if (!saveData()) {
      students.shift();
      return;
    }

    showToast("Student added successfully!");

  } else {

    // UPDATE STUDENT

    const index = Number(editIndex);

    if (!Number.isInteger(index) || !students[index]) {
      alert("Student record not found.");
      return;
    }

    const previousStudent = students[index];

    students[index] = student;

    if (!saveData()) {
      students[index] = previousStudent;
      return;
    }

    showToast("Student updated successfully!");
  }

  renderDashboard();
  closeModal();
});

// ==========================================
// EDIT AND DELETE STUDENTS
// ==========================================

$("studentTable").addEventListener("click", event => {

  const button = event.target.closest("button");

  if (!button) return;

  const index = Number(button.dataset.index);

  if (!Number.isInteger(index) || !students[index]) return;

  // EDIT

  if (button.classList.contains("edit")) {
    openModal(index);
  }

  // DELETE

  if (button.classList.contains("delete")) {

    const confirmed = confirm(
      `Are you sure you want to delete ${students[index].name}?`
    );

    if (confirmed) {

      const deleted = students.splice(index, 1);

      if (!saveData()) {
        students.splice(index, 0, deleted[0]);
        return;
      }

      renderDashboard();

      showToast("Student deleted successfully!");
    }
  }
});

// ==========================================
// SEARCH
// ==========================================

$("searchInput").addEventListener("input", renderStudents);

// ==========================================
// STATUS FILTER
// ==========================================

$("statusFilter").addEventListener("change", renderStudents);

// ==========================================
// COURSE FILTER
// ==========================================

$("courseFilter").addEventListener("change", renderStudents);

// ==========================================
// TOAST NOTIFICATION
// ==========================================

let toastTimer;

function showToast(message) {

  $("toastMessage").textContent = message;

  $("toast").classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    $("toast").classList.remove("show");
  }, 2500);
}

// ==========================================
// CURRENT DATE
// ==========================================

$("todayDate").textContent =
  new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

renderDashboard();

console.log("StudentFlow initialized successfully!");
console.log("Total students:", students.length);
