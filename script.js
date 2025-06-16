// Variables globales
let stream = null;
let video = null;
let canvas = null;
let capturedPhotoData = null;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isPlaying = false;

// Texto de la carta para el audio
const letterText = `
    Querido Papá,
    Cuando era muy pequeñito, tú eras mi superhéroe gigante. Me cargabas en tus hombros y yo me sentía como si pudiera tocar las nubes. Tus manos enormes me hacían sentir seguro, y tu risa era la música más bonita del mundo.

    Cuando empecé a caminar, tú estabas ahí con los brazos abiertos esperándome. Cada vez que me caía, tú me levantabas y me decías "vamos, campeón, una vez más". Nunca te cansaste de enseñarme.

    En mis primeros días de escuela, cuando tenía miedo, tú me tomabas de la mano y me decías que todo iba a estar bien. Y siempre tenías razón. Cuando llegaba a casa, tú querías saber todo sobre mi día, como si mis pequeñas aventuras fueran las más importantes del mundo.

    Ahora que voy creciendo, entiendo que trabajas muy duro para darnos todo lo que necesitamos. A veces llegas cansado, pero siempre tienes tiempo para un abrazo, para ayudarme con la tarea, o para jugar conmigo aunque sea un ratito.

    Papá, quiero que sepas que eres mi héroe de verdad. No por ser perfecto, sino porque me amas sin condiciones. Porque me enseñas a ser buena persona, porque me proteges, porque me haces reír, y porque sé que siempre puedo contar contigo.

    Cuando sea grande, quiero ser como tú: valiente, trabajador, amoroso y divertido. Quiero que mis hijos me vean como yo te veo a ti.

    Gracias por ser el mejor papá del mundo. Te amo muchísimo.
    Tu hijo que te adora.
`;

// Función para crear sonido de alerta
function playAlertSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        function createBeep(frequency, duration, startTime = 0) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            const currentTime = audioContext.currentTime + startTime;
            gainNode.gain.setValueAtTime(0.3, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + duration);
        }

        // Crear secuencia de beeps de alerta
        createBeep(800, 0.2, 0);
        createBeep(600, 0.2, 0.3);
        createBeep(800, 0.2, 0.6);

    } catch (e) {
        console.log('Error al reproducir sonido:', e);
    }
}

// Función para entrar al sitio
function enterSite() {
    playAlertSound();
    document.getElementById('warningScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    initializeApp();
}

// Función para inicializar la aplicación
function initializeApp() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');

    setupEventListeners();
    setCurrentDate();
}

// Configurar event listeners
function setupEventListeners() {
    // Botones de cámara
    document.getElementById('start-camera-btn').addEventListener('click', startCamera);
    document.getElementById('take-photo-btn').addEventListener('click', takePhoto);
    document.getElementById('retake-btn').addEventListener('click', retakePhoto);
    document.getElementById('save-photo-btn').addEventListener('click', savePhoto);

    // Botones de audio
    document.getElementById('playAudio').addEventListener('click', playAudio);
    document.getElementById('stopAudio').addEventListener('click', stopAudio);

    // Botones de diploma
    document.getElementById('diploma-btn').addEventListener('click', showDiploma);
    document.querySelector('.close-diploma').addEventListener('click', closeDiploma);
    document.getElementById('download-diploma-btn').addEventListener('click', downloadDiploma);
    document.getElementById('print-diploma-btn').addEventListener('click', printDiploma);

    // Cerrar modal haciendo clic fuera
    document.getElementById('diploma-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDiploma();
        }
    });
}

// Función para activar la cámara
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 400 },
                height: { ideal: 300 }
            }
        });

        video.srcObject = stream;

        document.getElementById('start-camera-btn').style.display = 'none';
        document.getElementById('take-photo-btn').style.display = 'inline-block';

    } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
}

// Función para tomar foto
function takePhoto() {
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedPhotoData = canvas.toDataURL('image/png');

    document.getElementById('captured-photo').src = capturedPhotoData;
    document.getElementById('video').style.display = 'none';
    document.getElementById('photo-preview').style.display = 'block';
    document.getElementById('take-photo-btn').style.display = 'none';
}

// Función para retomar foto
function retakePhoto() {
    document.getElementById('video').style.display = 'block';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('take-photo-btn').style.display = 'inline-block';
    capturedPhotoData = null;
}

// Función para guardar foto
function savePhoto() {
    if (capturedPhotoData) {
        // Mostrar el botón del diploma
        document.getElementById('diploma-btn').style.display = 'inline-block';

        // Detener la cámara
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        alert('¡Foto guardada! Ahora puedes generar tu diploma.');
    }
}

// Función para reproducir audio
function playAudio() {
    if (isPlaying) return;

    // Detener cualquier reproducción anterior
    speechSynthesis.cancel();

    currentUtterance = new SpeechSynthesisUtterance(letterText);

    // Configurar la voz para que suene más joven
    currentUtterance.pitch = 1.8;
    currentUtterance.rate = 0.9;
    currentUtterance.volume = 1;

    // Buscar una voz femenina si está disponible
    const voices = speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice =>
        voice.lang.includes('es') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => voice.lang.includes('es'));

    if (spanishVoice) {
        currentUtterance.voice = spanishVoice;
    }

    currentUtterance.onstart = function() {
        isPlaying = true;
        document.getElementById('playAudio').style.display = 'none';
        document.getElementById('stopAudio').style.display = 'inline-block';
    };

    currentUtterance.onend = function() {
        isPlaying = false;
        document.getElementById('playAudio').style.display = 'inline-block';
        document.getElementById('stopAudio').style.display = 'none';
    };

    speechSynthesis.speak(currentUtterance);
}

// Función para detener audio
function stopAudio() {
    speechSynthesis.cancel();
    isPlaying = false;
    document.getElementById('playAudio').style.display = 'inline-block';
    document.getElementById('stopAudio').style.display = 'none';
}

// Función para mostrar diploma
function showDiploma() {
    if (!capturedPhotoData) {
        alert('Primero debes tomar una foto para generar el diploma.');
        return;
    }

    document.getElementById('diploma-photo').src = capturedPhotoData;
    document.getElementById('diploma-modal').style.display = 'flex';
}

// Función para cerrar diploma
function closeDiploma() {
    document.getElementById('diploma-modal').style.display = 'none';
}

// Función para establecer fecha actual
function setCurrentDate() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const dateString = now.toLocaleDateString('es-ES', options);
    document.getElementById('current-date').textContent = dateString;
}

// Función para descargar diploma
function downloadDiploma() {
    const diplomaElement = document.querySelector('.diploma-certificate');
    const name = document.getElementById('papa-name').value || 'Súper Papá';

    // Usar html2canvas si está disponible, sino usar método alternativo
    if (typeof html2canvas !== 'undefined') {
        html2canvas(diplomaElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Diploma_${name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    } else {
        // Método alternativo: crear imagen del diploma
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;

        // Fondo blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Texto del diploma
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 36px Times New Roman';
        ctx.textAlign = 'center';
        ctx.fillText('DIPLOMA DE SÚPER PAPÁ', canvas.width/2, 80);

        ctx.fillStyle = '#2c3e50';
        ctx.font = '24px Times New Roman';
        ctx.fillText(name || 'Súper Papá', canvas.width/2, 200);

        ctx.font = '18px Times New Roman';
        ctx.fillText('Por ser un ejemplo de responsabilidad', canvas.width/2, 300);
        ctx.fillText('y amor paternal', canvas.width/2, 330);

        const link = document.createElement('a');
        link.download = `Diploma_${name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
}

// Función para imprimir diploma
function printDiploma() {
    const diplomaContent = document.querySelector('.diploma-certificate').innerHTML;
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Diploma - Súper Papá</title>
            <style>
                body { font-family: 'Times New Roman', serif; margin: 20px; }
                .diploma-border { border: 8px solid #f39c12; border-radius: 15px; padding: 30px; background: white; }
                .diploma-header { text-align: center; margin-bottom: 25px; }
                .diploma-header h1 { color: #e74c3c; font-size: 2.2em; margin: 0; }
                .diploma-header h2 { color: #2980b9; font-size: 1.8em; margin: 5px 0; }
                .diploma-logo { font-size: 3em; margin: 10px 0; }
                .diploma-body { display: flex; align-items: center; gap: 30px; margin-bottom: 25px; }
                .diploma-photo-container img { width: 150px; height: 150px; border-radius: 50%; border: 5px solid #f39c12; }
                .name-input { font-size: 1.5em; font-weight: bold; text-align: center; margin-bottom: 15px; }
                .diploma-signature { text-align: center; border-top: 2px solid #f39c12; padding-top: 15px; color: #e74c3c; font-size: 1.2em; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            ${diplomaContent}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

// Inicializar cuando se carguen las voces
speechSynthesis.onvoiceschanged = function() {
    // Las voces están disponibles
};

// Función de utilidad para manejar errores
window.addEventListener('error', function(e) {
    console.error('Error:', e.error);
});

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // La página está lista
    console.log('Página del Día del Padre cargada correctamente');
});