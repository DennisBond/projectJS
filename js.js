'use strict';

document.addEventListener("DOMContentLoaded", () => {
  const contactList = document.getElementById('contact-list');
  const addContactBtn = document.getElementById('add-contact');
  const deleteAllBtn = document.getElementById('delete-all');
  const popup = document.getElementById('popup');
  const closePopupBtn = document.querySelector('.close-popup');
  const contactForm = document.getElementById('contact-form');
  const popupTitle = document.getElementById('popup-title');
  const searchInput = document.getElementById('search');
  const toggleThemeBtn = document.getElementById('toggle-effect');
  const confirmPopup = document.getElementById('confirm-popup');
  const confirmDeleteBtn = document.getElementById('confirm-delete');
  const cancelDeleteBtn = document.getElementById('cancel-delete');
  const confirmMessage = confirmPopup.querySelector('p');

  let editingContact = null;
  let contactToDelete = null;
  let darkThemeActive = false;

  const contacts = [
    { name: 'Lior Levi', phone: '054-1234567', address: '1 Bnei barak St, Tel Aviv', email: 'dani@example.com', notes: 'childhood friend' },
    { name: 'Liran Hazan', phone: '052-2345678', address: '10 Zarfat St, Haifa', email: 'michal@example.com', notes: 'neiborhod' },
    { name: 'Maor Shaked', phone: '050-3456789', address: '15 Geula Cohen St, Jerusalem', email: 'yossi@example.com', notes: 'Cousin' },
    { name: 'Kiril Koval', phone: '053-9876543', address: '13 Hadekel St, Tiberias', email: 'nadav@example.com', notes: 'Best friend' },
    { name: 'Yakir Yakov', phone: '053-9876543', address: '13 Kiryat Chaim', email: 'nadav@example.com', notes: 'Best friend' }
  ];

  contacts.sort((a, b) => a.name.localeCompare(b.name));

  function renderContacts(filteredContacts = contacts) {
    contactList.innerHTML = '';
    if (filteredContacts.length === 0) {
      contactList.innerHTML = '<li>List is empty</li>';
    } else {
      filteredContacts.forEach((contact, index) => {
        const contactItem = document.createElement('li');
        contactItem.classList.add('contact-item');
        contactItem.innerHTML = `
          <div class="contact-summary">
            <span>${contact.name} - ${contact.phone}</span>
            <div class="buttons">
              <button class="more-info" data-index="${index}">More Info</button>
              <button class="edit" data-index="${index}">Edit</button>
              <button class="delete" data-index="${index}">Delete</button>
            </div>
          </div>
          <div class="contact-details" style="display: none;">
            <p><strong>Address:</strong> ${contact.address || 'N/A'}</p>
            <p><strong>Email:</strong> ${contact.email || 'N/A'}</p>
            <p><strong>Notes:</strong> ${contact.notes || 'N/A'}</p>
          </div>
        `;
        contactList.appendChild(contactItem);
      });
    }
  }

  function openPopup(index = null, readonly = false) {
    popup.style.display = 'block';
    editingContact = readonly ? null : index;
    popupTitle.textContent = readonly ? 'Contact Info' : (index !== null ? 'Edit Contact' : 'Add Contact');

    if (index !== null) {
      const contact = contacts[index];
      contactForm.name.value = contact.name;
      contactForm.phone.value = contact.phone;
      contactForm.address.value = contact.address || '';
      contactForm.email.value = contact.email || '';
      contactForm.notes.value = contact.notes || '';
    } else {
      contactForm.reset();
    }

    // הפיכת השדות לקריאה בלבד אם צריך
    const fields = contactForm.querySelectorAll('input, textarea');
    fields.forEach(field => {
      field.readOnly = readonly;
    });

    // הסתרת כפתור שמירה אם תצוגה בלבד
    contactForm.querySelector('button[type="submit"]').style.display = readonly ? 'none' : 'inline-block';
  }

  function closePopup() {
    popup.style.display = 'none';
  }

  function validatePhone(phone) {
    const phonePattern = /^\d{2,3}-\d{7}$/;
    return phonePattern.test(phone);
  }

  function addContact(event) {
    event.preventDefault();

    const name = contactForm.name.value.trim();
    const phone = contactForm.phone.value.trim();
    const address = contactForm.address.value.trim();
    const email = contactForm.email.value.trim();
    const notes = contactForm.notes.value.trim();

    if (!name || !phone) {
      alert('Name and phone are required.');
      return;
    }

    if (!validatePhone(phone)) {
      alert('Invalid phone number format. Use XXX-XXXXXXX.');
      return;
    }

    const newContact = { name, phone, address, email, notes };

    const duplicate = contacts.some((c, i) => c.name === name && i !== editingContact);
    if (duplicate) {
      alert('A contact with this name already exists.');
      return;
    }

    if (editingContact !== null) {
      contacts[editingContact] = newContact;
    } else {
      contacts.push(newContact);
    }

    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContacts();
    closePopup();
  }

  function deleteContact(index) {
    contacts.splice(index, 1);
    renderContacts();
  }

  function deleteAllContacts() {
    contacts.length = 0;
    renderContacts();
  }

  function searchContacts() {
    const query = searchInput.value.toLowerCase();
    const filteredContacts = contacts.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      contact.phone.toLowerCase().includes(query) ||
      contact.address.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.notes.toLowerCase().includes(query)
    );
    renderContacts(filteredContacts);
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    darkThemeActive = !darkThemeActive;
  }

  // אירועים
  addContactBtn.addEventListener('click', () => openPopup());
  closePopupBtn.addEventListener('click', closePopup);
  contactForm.addEventListener('submit', addContact);

  deleteAllBtn.addEventListener('click', () => {
    confirmMessage.textContent = 'Are you sure you want to delete all contacts?';
    confirmDeleteBtn.textContent = 'Yes, delete all';
    confirmPopup.style.display = 'flex';
    contactToDelete = null;
  });

  confirmDeleteBtn.addEventListener('click', () => {
    if (contactToDelete !== null) {
      deleteContact(contactToDelete);
      contactToDelete = null;
    } else {
      deleteAllContacts();
    }
    confirmPopup.style.display = 'none';
  });

  cancelDeleteBtn.addEventListener('click', () => {
    confirmPopup.style.display = 'none';
    contactToDelete = null;
  });

  contactList.addEventListener('click', (event) => {
    if (event.target.classList.contains('more-info')) {
      const index = parseInt(event.target.dataset.index);
      openPopup(index, true); // מצב תצוגה בלבד
    } else if (event.target.classList.contains('delete')) {
      const index = parseInt(event.target.dataset.index);
      contactToDelete = index;
      const contact = contacts[index];
      confirmMessage.textContent = `Are you sure you want to delete ${contact.name}?`;
      confirmDeleteBtn.textContent = 'Yes, delete';
      confirmPopup.style.display = 'flex';
    } else if (event.target.classList.contains('edit')) {
      const index = parseInt(event.target.dataset.index);
      openPopup(index); // מצב עריכה
    }
  });

  searchInput.addEventListener('input', searchContacts);
  toggleThemeBtn.addEventListener('click', toggleTheme);

  renderContacts();
});
