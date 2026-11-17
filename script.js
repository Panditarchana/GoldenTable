const menuToggle = document.querySelector("#menu-toggle");

const mobileMenu = document.getElementById("mobile-menu");

const menuIcon = document.getElementById("menu-toggle").querySelector("i");
menuToggle.addEventListener("click", function() {
  mobileMenu.classList.toggle("show");
  menuToggle.setAttribute(
    "aria-expanded",
    mobileMenu.classList.contains("show")
    );
  menuIcon.classList.toggle("fa-bars");
  menuIcon.classList.toggle("fa-xmark");
})

const openingHours = {
    Sunday: { open: 11, close: 22 },
    Monday: { open: 11, close: 22 },
    Tuesday: { open: 11, close: 22 },
    Wednesday: { open: 11, close: 22 },
    Thursday: { open: 11, close: 22 },
    Friday: { open: 11, close: 22 },
    Saturday: { open: 11, close: 22 },
};

const dayNames = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

const statusText = document.getElementById("status-text");

const statusDot = document.getElementById("status-dot");

function updateStatus() {
    const currentDate = new Date();
    const currentDay = dayNames[currentDate.getDay()];
    const todayHours = openingHours[currentDay];
    const currentHour = currentDate.getHours();
    
    if (currentHour >= todayHours.open && currentHour < todayHours.close) {
        statusText.textContent = "Open";
        statusText.style.color = "#4caf50";
        statusDot.style.backgroundColor = "#4caf50";
    } else {
        statusText.textContent = "Closed";
        statusText.style.color = "#888888";
        statusDot.style.backgroundColor = "#888888";
    }   
}

updateStatus();

setInterval(updateStatus, 60000);

const bookBtn = document.getElementById("book-btn");
const reservationModal = document.getElementById("reservation-modal");
const closeBtn = document.getElementById("close-btn");
bookBtn.addEventListener("click", function() {
    reservationModal.classList.add("active");
});
closeBtn.addEventListener("click", function() {
    reservationModal.classList.remove("active");
});

reservationModal.addEventListener("click", function(event) {
    if (event.target === reservationModal) {
        reservationModal.classList.remove("active");
    }
});

const reservationForm = document.getElementById("reservation-form");
const confirmationModal = document.getElementById("confirmation-modal");
const confirmationName = document.getElementById("confirmation-name");
const confirmationPhone = document.getElementById("confirmation-phone");
const confirmationGuests = document.getElementById("confirmation-guests");
const confirmationDate = document.getElementById("confirmation-date");
const confirmationTime = document.getElementById("confirmation-time");

const nameError = document.getElementById("name-error");
const LnameError = document.getElementById("Lname-error")
const phoneError = document.getElementById("phone-error");
const guestsError = document.getElementById("guests-error");
const dateError = document.getElementById("date-error");
const timeError = document.getElementById("time-error");

const nameInput = document.getElementById("name");
const LnameInput = document.getElementById("Lname");
const phoneInput = document.getElementById("phone");
const guestsInput = document.getElementById("guests");
const dateInput = document.getElementById("booking-date");
const timeInput = document.getElementById("booking-time");

const namePattern = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

const STORAGE_KEY = "goldenTableBookings";

reservationForm.addEventListener("submit", function(event) {
    event.preventDefault();

    nameError.textContent = "";
    LnameError.textContent = "";
    phoneError.textContent = "";
    guestsError.textContent = "";
    dateError.textContent = "";
    timeError.textContent = "";

    const name = nameInput.value.trim();
    const Lname = LnameInput.value.trim();
    const phone = phoneInput.value.trim();
    const guests = guestsInput.value;
    const bookingDate = dateInput.value;
    const bookingTime = timeInput.value;

    let isValid = true;

    if (name.length < 2 || !namePattern.test(name)) {
    nameError.textContent = "Please enter a valid first name.";
    isValid = false;
    }


    if (Lname.length < 2 || !namePattern.test(Lname)) {
    LnameError.textContent = "Please enter a valid last name.";
    isValid = false;
    }

    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(phone)) {
        phoneError.textContent = "Please enter a valid 10-digit mobile number.";
        isValid = false;
    }

    if (!guests) {
        guestsError.textContent = "Please select the number of guests.";
        isValid = false;
    }

    const currentDate = new Date();
    const today = getTodayDate();

    if (!bookingDate || bookingDate < today) {
        dateError.textContent = "Please select today or a future date.";
        isValid = false;
    }

    let hours = 0;
    let minutes = 0;

    if (!bookingTime) {
        timeError.textContent = "Please select a reservation time.";
        isValid = false;

    } else {
        [hours, minutes] = bookingTime.split(":").map(Number);

        const selectedTime = hours * 60 + minutes;
        const openingTime = 11 * 60;
        const closingTime = 22 * 60;

        if (selectedTime < openingTime || selectedTime >= closingTime) {
            timeError.textContent =
                "Please select a time between 11 AM and 10 PM.";
            isValid = false;

        } else if (bookingDate === today) {
            const currentTime =
                currentDate.getHours() * 60 + currentDate.getMinutes();

            if (selectedTime <= currentTime) {
                timeError.textContent =
                    "Please select a future reservation time.";
                isValid = false;
            }
        }
    }

    if (!isValid) {
        return;
    }

    const booking = {
    bookingId: "GT-" + Date.now(),
    firstName: name,
    lastName: Lname,
    phone: phone,
    guests: Number(guests),
    date: bookingDate,
    time: bookingTime,
    createdAt: new Date().toISOString()
};

try {
    const bookings = getSavedBookings();

    bookings.push(booking);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(bookings)
    );

} catch (error) {
    console.error("Unable to save reservation:", error);
    alert("Unable to save your reservation. Please try again.");
    return;
}

displayReservations();

    confirmationName.textContent = name + " " + Lname;
    confirmationPhone.textContent = phone;
    confirmationGuests.textContent = guests;

    confirmationDate.textContent = new Date(bookingDate + "T00:00:00")
        .toLocaleDateString("en-IN");

    const formattedTime = new Date(2000, 0, 1, hours, minutes)
        .toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });

    confirmationTime.textContent = formattedTime.toUpperCase();

    reservationModal.classList.remove("active");
    confirmationModal.classList.add("active");

    reservationForm.reset();
});

const closeConfirmation = document.getElementById("close-confirmation");
const doneConfirmation = document.getElementById("done-confirmation");

closeConfirmation.addEventListener("click", function() {
    confirmationModal.classList.remove("active");
});

doneConfirmation.addEventListener("click", function() {
    confirmationModal.classList.remove("active");
});

confirmationModal.addEventListener("click", function(event) {
    if (event.target === confirmationModal) {
        confirmationModal.classList.remove("active");
    }
});


nameInput.addEventListener("input", function() {
    const name = nameInput.value.trim();

    if (name.length >= 2 && namePattern.test(name)) {
        nameError.textContent = "";
    }
});

LnameInput.addEventListener("input", function() {
    const Lname = LnameInput.value.trim();

    if (Lname.length >= 2 && namePattern.test(Lname)) {
        LnameError.textContent = "";
    }
});

phoneInput.addEventListener("input", function() {
    const phonePattern = /^[6-9]\d{9}$/;

    if (phonePattern.test(phoneInput.value.trim())) {
        phoneError.textContent = "";
    }
});

guestsInput.addEventListener("change", function() {
    if (guestsInput.value) {
        guestsError.textContent = "";
    }
});

function getTodayDate() {
    const today = new Date();

    return today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");
}


function isValidBookingTime() {

    if (!dateInput.value || !timeInput.value) {
        return false;
    }

    if (dateInput.value < getTodayDate()) {
        return false;
    }

    const [hours, minutes] = timeInput.value.split(":").map(Number);

    const selectedTime = hours * 60 + minutes;

    const openingTime = 11 * 60;
    const closingTime = 22 * 60;

    if (selectedTime < openingTime || selectedTime >= closingTime) {
        return false;
    }

    if (dateInput.value === getTodayDate()) {
        const now = new Date();

        const currentTime = now.getHours() * 60 + now.getMinutes();

        if (selectedTime <= currentTime) {
            return false;
        }
    }

    return true;
}

dateInput.addEventListener("change", function() {

    if (dateInput.value && dateInput.value >= getTodayDate()) {
        dateError.textContent = "";
    } else {
        dateError.textContent = "Please select today or a future date.";
    }

    if (timeInput.value) {
        if (isValidBookingTime()) {
            timeError.textContent = "";
        } else {
            timeError.textContent =
                "Please select a future time between 11 AM and 10 PM.";
        }
    }

});


timeInput.addEventListener("change", function() {
    if (!dateInput.value) {
        timeError.textContent = "";
        return;
    }

    if (isValidBookingTime()) {
        timeError.textContent = "";
    } else {
        timeError.textContent =
            "Please select a future time between 11 AM and 10 PM.";
    }

});


const reservationList = document.getElementById("reservation-list");
const reservationTable = document.getElementById("reservation-table");
const noBookings = document.getElementById("no-bookings");

function getSavedBookings() {
    try {
        const bookings = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(bookings) ? bookings : [];

    } catch (error) {
        console.error("Unable to retrieve bookings:", error);
        return [];
    }
}

function formatBookingDate(date) {
    if (!date) return "—";

    return new Date(date + "T00:00:00")
        .toLocaleDateString("en-IN");
}

function formatBookingTime(time) {
    if (!time) return "—";

    const [hours, minutes] = time.split(":").map(Number);

    return new Date(2000, 0, 1, hours, minutes)
        .toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        })
        .toUpperCase();
}

function displayReservations() {

    const bookings = getSavedBookings();

    reservationList.replaceChildren();

    if (bookings.length === 0) {
        reservationTable.style.display = "none";
        noBookings.style.display = "block";
        return;
    }

    reservationTable.style.display = "table";
    noBookings.style.display = "none";

    bookings.forEach(function(booking) {

        const row = document.createElement("tr");

        const customerName =
            `${booking.firstName || ""} ${booking.lastName || ""}`.trim()
            || booking.name
            || "—";

        const values = [
            booking.bookingId || "—",
            customerName,
            booking.phone || "—",
            booking.guests ?? "—",
            formatBookingDate(booking.date),
            formatBookingTime(booking.time)
        ];

        values.forEach(function(value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-booking";
        deleteButton.dataset.bookingId = booking.bookingId;

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        reservationList.appendChild(row);
    });
}

reservationList.addEventListener("click", function(event) {

    const deleteButton = event.target.closest(".delete-booking");

    if (!deleteButton) {
        return;
    }

    const bookingId = deleteButton.dataset.bookingId;

    const confirmDelete = confirm(
        "Are you sure you want to delete this reservation?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const bookings = getSavedBookings();

        const updatedBookings = bookings.filter(function(booking) {
            return booking.bookingId !== bookingId;
        });

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedBookings)
        );

        displayReservations();

    } catch (error) {

        console.error("Unable to delete reservation:", error);
        alert("Unable to delete reservation. Please try again.");

    }

});

displayReservations();


const filterButtons = document.querySelectorAll(".filter-btn");
const menuCards = document.querySelectorAll(".menu-card");

filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const selectedCategory = button.dataset.filter;

        filterButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        menuCards.forEach(function(card) {

            const cardCategory = card.dataset.category;

            if (
                selectedCategory === "all" ||
                selectedCategory === cardCategory
            ) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }

        });

    });

});

// Hero Book Button

const heroBookBtn = document.getElementById("hero-book-btn");

if (heroBookBtn) {
    heroBookBtn.addEventListener("click", function() {
        bookBtn.click();
    });
}

/*
window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");

    preloader.classList.add("hide");

    setTimeout(function () {
        preloader.style.display = "none";
    }, 600);
});*/


/*const preloaderStartTime = Date.now();

window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");

    const minimumTime = 3000;
    const elapsedTime = Date.now() - preloaderStartTime;
    const remainingTime = Math.max(0, minimumTime - elapsedTime);

    setTimeout(function () {
        preloader.classList.add("hide");

        setTimeout(function () {
            preloader.style.display = "none";
        }, 600);

    }, remainingTime);
});
*/

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(function(entries) {

    entries.forEach(function(entry) {

        if (entry.isIntersecting) {
            entry.target.classList.add("active");
        } else {
            entry.target.classList.remove("active");
        }

    });

}, {
    threshold: 0.15
});

revealElements.forEach(function(element) {
    revealObserver.observe(element);
});


const navSections = document.querySelectorAll(
    "#home, #menu, #about, #gallery, #contact, #reservation-history"
);

const navLinks = document.querySelectorAll(
    'header a[href^="#"]'
);

function updateActiveNavigation() {

    let currentSection = "home";

    navSections.forEach(function(section) {

        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop <= 180) {
            currentSection = section.id;
        }

    });

    navLinks.forEach(function(link) {

        link.classList.remove("active-link");

        if (link.getAttribute("href") === "#" + currentSection) {
            link.classList.add("active-link");
        }

    });
}

window.addEventListener("scroll", updateActiveNavigation);
window.addEventListener("load", updateActiveNavigation);

const menuCardObserver = new IntersectionObserver(function(entries) {

    entries.forEach(function(entry) {

        if (entry.isIntersecting) {
            entry.target.classList.add("show-card");
        } else {
            entry.target.classList.remove("show-card");
        }

    });

}, {
    threshold: 0.2
});

menuCards.forEach(function(card) {
    menuCardObserver.observe(card);
});


const galleryItems = document.querySelectorAll(".gallery-item");

const galleryObserver = new IntersectionObserver(function(entries) {

    entries.forEach(function(entry) {

        if (entry.isIntersecting) {
            entry.target.classList.add("show-gallery");
        } else {
            entry.target.classList.remove("show-gallery");
        }

    });

}, {
    threshold: 0.2
});

galleryItems.forEach(function(item) {
    galleryObserver.observe(item);
});


const scrollProgress = document.getElementById("scroll-progress");

window.addEventListener("scroll", function() {

    const scrollTop = document.documentElement.scrollTop;

    const scrollHeight = document.documentElement.scrollHeight -
                         document.documentElement.clientHeight;

    const scrollPercentage = (scrollTop / scrollHeight) * 100;

    scrollProgress.style.width = scrollPercentage + "%";

});