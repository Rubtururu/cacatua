document.addEventListener('DOMContentLoaded', function() {
    const pressButton = document.getElementById('press-button');
    const timerDisplay = document.getElementById('timer');
    const poolTotalDisplay = document.getElementById('pool-total');
    const userList = document.getElementById('user-list');
    const currentCostDisplay = document.getElementById('current-cost');
    const depositButton = document.getElementById('deposit-button');
    const withdrawButton = document.getElementById('withdraw-button');
    const depositAmountInput = document.getElementById('deposit-amount');
    const withdrawAmountInput = document.getElementById('withdraw-amount');
    const withdrawAddressInput = document.getElementById('withdraw-address');
    const userIdInput = document.getElementById('user-id');
    const projectBalanceDisplay = document.getElementById('project-balance');

    let currentCost = 1;
    let poolTotal = 0;
    let users = [];
    let intervalId = null;
    let endTime = null;

    // Función para actualizar el temporizador
    function startTimer(duration) {
        endTime = Date.now() + duration * 1000; // Calcular el tiempo de finalización
        updateTimer(); // Actualizar el temporizador inmediatamente

        clearInterval(intervalId); // Limpiar el intervalo anterior, si existe
        intervalId = setInterval(updateTimer, 1000); // Actualizar el temporizador cada segundo
    }

    // Función para actualizar el display del temporizador
    function updateTimer() {
        let now = Date.now();
        let diff = endTime - now;

        if (diff <= 0) {
            clearInterval(intervalId);
            diff = 0;
            distributePrizes(); // Lógica para repartir premios cuando el tiempo llegue a cero
        }

        // Calcula minutos y segundos
        let minutes = Math.floor(diff / (1000 * 60));
        let seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Formato de dos dígitos para minutos y segundos
        let minutesStr = minutes < 10 ? '0' + minutes : minutes;
        let secondsStr = seconds < 10 ? '0' + seconds : seconds;

        // Actualiza el display del temporizador
        timerDisplay.textContent = minutesStr + ':' + secondsStr;
    }

    // Función para distribuir los premios entre los últimos 30 usuarios
    function distributePrizes() {
        // Ordena usuarios por tiempo de presión del botón (más reciente primero)
        users.sort((a, b) => b.time - a.time);

        // Calcular el total de la pool
        let totalPrize = poolTotal;

        // Tomar hasta 30 usuarios (o menos si hay menos de 30 en la lista)
        let totalUsers = Math.min(users.length, 30);

        // Calcular premios con distribución en % de mayor a menor
        let prizeDistribution = [];
        let totalPercentage = 100;
        let accumulatedPercentage = 0;
        for (let i = 0; i < totalUsers; i++) {
            let percentage = totalPercentage * (totalUsers - i) / ((totalUsers * (totalUsers + 1)) / 2); // Distribución decreciente
            let prize = Math.floor(totalPrize * (percentage / 100));
            prizeDistribution.push({ userId: users[i].id, prize: prize, percentage: percentage });
            accumulatedPercentage += percentage;
        }

        // Mostrar bote acumulado redondeado sin decimales innecesarios
        poolTotalDisplay.textContent = Math.floor(poolTotal);

        // Mostrar ranking y premios
        userList.innerHTML = '';
        prizeDistribution.forEach(entry => {
            getUsername(entry.userId)
                .then(username => {
                    let li = document.createElement('li');
                    li.textContent = `${username}: ${entry.prize} Ton (${entry.percentage.toFixed(2)}%)`;
                    userList.appendChild(li);
                })
                .catch(error => {
                    console.error('Error al obtener el nombre de usuario:', error);
                });
        });
    }

    // Evento cuando se presiona el botón
    pressButton.addEventListener('click', function() {
        const userId = userIdInput.value;
        if (!userId) {
            alert('Por favor, ingrese su ID de usuario de Telegram.');
            return;
        }

        // Añadir usuario a la lista
        users.push({ id: userId, time: Date.now() });

        // Actualizar visualización del bote acumulado
        poolTotal += currentCost * 0.9; // Añadir el 90% del costo al bote
        poolTotalDisplay.textContent = Math.floor(poolTotal);

        // Aumentar el costo para el siguiente usuario
        currentCost++;

        // Mostrar el costo actualizado del botón
        currentCostDisplay.textContent = ` ${currentCost}`;

        // Reiniciar temporizador a 1 minuto (60 segundos)
        startTimer(60);

        // Mostrar ranking actualizado
        distributePrizes();
    });

    // Función para manejar depósitos
    depositButton.addEventListener('click', function() {
        const amount = depositAmountInput.value;
        const userId = userIdInput.value;
        if (!userId) {
            alert('Por favor, ingrese su ID de usuario de Telegram.');
            return;
        }
        fetch('/deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount, userId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Depósito:', data);
        })
        .catch(error => {
            console.error('Error en el depósito:', error);
        });
    });

    // Función para manejar retiros
    withdrawButton.addEventListener('click', function() {
        const amount = withdrawAmountInput.value;
        const toAddress = withdrawAddressInput.value;
        const userId = userIdInput.value;
        if (!userId) {
            alert('Por favor, ingrese su ID de usuario de Telegram.');
            return;
        }
        fetch('/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount, userId, toAddress }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Retiro:', data);
        })
        .catch(error => {
            console.error('Error en el retiro:', error);
        });
    });

    // Iniciar temporizador al cargar la página
    startTimer(60);

    // Mostrar el costo inicial del botón al cargar la página
    currentCostDisplay.textContent = ` ${currentCost}`;

    // Función para obtener el nombre de usuario de Telegram
    function getUsername(userId) {
        return fetch('/get-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        })
        .then(response => response.json())
        .then(data => {
            return data.username;
        })
        .catch(error => {
            console.error('Error al obtener el nombre de usuario:', error);
        });
    }
});
