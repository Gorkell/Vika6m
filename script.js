// Глобальные переменные для хранения прогресса
let gameState;

// Инициализация состояния игры
function initializeGameState() {
    // Если gameState уже загружен из localStorage, не перезаписываем его
    if (!gameState) {
        gameState = {
            locks: {
                memories: [],
                heart: [],
                game: []
            },
            roomsCompleted: {
                memories: false,
                heart: false,
                game: false
            },
            secretClicks: 0
        };
        console.log('Created new gameState');
        saveGameState();
    } else {
        console.log('Using existing gameState');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    initializeGameState();
    initializeMainPage();
    initializeSecretEasterEgg();
    
    // Инициализация игровых комнат после загрузки gameState
    initializeRoomPages();
    
    // Инициализация игровой комнаты
    if (window.location.pathname.includes('game')) {
        initializeGameRoom();
    }
});

// Инициализация игровой комнаты
function initializeGameRoom() {
    // Загружаем игровые функции если они еще не загружены
    if (typeof resetGameRoom === 'function') {
        // Проверяем состояние замка
        const gameLock = document.getElementById('game-lock');
        if (gameLock && gameState.locks.game && gameState.locks.game.includes('game_0')) {
            gameLock.textContent = '🔓';
            gameLock.classList.add('unlocked');
        }
    }
}

// Загрузка состояния игры из localStorage
function loadGameState() {
    try {
        const saved = localStorage.getItem('magicRoomState');
        console.log('Loading gameState from localStorage:', saved);
        if (saved) {
            gameState = JSON.parse(saved);
            console.log('GameState loaded successfully:', gameState);
        } else {
            console.log('No saved gameState found, using default');
        }
    } catch (error) {
        console.error('Error loading gameState:', error);
    }
}

// Сохранение состояния игры в localStorage
function saveGameState() {
    try {
        console.log('Saving gameState:', gameState);
        const gameStateString = JSON.stringify(gameState);
        localStorage.setItem('magicRoomState', gameStateString);
        
        // Проверяем что сохранилось
        const saved = localStorage.getItem('magicRoomState');
        console.log('Verification - saved data:', saved);
        console.log('Verification - data matches:', saved === gameStateString);
        
        console.log('GameState saved successfully');
    } catch (error) {
        console.error('Error saving gameState:', error);
    }
}

// Инициализация главной страницы
function initializeMainPage() {
    if (!document.querySelector('.rooms-grid')) return;
    
    updateProgress();
    updateRoomLocks();
    
    // Проверка доступа к финальной комнате
    const finalRoom = document.getElementById('final-room');
    if (finalRoom) {
        const allCompleted = gameState.roomsCompleted.memories && 
                           gameState.roomsCompleted.heart &&
                           gameState.roomsCompleted.game;
        
        if (!allCompleted) {
            finalRoom.classList.add('locked');
            finalRoom.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Сначала пройдите все комнаты!');
            });
        }
    }
    
    // Проверка доступа к комнате сердца
    const heartRoom = document.getElementById('heart-room');
    if (heartRoom) {
        const requiredCompleted = gameState.roomsCompleted.memories && 
                               gameState.roomsCompleted.game;
        
        if (!requiredCompleted) {
            heartRoom.classList.add('locked');
            heartRoom.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Комната сердца откроется только после прохождения комнат воспоминаний и игры!');
            });
        }
    }
}

// Обновление прогресса
function updateProgress() {
    const totalRooms = 3; // memories, fun, game
    const completedRooms = Object.values(gameState.roomsCompleted).filter(Boolean).length;
    const progress = Math.round((completedRooms / totalRooms) * 100);
    
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) progressFill.style.width = progress + '%';
    if (progressText) progressText.textContent = progress + '% завершено';
}

// Обновление статуса замков на главной странице
function updateRoomLocks() {
    const rooms = ['memories', 'heart', 'game'];
    
    rooms.forEach(room => {
        const lockElement = document.getElementById(room + '-lock');
        if (lockElement) {
            if (room === 'game') {
                // Игровая комната имеет только один замок
                const locksInRoom = gameState.locks.game ? gameState.locks.game.length : 0;
                if (locksInRoom === 0) {
                    lockElement.textContent = '🎮';
                } else {
                    lockElement.textContent = '🔒';
                }
            } else if (room === 'heart') {
                // Комната сердца имеет только один замок
                const locksInRoom = gameState.locks.heart ? gameState.locks.heart.length : 0;
                if (locksInRoom === 0) {
                    lockElement.textContent = '❤️';
                } else {
                    lockElement.textContent = '🔒';
                }
            } else {
                // Комната воспоминаний имеет 6 замков
                const locksInRoom = gameState.locks[room] ? gameState.locks[room].length : 0;
                if (locksInRoom === 0) {
                    lockElement.textContent = '🔒🔒🔒🔒🔒🔒';
                } else if (locksInRoom === 1) {
                    lockElement.textContent = '🔓🔒🔒🔒🔒🔒';
                } else if (locksInRoom === 2) {
                    lockElement.textContent = '🔓🔓🔒🔒🔒🔒';
                } else if (locksInRoom === 3) {
                    lockElement.textContent = '🔓🔓🔓🔒🔒🔒';
                } else if (locksInRoom === 4) {
                    lockElement.textContent = '🔓🔓🔓🔓🔒🔒';
                } else if (locksInRoom === 5) {
                    lockElement.textContent = '🔓🔓🔓🔓🔓🔒';
                } else if (locksInRoom === 6) {
                    lockElement.textContent = '🔓🔓🔓🔓🔓🔓';
                }
            }
        }
    });
}

// Инициализация страниц комнат
function initializeRoomPages() {
    const floatingLocks = document.querySelectorAll('.floating-lock');
    
    floatingLocks.forEach((lock, index) => {
        // Пропускаем игровой замок - он обрабатывается отдельно
        if (lock.id === 'game-lock') return;
        
        const roomType = getRoomType();
        const lockId = roomType + '_' + index;
        
        // Проверяем состояние замка
        if (gameState.locks[roomType] && gameState.locks[roomType].includes(lockId)) {
            lock.textContent = '🔓';
            lock.classList.add('unlocked');
        }
        
        lock.addEventListener('click', function() {
            if (!lock.classList.contains('unlocked')) {
                showRiddle(lockId, roomType, lock);
            }
        });
    });
    
    // Инициализация замка игры
    const gameLock = document.getElementById('game-lock');
    if (gameLock) {
        if (gameState.locks.game && gameState.locks.game.includes('game_0')) {
            gameLock.textContent = '🔓';
            gameLock.classList.add('unlocked');
        }
        
        gameLock.addEventListener('click', function() {
            if (!gameLock.classList.contains('unlocked')) {
                showNotification('Сначала набери 19 очков в игре!');
            }
        });
    }
}

// Получение типа комнаты из URL
function getRoomType() {
    const path = window.location.pathname;
    if (path.includes('memories')) return 'memories';
    if (path.includes('heart')) return 'heart';
    if (path.includes('game')) return 'game';
    return 'unknown';
}

// Показ загадки
function showRiddle(lockId, roomType, lockElement) {
    const modal = document.createElement('div');
    modal.className = 'riddle-modal';
    modal.style.display = 'flex';
    
    const riddleData = getRiddleData(lockId, roomType);
    
    modal.innerHTML = `
        <div class="riddle-content">
            <h3>🧩 Загадка</h3>
            <div class="riddle-question">${riddleData.question}</div>
            <input type="text" class="riddle-input" id="riddle-input" placeholder="Ваш ответ...">
            <div class="riddle-buttons">
                <button class="riddle-button" onclick="checkAnswer('${lockId}', '${roomType}', '${lockElement.className}')">Ответить</button>
                <button class="riddle-button reset-button" onclick="resetLock('${lockId}', '${roomType}', '${lockElement.className}')">Сбросить</button>
                <button class="riddle-button" onclick="closeRiddleModal()">Закрыть</button>
            </div>
            <div class="riddle-message" id="riddle-message"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Фокус на поле ввода
    const input = document.getElementById('riddle-input');
    if (input) {
        input.focus();
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer(lockId, roomType, lockElement.className);
            }
        });
    }
}

// Получение данных загадки в зависимости от типа комнаты и ID
function getRiddleData(lockId, roomType) {
    if (roomType === 'memories') {
        const lockIndex = parseInt(lockId.split('_')[1]);
        
        if (lockIndex === 0) {
            // Сентябрь - стандартная загадка
            return {
                question: 'Имя самой самой красивой и лучшей девушки на свете?',
                checkAnswer: function(answer) {
                    const trimmed = answer.trim();
                    
                    // Правильные ответы
                    if (trimmed === 'Вика') {
                        return { success: true, message: 'Верно! Но это лишь одно из имён Богини!' };
                    }
                    if (['Викачка', 'ВИКАЧКА', 'Викачка'].includes(trimmed)) {
                        return { success: true, message: 'Женя что ли решил ответить? Ну ладно, это правильно!' };
                    }
                    if (['Викусик', 'викусик'].includes(trimmed)) {
                        return { success: true, message: 'абсолютно верно! 🥳' };
                    }
                    if (trimmed === 'Виктория') {
                        return { success: true, message: 'фигасе, с паспорта смотришь? Ну да, это правильный ответ! :]' };
                    }
                    if (['Дроздоперма', 'дроздоперма', 'Дроздаперма', 'дроздаперма'].includes(trimmed)) {
                        return { success: true, message: 'Викуся, такое могла написать только ты 😅' };
                    }
                    if (trimmed === 'я') {
                        return { success: true, message: 'абсолютно верно котик, это ты 😘' };
                    }
                    
                    // Неправильные ответы
                    if (['вика', 'виктория'].includes(trimmed)) {
                        return { success: false, message: 'написать имя Богини с маленькой буквы!? Переписывай! 😡' };
                    }
                    if (['Редмур', 'Левинская'].includes(trimmed)) {
                        return { success: false, message: 'это фамилия Богини а не имя, если что 😒, напиши имя!' };
                    }
                    if (['редмур', 'левинская'].includes(trimmed)) {
                        return { success: false, message: 'это фамилия Богини а не имя, ещё и с маленькой буквы! Переписывай, и с большой буквы!' };
                    }
                    if (['Мопс', 'мопс'].includes(trimmed)) {
                        return { success: false, message: 'мне похуй я мопс! А что? Не не, переписывай' };
                    }
                    
                    return { success: false, message: 'не верно! Ладно, я дам тебе шанс ответить ещё раз.' };
                }
            };
        }
        
        if (lockIndex === 1) {
            // Октябрь - про звук "ирюююм"
            return {
                question: 'Какой легендарный звук появился 16 октября?',
                checkAnswer: function(answer) {
                    const trimmed = answer.trim().toLowerCase();
                    
                    // Правильные ответы
                    if (['ирюююм', 'ирюм', 'ирююм'].includes(trimmed)) {
                        return { success: true, message: 'эхх, жаль что больше он не стоит у меня на сообщениях от тебя 😭🔥' };
                    }
                    if (['ИРЮМ', 'ИРЮЮМ', 'ИРЮЮЮМ'].includes(trimmed)) {
                        return { success: true, message: 'кричишь? правильно кричишь :>' };
                    }
                    if (trimmed === 'мое гс' || trimmed === 'мой гс' || trimmed === 'мое голосовое') {
                        return { success: true, message: 'эхх, я хотел чтоб ты написала как оно звучит, но да, это правильно' };
                    }
                    
                    // Неправильные ответы
                    if (trimmed === 'пошел нахуй') {
                        return { success: false, message: 'так, а ну не выражаться!' };
                    }
                    
                    return { success: false, message: 'неверно! это культовый звук, подсмотри чуть чуть 16 октября 😌' };
                }
            };
        }
        
        if (lockIndex === 2) {
            // Ноябрь - про будильник
            return {
                question: 'Какой самый легендарный будильник в истории мира?',
                checkAnswer: function(answer) {
                    const trimmed = answer.trim().toLowerCase();
                    
                    // Правильные ответы
                    if (trimmed === 'пора вставать хозяин') {
                        return { success: true, message: 'ЛЕГЕНДАААА 😭' };
                    }
                    if (['хозяин вставааай', 'хозяин вставаай', 'хозяин вставай'].includes(trimmed)) {
                        return { success: true, message: 'я до сих пор слышу это в голове 😌' };
                    }
                    if (trimmed === 'пора вставать хозяин, хозяин вставааай' || trimmed === 'пора вставать хозяин, хозяин вставаай' || trimmed === 'пора вставать хозяин, хозяин вставай') {
                        return { success: true, message: 'ФУЛЛ ВЕРСИЯ, маладэц 🥳' };
                    }
                    if (trimmed === 'мое гс' || trimmed === 'мой гс' || trimmed === 'мое голосовое') {
                        return { success: true, message: 'эхх, я хотел чтоб ты написала как оно звучит, но да, это правильно' };
                    }
                    
                    // Неправильные ответы
                    if (trimmed === 'хз') {
                        return { success: false, message: 'эхх, котя, посмотри на 7 ноября :>' };
                    }
                    if (trimmed === 'доброе утро') {
                        return { success: false, message: 'слишком скучно 😒' };
                    }
                    if (trimmed === 'пошел нахуй') {
                        return { success: false, message: 'так, а ну не выражаться!' };
                    }
                    if (trimmed === 'вставай') {
                        return { success: false, message: 'где эмоции? где душа? 😡' };
                    }
                    
                    return { success: false, message: 'не верно! это был шедевр 😤, пересмотри 7 ноября 😢' };
                }
            };
        }
        
        if (lockIndex === 3) {
            // Январь - про бравл старс
            return {
                question: 'Во что мы стояли и играли 4 января прямо посреди казика?',
                checkAnswer: function(answer) {
                    const trimmed = answer.trim().toLowerCase();
                    
                    // Правильные ответы
                    if (trimmed === 'бравл старс' || trimmed === 'brawl stars') {
                        return { success: true, message: trimmed === 'brawl stars' ? 'английский подъехал, засчитано 😌' : 'дя дя, правильна, умняца' };
                    }
                    if (trimmed === 'в бравл' || trimmed === 'бравл') {
                        return { success: true, message: 'по-простому, но верно :>' };
                    }
                    
                    // Неправильные ответы
                    if (trimmed === 'майнкрафт') {
                        return { success: false, message: 'В майне да, но играли то мы не в майн..' };
                    }
                    if (['рпм', 'rpm'].includes(trimmed)) {
                        return { success: false, message: 'В РПМ да, но играли то мы не в него..' };
                    }
                    if (['репа', 'repo', 'репо'].includes(trimmed)) {
                        return { success: false, message: 'репа позже была 😒' };
                    }
                    
                    return { success: false, message: 'не верно! вспоминай стояние в казике 4 января' };
                }
            };
        }
        
        if (lockIndex === 4) {
            // Февраль - про 14 февраля
            return {
                question: 'Какой самый важный день февраля стал особенным, потому что в этом году у меня есть ты?',
                checkAnswer: function(answer) {
                    const trimmed = answer.trim().toLowerCase();
                    
                    // Правильные ответы
                    if (trimmed === '14 февраля') {
                        return { success: true, message: 'потому что у меня есть ты 😘' };
                    }
                    if (trimmed === 'день святого валентина') {
                        return { success: true, message: 'угу, и это потому что у мяня появилася ты 💋' };
                    }
                    if (trimmed === 'день влюбленных') {
                        return { success: true, message: 'самый лучший, потому что с тобой 😘' };
                    }
                    
                    // Неправильные ответы
                    if (trimmed === '23 февраля') {
                        return { success: false, message: 'приятно, но не то 😅' };
                    }
                    if (trimmed === '1 февраля') {
                        return { success: false, message: 'я не знаю зачем отдельный ответ для 1 февраля, не думаю что ты это введешь ахахах' };
                    }
                    
                    return { success: false, message: 'не верно! каждый день конечно стал особенным благодаря тебе, но а какой самый самый 💕' };
                }
            };
        }
        
        if (lockIndex === 5) {
            // Март - про день рождения
            return {
                question: 'Чей день рождения 6 марта — самый важный праздник?',
                checkAnswer: function(answer) {
                    const trimmed = answer.trim().toLowerCase();
                    
                    // Правильные ответы
                    if (['вика', 'викочки', 'викочка','вики'].includes(trimmed)) {
                        return { success: true, message: 'САМОЙ КРАСИВОЙ НА СВЕТЕ 🥳' };
                    }
                    if (trimmed === 'мой') {
                        return { success: true, message: 'да, принцесса 😘' };
                    }
                    if (trimmed === 'богини') {
                        return { success: true, message: 'правильный уровень уважения к себе котя 💋' };
                    }
                    
                    // Неправильные ответы
                    if (trimmed === 'твой') {
                        return { success: false, message: 'мой не в марте 😅, и не-а, отвечай сердечком :>' };
                    }
                    if (trimmed === 'жени') {
                        return { success: false, message: 'у него 4того декабря др 😅' };
                    }
                    
                    return { success: false, message: 'не верно! ну котя, это последний вопросикс :>' };
                }
            };
        }
        
        // Остальные замки - стандартная загадка
        return {
            question: 'Имя самой присамой красивой и лучшей девушки на свете?',
            checkAnswer: function(answer) {
                const trimmed = answer.trim();
                
                // Правильные ответы
                if (trimmed === 'Вика') {
                    return { success: true, message: 'Верно! Но это лишь одно из имён Богини!' };
                }
                if (['Викачка', 'ВИКАЧКА', 'Викачка'].includes(trimmed)) {
                    return { success: true, message: 'Женя что ли решил ответить? Ну ладно, это правильно!' };
                }
                if (['Викусик', 'викусик'].includes(trimmed)) {
                    return { success: true, message: 'абсолютно верно! 🥳' };
                }
                if (trimmed === 'Виктория') {
                    return { success: true, message: 'фигасе, с паспорта смотришь? Ну да, это правильный ответ! :]' };
                }
                if (['Дроздоперма', 'дроздоперма', 'Дроздаперма', 'дроздаперма'].includes(trimmed)) {
                    return { success: true, message: 'Викуся, такое могла написать только ты 😅' };
                }
                
                // Неправильные ответы
                if (['вика', 'виктория'].includes(trimmed)) {
                    return { success: false, message: 'написать имя Богини с маленькой буквы!? Переписывай! 😡' };
                }
                if (['Редмур', 'Левинская'].includes(trimmed)) {
                    return { success: false, message: 'это фамилия Богини а не имя, если что 😒, напиши имя!' };
                }
                if (['редмур', 'левинская'].includes(trimmed)) {
                    return { success: false, message: 'это фамилия Богини а не имя, ещё и с маленькой буквы! Переписывай, и с большой буквы!' };
                }
                if (['Мопс', 'мопс'].includes(trimmed)) {
                    return { success: false, message: 'мне похуй я мопс! А что? Не не, переписывай' };
                }
                
                return { success: false, message: 'не верно! Ладно, я дам тебе шанс ответить ещё раз.' };
            }
        };
    }
    
    if (roomType === 'fun') {
        return {
            question: 'Кто был прав в том самом споре?',
            checkAnswer: function(answer) {
                if (answer.trim().length > 0) {
                    return { success: true, message: 'Конечно ты. Даже если нет 😌' };
                }
                return { success: false, message: 'Введите хотя бы что-то...' };
            }
        };
    }
    
    // Заглушка для неизвестных комнат
    return {
        question: 'Секретный вопрос?',
        checkAnswer: function(answer) {
            return { success: true, message: 'Правильно!' };
        }
    };
}

// Проверка ответа
function checkAnswer(lockId, roomType, lockElementClass) {
    const input = document.getElementById('riddle-input');
    const messageDiv = document.getElementById('riddle-message');
    
    if (!input || !messageDiv) return;
    
    const answer = input.value;
    const riddleData = getRiddleData(lockId, roomType);
    const result = riddleData.checkAnswer(answer);
    
    messageDiv.textContent = result.message;
    
    if (result.success) {
        // Разблокируем замок
        if (!gameState.locks[roomType]) {
            gameState.locks[roomType] = [];
        }
        
        if (!gameState.locks[roomType].includes(lockId)) {
            gameState.locks[roomType].push(lockId);
        }
        
        // Сохраняем состояние перед проверкой завершения
        saveGameState();
        
        // Обновляем иконку замка на странице
        const lockElement = document.querySelector('.' + lockElementClass.split(' ')[1]);
        if (lockElement) {
            lockElement.textContent = '🔓';
            lockElement.classList.add('unlocked');
        }
        
        // Проверяем завершение комнаты
        checkRoomCompletion(roomType);
        
        // Закрываем модальное окно через 2 секунды
        setTimeout(() => {
            closeRiddleModal();
        }, 2000);
    }
}

// Проверка завершения комнаты
function checkRoomCompletion(roomType) {
    if (roomType === 'game') {
        // Игровая комната имеет только один замок
        if (gameState.locks.game && gameState.locks.game.length === 1) {
            gameState.roomsCompleted.game = true;
            showNotification('Игровая комната пройдена! 🎮');
            saveGameState();
        }
        return;
    }
    
    if (roomType === 'heart') {
        // Комната сердца имеет только один замок
        if (gameState.locks.heart && gameState.locks.heart.length === 1) {
            gameState.roomsCompleted.heart = true;
            showNotification('Комната сердца пройдена! ❤️');
            saveGameState();
        }
        return;
    }
    
    const roomLocks = ['memories_0', 'memories_1', 'memories_2', 'memories_3', 'memories_4', 'memories_5'];
    
    const roomSpecificLocks = roomLocks.filter(lock => lock.startsWith(roomType));
    const unlockedInRoom = roomSpecificLocks.filter(lock => gameState.locks[roomType].includes(lock));
    
    const requiredLocks = roomType === 'memories' ? 6 : 3;
    
    if (unlockedInRoom.length === requiredLocks) {
        gameState.roomsCompleted[roomType] = true;
        showNotification('Комната пройдена! 🎉');
        saveGameState();
    }
}

// Сброс всей комнаты
function resetRoom(roomType) {
    // Очищаем все замки в комнате
    gameState.locks[roomType] = [];
    gameState.roomsCompleted[roomType] = false;
    
    // Сбрасываем все иконки замков на странице
    const locks = document.querySelectorAll('.floating-lock');
    locks.forEach(lock => {
        if (lock.classList.contains(roomType + '-lock-0') || 
            lock.classList.contains(roomType + '-lock-1') || 
            lock.classList.contains(roomType + '-lock-2')) {
            lock.textContent = '🔒';
            lock.classList.remove('unlocked');
        }
    });
    
    // Особый сброс для игровой комнаты
    if (roomType === 'game') {
        const gameLock = document.getElementById('game-lock');
        if (gameLock) {
            gameLock.textContent = '🔒';
            gameLock.classList.remove('unlocked');
        }
    }
    
    // Обновляем прогресс
    updateProgress();
    updateRoomLocks();
    
    // Сохраняем состояние
    saveGameState();
    
    // Показываем уведомление
    showNotification('Комната сброшена! Пройди её заново 🔄');
}

// Сброс замочка
function resetLock(lockId, roomType, lockElementClass) {
    // Удаляем замок из списка разблокированных
    if (gameState.locks[roomType]) {
        const index = gameState.locks[roomType].indexOf(lockId);
        if (index > -1) {
            gameState.locks[roomType].splice(index, 1);
        }
    }
    
    // Помечаем комнату как незавершенную
    gameState.roomsCompleted[roomType] = false;
    
    // Обновляем иконку замка на странице
    const lockElement = document.querySelector('.' + lockElementClass.split(' ')[1]);
    if (lockElement) {
        lockElement.textContent = '🔒';
        lockElement.classList.remove('unlocked');
    }
    
    // Показываем сообщение
    const messageDiv = document.getElementById('riddle-message');
    if (messageDiv) {
        messageDiv.textContent = 'Замок сброшен! Попробуй ещё раз 🔄';
    }
    
    // Очищаем поле ввода
    const input = document.getElementById('riddle-input');
    if (input) {
        input.value = '';
        input.focus();
    }
    
    // Обновляем прогресс
    updateProgress();
    updateRoomLocks();
    
    // Сохраняем состояние
    saveGameState();
}

// Закрытие модального окна загадки
function closeRiddleModal() {
    const modal = document.querySelector('.riddle-modal');
    if (modal) {
        modal.remove();
    }
}

// Показ уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Инициализация пасхалки с кликами по фону
function initializeSecretEasterEgg() {
    let clickCount = 0;
    let clickTimer = null;
    
    document.body.addEventListener('click', function(e) {
        // Проверяем, что клик не по интерактивному элементу
        if (e.target === document.body || 
            e.target.classList.contains('magic-room') ||
            e.target.classList.contains('stars')) {
            
            clickCount++;
            
            // Сброс счетчика через 2 секунды без кликов
            if (clickTimer) {
                clearTimeout(clickTimer);
            }
            
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);
            
            // Пасхалка при 5 кликах
            if (clickCount === 5) {
                showSecretMessage();
                clickCount = 0;
            }
        }
    });
}

// Показ секретного сообщения
function showSecretMessage() {
    const secretDiv = document.createElement('div');
    secretDiv.className = 'secret-message';
    secretDiv.style.display = 'block';
    secretDiv.textContent = 'Ты нашла секрет 🥹';
    
    document.body.appendChild(secretDiv);
    
    setTimeout(() => {
        secretDiv.remove();
    }, 3000);
}

// Добавление CSS анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
