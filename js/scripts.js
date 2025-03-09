// inicia banco de dados
const db = new IndexedDBRepository("affective_classification", 1);

async function dbInit() {
  await db.init(["users", "results"]);
}
dbInit();

const data = {
  pt: [
    { word: "Afeto" },
    { word: "Morte" },
    { word: "Nariz" },
    { word: "Vitória" },
    { word: "Frustração" },
    { word: "Lápis" },
    { word: "Perda" },
    { word: "Decepção" },
    { word: "Mesa" },
    { word: "Pobreza" },
    { word: "Estupro" },
    { word: "Areia" },
    { word: "Traição" },
    { word: "Sucesso" },
    { word: "Colher" },
    { word: "Dor" },
    { word: "Feliz" },
    { word: "Unha" },
    { word: "Homicídio" },
    { word: "Beijo" },
    { word: "Tinta" },
    { word: "Ódio" },
    { word: "Abraço" },
    { word: "Xícara" },
    { word: "Elogio" },
    { word: "Doença" },
    { word: "Pé" },
    { word: "Prazer" },
    { word: "Amizade" },
    { word: "Prédio" },
    { word: "Sorriso" },
    { word: "Acidente" },
    { word: "Borracha" },
    { word: "Bondade" },
    { word: "Maligno" },
    { word: "Cesto" },
    { word: "Carinho" },
    { word: "Diversão" },
    { word: "Vidro" },
    { word: "Aborto" },
    { word: "Amor" },
    { word: "Madeira" },
    { word: "Preconceito" },
    { word: "Gargalhada" },
    { word: "Consultório" },
  ],
  en: [
    { word: "Frustration" },
    { word: "Success" },
    { word: "Nose" },
    { word: "Loss" },
    { word: "Care" },
    { word: "Office" },
    { word: "Poverty" },
    { word: "Disease" },
    { word: "Wood" },
    { word: "Disappointment" },
    { word: "Compliment" },
    { word: "Pencil" },
    { word: "Affection" },
    { word: "Hug" },
    { word: "Table" },
    { word: "Murder" },
    { word: "Happy" },
    { word: "Glass" },
    { word: "Friendship" },
    { word: "Betrayal" },
    { word: "Basket" },
    { word: "Smile" },
    { word: "Laughter" },
    { word: "Sand" },
    { word: "Fun" },
    { word: "Kindness" },
    { word: "Spoon" },
    { word: "Rape" },
    { word: "Hate" },
    { word: "Eraser" },
    { word: "Kiss" },
    { word: "Evil" },
    { word: "Building" },
    { word: "Death" },
    { word: "Victory" },
    { word: "Nail" },
    { word: "Pleasure" },
    { word: "Love" },
    { word: "Foot" },
    { word: "Abortion" },
    { word: "Pain" },
    { word: "Cup" },
    { word: "Accident" },
    { word: "Prejudice" },
    { word: "Paint" },
  ],
};

const language = window.localStorage.getItem("language") ?? "pt";
const selectedLanguageData = data[language];

const selectLanguageInput = document.querySelector("#language");
if (selectLanguageInput) {
  selectLanguageInput.value = language;
  selectLanguageInput.addEventListener("change", (event) => {
    const selectedLanguage = event.target.value;
    window.localStorage.setItem("language", selectedLanguage);
    window.location.reload();
  });
}

const pageForm = document.querySelector(".page-form");

function clearForm() {
  document.querySelector("input[name='username']").value = "";
  document.querySelector("input[name='email']").value = "";
}

const userForm = document.querySelector("#userForm");
if (userForm) {
  userForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;

    await db.init(["users"]);

    const findUserByEmail = await db.search("users", {email});

    if (findUserByEmail.length === 0) {
      await db.add("users", { username, email });
    }

    const user = await db.search("users", { email });

    window.localStorage.setItem("current-user", JSON.stringify(user[0]));

    clearForm();

    pageForm.classList.add("hidden");

    await startTask();
  });
}

async function getCurrentUser() {
  const currentUser = window.localStorage.getItem("current-user");
  if (currentUser) {
    return JSON.parse(currentUser);
  }
  return null;
}

async function startTask() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    alert("Usuário não encontrado");
    return;
  }

  const testContainer = document.createElement("div");
  testContainer.classList.add("affective-classification");
  testContainer.style.position = "fixed";
  testContainer.style.top = "50%";
  testContainer.style.left = "50%";
  testContainer.style.transform = "translate(-50%, -50%)";
  testContainer.style.fontSize = "60px";
  testContainer.style.fontWeight = "bold";
  testContainer.style.textAlign = "center";
  document.body.appendChild(testContainer);

  const results = [];

  await showTimer(5);
  await showWord(0);

  function showTimer(count) {
    return new Promise((resolve) => {
      const countContainer = document.createElement("div");
      countContainer.style.fontSize = "60px";
      countContainer.style.fontWeight = "bold";
      countContainer.style.textAlign = "center";
      countContainer.innerText = count;
      testContainer.appendChild(countContainer);

      const interval = setInterval(() => {
        count--;
        if (count === 0) {
          testContainer.removeChild(countContainer);
          clearInterval(interval);
          resolve();
        } else {
          countContainer.innerText = count;
        }
      }, 1000);
    });
  }

  async function showWord(index) {
    const words = selectedLanguageData;
    if (index >= words.length) {
      const restartButton = document.createElement("button");
      restartButton.innerText = "Tela Inicial";
      restartButton.style.display = "block";
      restartButton.style.margin = "20px auto";
      restartButton.style.padding = "10px 15px";
      restartButton.style.fontSize = "18px";
      restartButton.style.border = "none";
      restartButton.style.background = "#6FA3EF";
      restartButton.style.color = "white";
      restartButton.style.borderRadius = "5px";
      restartButton.style.cursor = "pointer";
      restartButton.onclick = () => {
        location.reload();
      };

      results.forEach(async (result) => {
        await db.add("results", result);
      });

      await showResults();
      return;
    }
  
    const word = words[index].word;

    testContainer.innerHTML = "";

    await sleep(1);
  
    const wordContainer = document.createElement("div");
    wordContainer.classList.add("word-container");
    wordContainer.style.fontSize = "60px";
    wordContainer.style.fontWeight = "bold";
    wordContainer.style.textAlign = "center";
    wordContainer.style.color = "#414141";
    wordContainer.style.marginBottom = "1rem";
    wordContainer.innerText = word;
    testContainer.appendChild(wordContainer);

    const emotionContainer = document.createElement("div");
    emotionContainer.classList.add("emotion-container");
    emotionContainer.style.fontWeight = "bold";
    emotionContainer.style.textAlign = "center";
    emotionContainer.style.display = "flex";
    emotionContainer.style.justifyContent = "space-between";
    emotionContainer.style.alignItems = "center";
    emotionContainer.style.alignContent = "center";
    emotionContainer.style.gap = "1rem";

    const emotions = ["nada emocional/neutra", "pouco emocional", "moderadamente emocional", "muito emocional", "completamente emocional"];
    emotions.forEach((emotion, i) => {
      const eContainer = document.createElement("a");
      eContainer.classList.add("emotion");
      eContainer.style.padding = "0.5rem";
      eContainer.style.border = "1px solid #ccc";
      eContainer.style.borderRadius = "5px";
      eContainer.style.cursor = "pointer";
      eContainer.style.fontSize = "0.8rem";
      eContainer.style.display = "flex";
      eContainer.style.alignItems = "center";
      eContainer.style.alignContent = "center";
      eContainer.style.whiteSpace = "nowrap";
      eContainer.innerText = emotion;
      eContainer.addEventListener("click", async () => {
        updateResults(word, emotion);
        await showWord(index + 1);
      });
      emotionContainer.appendChild(eContainer);
    });

    testContainer.appendChild(emotionContainer);
  }

  function updateResults(word, emotion) {
    results.push({word, emotion, username: currentUser.username, email: currentUser.email, language});
  }

  async function showResults() {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;
  
    // Recupera todos os resultados do banco de dados
    const allResults = await db.getAll("results");
  
    // Filtra os resultados pelo idioma escolhido
    const filteredResults = allResults.filter(result => result.language === language);
  
    // Lista de palavras de acordo com a linguagem escolhida
    const wordsList = data[language].map(item => item.word);
  
    // Objeto para armazenar as contagens de emoções por palavra
    const wordStats = {};
  
    // Inicializa as contagens para todas as palavras
    wordsList.forEach(word => {
      wordStats[word] = {
        total: 0,
        emotions: {
          "nada emocional/neutra": 0,
          "pouco emocional": 0,
          "moderadamente emocional": 0,
          "muito emocional": 0,
          "completamente emocional": 0,
        },
      };
    });
  
    // Processa os resultados para contar as emoções
    filteredResults.forEach(result => {
      const { word, emotion } = result;
  
      if (wordStats[word]) {
        wordStats[word].total++;
        wordStats[word].emotions[emotion]++;
      }
    });
  
    // Cria o contêiner da tabela de resultados
    const resultsContainer = document.createElement("div");
    resultsContainer.classList.add("results-container");
    resultsContainer.style.margin = "20px auto";
    resultsContainer.style.width = "90%"; // Largura relativa
    resultsContainer.style.maxHeight = "60vh"; // Altura máxima relativa
    resultsContainer.style.padding = "20px";
    resultsContainer.style.backgroundColor = "#ffffff";
    resultsContainer.style.borderRadius = "10px";
    resultsContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    resultsContainer.style.overflow = "auto"; // Adiciona rolagem em ambos os sentidos
  
    // Cria a tabela
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "20px";
    table.style.fontSize = "0.8rem"; // Tamanho da fonte reduzido
  
    // Cria o cabeçalho da tabela
    const headerRow = document.createElement("tr");
    headerRow.style.position = "sticky";
    headerRow.style.top = "-20px";
    headerRow.style.zIndex = "1";

    const headers = ["Palavra", "Nada emocional/neutra", "Pouco emocional", "Moderadamente emocional", "Muito emocional", "Completamente emocional"];
    headers.forEach(headerText => {
      const header = document.createElement("th");
      header.textContent = headerText;
      header.style.padding = "10px";
      header.style.border = "1px solid #cccccc";
      header.style.backgroundColor = "#414141";
      header.style.color = "#ffffff";
      header.style.whiteSpace = "nowrap"; // Evita quebra de linha no cabeçalho
      headerRow.appendChild(header);
    });
    table.appendChild(headerRow);
  
    // Preenche a tabela com os dados
    wordsList.forEach(word => {
      const row = document.createElement("tr");
      const wordCell = document.createElement("td");
      wordCell.textContent = word;
      wordCell.style.padding = "10px";
      wordCell.style.border = "1px solid #cccccc";
      wordCell.style.backgroundColor = "#f5f5f5";
      wordCell.style.whiteSpace = "nowrap"; // Evita quebra de linha nas células
      row.appendChild(wordCell);
  
      const emotions = wordStats[word].emotions;
      const total = wordStats[word].total;
  
      Object.keys(emotions).forEach(emotion => {
        const count = emotions[emotion];
        const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : "0.00"; // Evita divisão por zero
  
        const cell = document.createElement("td");
        cell.textContent = `${count} (${percentage}%)`;
        cell.style.padding = "10px";
        cell.style.border = "1px solid #cccccc";
        cell.style.backgroundColor = "#f5f5f5";
        cell.style.whiteSpace = "nowrap"; // Evita quebra de linha nas células
        row.appendChild(cell);
      });
  
      table.appendChild(row);
    });
  
    resultsContainer.appendChild(table);
  
    // Remove o conteúdo anterior e exibe a tabela de resultados
    const testContainer = document.querySelector(".affective-classification");
    if (testContainer) {
      testContainer.innerHTML = "";
  
      // Adiciona o contêiner da tabela
      testContainer.appendChild(resultsContainer);
  
      // Cria o botão "Tela Inicial" fora da tabela
      const restartButton = document.createElement("button");
      restartButton.innerText = "Tela Inicial";
      restartButton.style.display = "block";
      restartButton.style.margin = "20px auto";
      restartButton.style.padding = "10px 15px";
      restartButton.style.fontSize = "18px";
      restartButton.style.border = "none";
      restartButton.style.background = "#6FA3EF";
      restartButton.style.color = "white";
      restartButton.style.borderRadius = "5px";
      restartButton.style.cursor = "pointer";
      restartButton.onclick = () => {
        location.reload();
      };
  
      // Adiciona o botão abaixo da tabela
      testContainer.appendChild(restartButton);
    }
  }

}

function sleep(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}