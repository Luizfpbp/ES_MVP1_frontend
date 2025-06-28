const BookGenre = {
  ROMANCE: "Romance",
  FICCAO_CIENTIFICA: "Ficção Científica",
  FANTASIA: "Fantasia",
  BIOGRAFIA: "Biografia",
  HISTORIA: "História",
  MISTERIO: "Mistério",
  TERROR: "Terror",
  AVENTURA: "Aventura",
  DRAMA: "Drama",
  POESIA: "Poesia",
  EDUCACAO: "Educação",
  INFANTIL: "Infantil",
  AUTOAJUDA: "Autoajuda",
  RELIGIAO: "Religião",
  COMEDIA: "Comédia",
};

// Form
window.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("newBookGenre");

  for (const key in BookGenre) {
    const option = document.createElement("option");
    option.value = BookGenre[key];
    option.textContent = BookGenre[key];
    select.appendChild(option);
  }
});

const today = new Date().toISOString().split("T")[0];
document.getElementById("newBookRelease").max = today;
document.getElementById("newUserBirthday").max = today;

window.addEventListener("DOMContentLoaded", () => {
  // Table fetchs
  getUsersList();
  getBooksList();
  getLendsList();

  // Select fetchs
  getUserOptions();
  getBookOptions();
});

// Navigation
function navigate(page) {
  document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
  document.getElementById(page).style.display = "block";
}

// Helper
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function formatPreciseDate(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function convertInputDate(date) {
  const [ano, mes, dia] = date.split("-");
  return `${dia}/${mes}/${ano}`;
}

function emailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Services
db_url = "http://127.0.0.1:5000/";

const UserService = {
  getUsersList: async () => {
    const response = await fetch(db_url + "usuarios");
    return await response.json();
  },
  createUser: async (userName, userEmail, userBirthday) => {
    const form = new FormData();
    form.append("nome", userName);
    form.append("email", userEmail);
    form.append("data_nascimento", userBirthday);

    const response = await fetch(db_url + "usuario", {
      method: "post",
      body: form,
    });

    return await response.json();
  },
};

const BookService = {
  getBooksList: async (disponivel) => {
    url = db_url + "livros";
    if (disponivel) {
      url = url + `?disponivel=${disponivel}`;
    }

    const response = await fetch(url);
    return await response.json();
  },
  createBook: async (bookTitle, bookAuthor, bookGenre, bookRelese) => {
    const form = new FormData();
    form.append("autor", bookAuthor);
    form.append("genero", bookGenre);
    form.append("lancamento", bookRelese);
    form.append("titulo", bookTitle);

    const response = await fetch(db_url + "livro", {
      method: "post",
      body: form,
    });

    return response.json();
  },
};

const lendService = {
  getLendsList: async () => {
    const response = await fetch(db_url + "emprestimos");
    return await response.json();
  },
  createLend: async (userValue, bookValue) => {
    const form = new FormData();
    form.append("usuario_id", userValue);
    form.append("livro_id", bookValue);

    const response = await fetch(db_url + "emprestimo", {
      method: "post",
      body: form,
    });
    return await response.json();
  },
  updateLend: async (emprestimo_id) => {
    const form = new FormData();
    form.append("emprestimo_id", emprestimo_id);

    const response = await fetch(db_url + "emprestimo/devolver", {
      method: "put",
      body: form,
    });

    return await response.json();
  },
};

// User scripts
async function getUsersList() {
  try {
    const data = await UserService.getUsersList();
    data.values.forEach((item) => insertUsersCard(item));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
  }
}

function insertUsersCard(item) {
  const tabela = document.getElementById("userList");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.nome}</td>
    <td>${item.email}</td>
    <td>${formatDate(item.data_nascimento)}</td>
  `;
  tabela.appendChild(tr);
}

async function getUserOptions() {
  userSelect = document.getElementById("userOpt");
  try {
    const data = await UserService.getUsersList();
    userSelect.innerHTML =
      '<option value="" disabled selected hidden>Selecione um usuário</option>';

    data.values.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.nome;
      userSelect.appendChild(option);
    });
  } catch (error) {
    console.log("Erro ao buscar usuários: ", error);
    userSelect.innerHTML =
      '<option value="" disabled selected>Erro ao carregar opções</option>';
  }
}

async function createUser() {
  try {
    const name = document.getElementById("newUserName");
    const email = document.getElementById("newUserEmail");
    const birth = document.getElementById("newUserBirthday");

    if (name.value == "" || email.value == "" || birth.value == "") {
      alert("Preencha todos os campos!");
    } else if (!emailValido(email.value)) {
      alert("Digite um email válido");
    } else {
      const data = await UserService.createUser(
        name.value,
        email.value,
        convertInputDate(birth.value)
      );

      if (data?.message) {
        alert(data.message);
      } else {
        insertUsersCard(data);

        navigate("home");
        name.value = "";
        email.value = "";
        birth.value = "";
      }
    }
  } catch (error) {
    console.log("Erro ao criar usuário: ", error);
    alert("Erro ao criar usuário!");
  }
}

// Book scripts
async function getBooksList() {
  try {
    const data = await BookService.getBooksList();
    data.values.forEach((item) => insertBooksCard(item));
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
  }
}

function insertBooksCard(item) {
  const tabela = document.getElementById("bookList");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.autor ?? "N/A"}</td>
    <td>${item.titulo}</td>
    <td>${item.genero}</td>
    <td>${item.disponivel ? "Disponivel" : "Emprestado"}</td>
    <td>${formatDate(item.lancamento)}</td>
  `;
  tabela.appendChild(tr);
}

async function getBookOptions() {
  const bookSelect = document.getElementById("bookOpt");
  try {
    const data = await BookService.getBooksList(true);
    bookSelect.innerHTML =
      '<option value="" disabled selected hidden>Selecione um livro</option>';

    data.values.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.titulo;
      bookSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    bookSelect.innerHTML =
      '<option value="" disabled selected>Erro ao carregar opções</option>';
  }
}

async function createBook() {
  try {
    const title = document.getElementById("newBookTitle");
    const author = document.getElementById("newBookAuthor");
    const genre = document.getElementById("newBookGenre");
    const relese = document.getElementById("newBookRelease");

    if (
      title.value == "" ||
      author.value == "" ||
      genre.value == "" ||
      relese.value == ""
    ) {
      alert("Preencha todos os campos!");
    } else {
      const data = await BookService.createBook(
        title.value,
        author.value,
        genre.value,
        convertInputDate(relese.value)
      );

      insertBooksCard(data);

      navigate("home");
      title.value = "";
      author.value = "";
      genre.value = "";
      relese.value = "";
    }
  } catch (error) {
    console.log("Erro ao criar o livro: ", error);
    alert("Erro ao criar o livro!");
  }
}

// Lend scripts
async function getLendsList() {
  try {
    const data = await lendService.getLendsList();
    data.values.forEach((item) => insertLendCard(item));
  } catch (error) {
    console.error("Erro ao buscar emprestimos:", error);
  }
}

function insertLendCard(item, newLend) {
  const tabela = document.getElementById("lendList");
  const tr = document.createElement("tr");

  const entregueTd = item.devolvido
    ? `<td>Sim</td>`
    : `<td><button onclick="updateLend(${item.id})" class="text-blue-600 underline">Marcar como devolvido</button></td>`;

  tr.innerHTML = `
    ${entregueTd}
    <td>${item.livro.titulo}</td>
    <td>${item.usuario.nome}</td>
    <td>${formatPreciseDate(item.data_emprestimo)}</td>
    <td>${
      item.data_devolucao
        ? formatPreciseDate(item.data_devolucao)
        : "Não entregue"
    }</td>
  `;
  if (newLend) {
    if (tabela.rows.length > 1) {
      tabela.insertBefore(tr, tabela.rows[1]);
    } else {
      tabela.appendChild(tr);
    }
  } else {
    tabela.appendChild(tr);
  }
}

async function newLendProcess() {
  const book = document.getElementById("bookOpt").value;
  const user = document.getElementById("userOpt").value;

  if (book === "" || user === "") {
    alert("Preencha os dados para criar um emprestimo!");
  } else {
    try {
      const newLend = await lendService.createLend(user, book);
      insertLendCard(newLend, true);
      alert("Item adicionado!");
    } catch (error) {
      console.log("Erro ao criar emprestimo: ", error);
      alert("Erro ao criar emprestimo!");
    }
  }
}

async function updateLend(emprestimo_id) {
  try {
    const data = await lendService.updateLend(emprestimo_id);

    const linha = [...document.querySelectorAll("#lendList tr")].find((tr) =>
      tr.innerHTML.includes(`updateLend(${emprestimo_id})`)
    );

    if (linha) {
      linha.cells[0].innerHTML = "<td>Sim</td>";
      linha.cells[4].innerText = formatPreciseDate(data.data_devolucao);
    }

    alert("Emprestimo entregue!");
  } catch (error) {
    console.log("Erro ao atualizar emprestimo: ", error);
    alert("Erro ao atualizar emprestimo!");
  }
}
