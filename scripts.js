window.addEventListener("DOMContentLoaded", () => {
  getUsersList();
  getBooksList();
  getBookOptions();
});

// Navigation
function navigate(page) {
  document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
  document.getElementById(page).style.display = "block";
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

// User scripts
const getUsersList = async () => {
  try {
    const data = await UserService.getUsersList();
    data.values.forEach((item) => insertUsersCard(item));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
  }
};

function insertUsersCard(item) {
  const tabela = document.getElementById("userList");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.nome}</td>
    <td>${item.email}</td>
    <td>${item.data_nascimento}</td>
  `;
  tabela.appendChild(tr);
}

// Book scripts
const getBooksList = async () => {
  try {
    const data = await BookService.getBooksList();
    data.values.forEach((item) => insertBooksCard(item));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
  }
};

function insertBooksCard(item) {
  const tabela = document.getElementById("bookList");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.autor ?? "N/A"}</td>
    <td>${item.titulo}</td>
    <td>${item.genero}</td>
    <td>${item.disponivel ? "Disponivel" : "Emprestado"}</td>
    <td>${item.lancamento}</td>
  `;
  tabela.appendChild(tr);
}

const getBookOptions = async () => {
  const selectBook = document.getElementById("bookOpt");
  try {
    const data = await BookService.getBooksList(true);
    selectBook.innerHTML =
      '<option value="" disabled selected hidden>Selecione um livro</option>';

    data.values.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.titulo;
      selectBook.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    selectBook.innerHTML =
      '<option value="" disabled selected>Erro ao carregar opções</option>';
  }
};
