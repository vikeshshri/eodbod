(function fetchTasks() {
  var tasksSection = document.getElementById("tasks-list");
  if (!tasksSection) return;
  fetch("http://127.0.0.1:8000/admin/submissions")
    .then(function (res) { return res.json(); })
    .then(function (tasks) {
      if (!tasks.length) {
        tasksSection.innerHTML = "<p>No tasks submitted yet.</p>";
        return;
      }
      var html = '<table style="width:100%;border-collapse:collapse;">';
      html += '<thead><tr><th>Name</th><th>Number</th><th>Location</th><th>Message</th><th>Urgency</th><th>Date</th></tr></thead><tbody>';
      tasks.forEach(function (t) {
        html += `<tr><td>${t.name||""}</td><td>${t.phone||""}</td><td>${t.location||""}</td><td>${t.message||""}</td><td>${t.urgency||""}</td><td>${t.created_at||""}</td></tr>`;
      });
      html += '</tbody></table>';
      tasksSection.innerHTML = html;
    })
    .catch(function () {
      tasksSection.innerHTML = "<p style='color:red;'>Could not load tasks. Backend may be down.</p>";
    });
})();
(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("nav-drawer");
  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        drawer.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var form = document.getElementById("contact-form");
  var msg = document.getElementById("form-message");
  if (form && msg) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.classList.remove("visible", "success", "error");
      if (!form.checkValidity()) {
        var firstInvalid = form.querySelector("input:invalid, select:invalid, textarea:invalid");
        if (firstInvalid && typeof firstInvalid.focus === "function") {
          firstInvalid.focus();
        }
        msg.textContent =
          "Almost there—please fill in the parts marked as required, then try again.";
        msg.classList.add("visible", "error");
        return;
      }

      // Gather form data (now includes location, phone, urgency)
      var data = {
        name: form.elements["fullName"].value,
        email: form.elements["email"].value,
        phone: form.elements["phone"].value,
        location: form.elements["location"].value,
        urgency: form.elements["workUrgency"].value,
        message: form.elements["workDescription"].value
      };

      fetch("http://127.0.0.1:8000/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then(function (result) {
          if (result.status === "success") {
            form.reset();
            if (thankyouModal) thankyouModal.style.display = "flex";
          } else {
            msg.textContent = "Sorry, something went wrong. Please try again later.";
            msg.classList.add("visible", "error");
          }
        })
        .catch(function (error) {
          msg.textContent = "Sorry, something went wrong. Please try again later.";
          msg.classList.add("visible", "error");
        });
    });
  }

  // Modal logic
  var thankyouModal = document.getElementById("thankyou-modal");
  var closeModalBtn = document.getElementById("close-thankyou-modal");
  if (closeModalBtn) {
    closeModalBtn.onclick = function() {
      thankyouModal.style.display = "none";
    };
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -32px 0px", threshold: 0.06 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
