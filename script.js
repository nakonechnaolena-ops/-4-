const API_URL = "https://6af0b90c11a6aa866e7fb6cf.mockapi.io/ni/users"; 
// Знаходимо елементи на сторінці
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('task-list');
const errorMsg = document.getElementById('error');
const loader = document.getElementById('loader');
const counter = document.getElementById('counter');

// Функція для показу помилок
function showError(text) {
  errorMsg.textContent = text;
  errorMsg.hidden = false;
  setTimeout(() => { errorMsg.hidden = true; }, 4000); // Ховаємо через 4 секунди
}

//ОТРИМАННЯ СПИСКУ get
async function loadTasks() {
  loader.hidden = false; // Показуємо завантаження
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Помилка сервера');
    
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    showError('Не вдалося завантажити дані: ' + error.message);
  } finally {
    loader.hidden = true; // Ховаємо завантаження
  }
}

//Відображення списку на екрані
function renderTasks(tasks) {
  list.innerHTML = '';
  
  let doneCount = 0;
  
  tasks.forEach(task => {
    if (task.completed) doneCount++;

    const li = document.createElement('li');
    if (task.completed) li.classList.add('done');

    //Чекбокс
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task, checkbox));

    //Текст
    const span = document.createElement('span');
    span.textContent = task.name;

    // Кнопка видалення
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteTask(task.id, deleteBtn));

    li.append(checkbox, span, deleteBtn);
    list.append(li);
  });

  // Оновлюємо лічильник
  counter.textContent = `Всього: ${tasks.length} | Виконано: ${doneCount}`;
}

//ДОДАВАННЯ ЗАВДАННЯ post
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  
  if (text.length < 2) {
    showError('Введіть хоча б 2 символи!');
    return;
  }

  addBtn.disabled = true; // Блокуємо кнопку, щоб не натискали двічі
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: text, completed: false })
    });
    
    if (!response.ok) throw new Error('Не вдалося зберегти');
    
    input.value = ''; // Очищаємо поле
    loadTasks(); // Перезавантажуємо список
  } catch (error) {
    showError('Помилка додавання: ' + error.message);
  } finally {
    addBtn.disabled = false;
  }
});

//ВИДАЛЕННЯ ЗАВДАННЯ 
async function deleteTask(id, btn) {
  btn.disabled = true;
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Не вдалося видалити');
    
    loadTasks(); // Перезавантажуємо список
  } catch (error) {
    btn.disabled = false;
    showError('Помилка видалення: ' + error.message);
  }
}

//ПОЗНАЧИТИ ВИКОНАНИМ 
async function toggleTask(task, checkbox) {
  checkbox.disabled = true;
  try {
    const response = await fetch(`${API_URL}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, completed: checkbox.checked })
    });
    if (!response.ok) throw new Error('Не вдалося оновити');
    
    loadTasks(); // Перезавантажуємо список
  } catch (error) {
    checkbox.checked = !checkbox.checked; // Відкат
    checkbox.disabled = false;
    showError('Помилка оновлення: ' + error.message);
  }
}

// Запускаємо завантаження при відкритті сторінки
loadTasks();