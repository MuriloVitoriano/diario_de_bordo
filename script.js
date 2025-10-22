// ======== VARIÁVEIS ========
const homeBtn = document.getElementById('homeBtn');
const postoBtns = document.querySelectorAll('.posto-btn');
const allNavBtns = document.querySelectorAll('nav button'); // Seleciona todos os botões da navegação
let selectedPosto = 'EOM - Longarina';

// Inicializa datas com hoje
document.getElementById('entryDate').valueAsDate = new Date();
const today = new Date().toISOString().split('T')[0];
document.getElementById('filterStartDate').value = today;
document.getElementById('filterEndDate').value = today;

// ======== FUNÇÃO PARA NAVEGAÇÃO E ESTILIZAÇÃO ========
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

// ======== FUNÇÃO PARA SALVAR OBSERVAÇÕES ========
function addEntry() {
    const dateInput = document.getElementById('entryDate').value;
    const observation = document.getElementById('observation').value.trim();
    const operatorName = document.getElementById('operatorName').value.trim();
    const shift = document.getElementById('shift').value;

    if (!observation || !operatorName) {
        alert("Por favor, digite a observação e o nome do operador.");
        return;
    }

    const dateParts = dateInput.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    // Recupera dados do localStorage
    let data = JSON.parse(localStorage.getItem('diarioBordo')) || {};

    if (!data[formattedDate]) data[formattedDate] = {};
    if (!data[formattedDate][selectedPosto]) data[formattedDate][selectedPosto] = [];

    // Salva a observação como um objeto
    data[formattedDate][selectedPosto].push({
        text: observation,
        operator: operatorName,
        shift: shift
    });
    localStorage.setItem('diarioBordo', JSON.stringify(data));

    // Limpa os campos e exibe as entradas
    document.getElementById('observation').value = '';
    document.getElementById('operatorName').value = '';
    displayEntries();
}

// ======== FUNÇÃO PARA EXIBIR OBSERVAÇÕES ========
function displayEntries() {
    const startDateInput = document.getElementById('filterStartDate').value;
    const endDateInput = document.getElementById('filterEndDate').value;

    const entriesDiv = document.getElementById('entries');
    entriesDiv.innerHTML = '';

    const data = JSON.parse(localStorage.getItem('diarioBordo')) || {};
    let filteredEntries = [];

    // Converte as datas de string para objetos Date para comparação
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    // Itera sobre todas as chaves (datas) no localStorage para filtrar
    for (const storedDateKey in data) {
        const dateParts = storedDateKey.split('/');
        const storedDateFormatted = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        const storedDate = new Date(storedDateFormatted);

        // Verifica se a data está dentro do período e se o posto corresponde
        if (storedDate >= startDate && storedDate <= endDate && data[storedDateKey][selectedPosto]) {
            filteredEntries.push({
                date: storedDateKey,
                entries: data[storedDateKey][selectedPosto]
            });
        }
    }

    if (filteredEntries.length === 0) {
        entriesDiv.innerHTML = '<p>Nenhuma observação registrada neste período.</p>';
        return;
    }

    // Ordena as entradas por data
    filteredEntries.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA - dateB;
    });

    // Exibe as entradas ordenadas
    filteredEntries.forEach(dayEntry => {
        dayEntry.entries.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'entry';
            div.innerHTML = `
                <div>
                    <strong>${dayEntry.date} - Turno ${entry.shift}</strong><br>
                    <strong>Operador:</strong> ${entry.operator}<br>
                    ${entry.text}
                </div>
                <button class="remove-btn" onclick="removeEntry('${dayEntry.date}', ${index})">Remover</button>
            `;
            entriesDiv.appendChild(div);
        });
    });
}

// ======== FUNÇÃO PARA REMOVER OBSERVAÇÕES ========
function removeEntry(date, index) {
    if (confirm("Tem certeza que deseja remover este comentário?")) {
        const data = JSON.parse(localStorage.getItem('diarioBordo')) || {};
        const dayEntries = data[date] && data[date][selectedPosto] ? data[date][selectedPosto] : [];

        if (dayEntries.length > 0) {
            dayEntries.splice(index, 1);
            localStorage.setItem('diarioBordo', JSON.stringify(data));
            displayEntries(); // Atualiza a exibição após a remoção
        }
    }
}

// Atualiza observações ao mudar data de filtro
document.getElementById('filterStartDate').addEventListener('change', displayEntries);
document.getElementById('filterEndDate').addEventListener('change', displayEntries);

// Exibe observações iniciais
displayEntries();