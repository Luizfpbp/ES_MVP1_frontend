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
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function formatPreciseDate(date) {
  return new Date(date).toLocaleString();
}

// Services
const UserService = {
  getUsersList: async () => {
    const response = await fetch("http://127.0.0.1:5000/usuarios");
    return await response.json();
  },
};

const BookService = {
  getBooksList: async (disponivel) => {
    url = "http://127.0.0.1:5000/livros";
    if (disponivel) {
      url = url + `?disponivel=${disponivel}`;
    }

    const response = await fetch(url);
    return await response.json();
  },
};

const lendService = {
  getLendsList: async () => {
    const response = await fetch("http://127.0.0.1:5000/emprestimos");
    return await response.json();
  },
  createLend: async (userValue, bookValue) => {
    const form = new FormData();
    form.append("usuario_id", userValue);
    form.append("livro_id", bookValue);

    const response = await fetch("http://127.0.0.1:5000/emprestimo", {
      method: "post",
      body: form,
    });
    return await response.json();
  },
  updateLend: async (emprestimo_id) => {
    const form = new FormData();
    form.append("emprestimo_id", emprestimo_id);

    const response = await fetch("http://127.0.0.1:5000/emprestimo/devolver", {
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
