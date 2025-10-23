<!-- Adicione isso antes do fechamento da tag </body> -->
<script type="module">
  // ======== CONFIGURAÇÃO FIREBASE ========
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
  import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } 
    from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_BUCKET",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // ======== VARIÁVEIS ========
  const homeBtn = document.getElementById('homeBtn');
  const postoBtns = document.querySelectorAll('.posto-btn');
  const allNavBtns = document.querySelectorAll('nav button');
  let selectedPosto = 'EOM - Longarina';

  // ======== INICIALIZAÇÃO ========
  document.getElementById('entryDate').valueAsDate = new Date();

  // ======== NAVEGAÇÃO ========
  function setActiveButton(activeButton) {
    allNavBtns.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }

  homeBtn.addEventListener('click', function () {
    setActiveButton(this);
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('postoPage').style.display = 'none';
  });

  postoBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      setActiveButton(this);
      selectedPosto = this.dataset.posto;
      document.getElementById('cardTitle').textContent = selectedPosto;
      document.getElementById('homePage').style.display = 'none';
      document.getElementById('postoPage').style.display = 'block';
      displayEntries();
    });
  });

  // ======== SALVAR OBSERVAÇÃO (FIRESTORE) ========
  async function addEntry() {
    const dateInput = document.getElementById('entryDate').value;
    const observation = document.getElementById('observation').value.trim();
    const operatorName = document.getElementById('operatorName').value.trim();
    const shift = document.getElementById('shift').value;

    if (!observation || !operatorName) {
      alert("Por favor, digite a observação e o nome do operador.");
      return;
    }

    try {
      await addDoc(collection(db, "observacoes"), {
        posto: selectedPosto,
        data: dateInput,
        operador: operatorName,
        turno: shift,
        texto: observation,
        timestamp: new Date()
      });

      alert("Observação salva com sucesso!");
      document.getElementById('observation').value = '';
      document.getElementById('operatorName').value = '';
      displayEntries();
    } catch (error) {
      console.error("Erro ao salvar: ", error);
      alert("Erro ao salvar no banco de dados!");
    }
  }

  // ======== EXIBIR OBSERVAÇÕES ========
  async function displayEntries() {
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    const entriesDiv = document.getElementById('entries');
    entriesDiv.innerHTML = '<p>Carregando...</p>';

    try {
      const q = query(collection(db, "observacoes"), where("posto", "==", selectedPosto), orderBy("data"));
      const querySnapshot = await getDocs(q);
      let html = "";

      querySnapshot.forEach((doc) => {
        const obs = doc.data();
        if (obs.data >= startDate && obs.data <= endDate) {
          html += `
            <div class="entry">
              <div>
                <strong>${obs.data} - Turno ${obs.turno}</strong><br>
                <strong>Operador:</strong> ${obs.operador}<br>
                ${obs.texto}
              </div>
            </div>`;
        }
      });

      entriesDiv.innerHTML = html || '<p>Nenhuma observação encontrada neste período.</p>';
    } catch (error) {
      console.error("Erro ao carregar observações:", error);
      entriesDiv.innerHTML = '<p>Erro ao carregar observações.</p>';
    }
  }

  // ======== EVENTOS ========
  document.querySelector('.save-btn').addEventListener('click', addEntry);
  document.getElementById('filterStartDate').addEventListener('change', displayEntries);
  document.getElementById('filterEndDate').addEventListener('change', displayEntries);
</script>