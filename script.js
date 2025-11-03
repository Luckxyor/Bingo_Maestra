// Configuración de imágenes
const images = [
    'images/CIELO ITALAM.jpg',
    'images/SOL.jpg',
    'images/RIOS.jpg',
    'images/HUMANOS.jpg',
    'images/MAR.jpg',
    'images/FLOR.jpg',
    'images/MUNDO 2.jpg',
    'images/ARBOL ITALAM.jpg',
    'images/MONTAÑA ITALAM.jpg',
    'images/CASA ITALAM.jpg',
    'images/PAJARO.jpg'
];

// Colores vibrantes para cada casillero
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#E63946'
];

let activeSegments = [...Array(images.length).keys()]; // [0, 1, 2, ..., 10]
let isSpinning = false;
let rotation = 0;

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const confirmModal = document.getElementById('confirmModal');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

// Cargar imágenes
const loadedImages = [];
let imagesLoaded = 0;

function loadImages() {
    images.forEach((src, index) => {
        const img = new Image();
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === images.length) {
                drawWheel();
            }
        };
        img.onerror = () => {
            console.log(`No se pudo cargar ${src}, usando color sólido`);
            imagesLoaded++;
            if (imagesLoaded === images.length) {
                drawWheel();
            }
        };
        img.src = src;
        loadedImages[index] = img;
    });
}

// Dibujar la ruleta
function drawWheel() {
    const numSegments = activeSegments.length;
    if (numSegments === 0) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation - Math.PI / 2); // Ajustar para que el primer segmento esté arriba

    activeSegments.forEach((segmentIndex, i) => {
        const startAngle = i * anglePerSegment;
        const endAngle = startAngle + anglePerSegment;

        // Dibujar segmento
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[segmentIndex];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Dibujar imagen si está disponible
        ctx.save();
        ctx.rotate(startAngle + anglePerSegment / 2);
        
        if (loadedImages[segmentIndex] && loadedImages[segmentIndex].complete) {
            // Calcular tamaño dinámico basado en el número de segmentos
            // Muchos segmentos = imágenes pequeñas
            // Pocos segmentos = imágenes grandes
            const baseSize = 0.3; // Tamaño inicial pequeño
            const maxSize = 0.7; // Tamaño máximo cuando queda 1 segmento
            const sizeMultiplier = baseSize + ((maxSize - baseSize) * (11 - numSegments) / 10);
            const imgSize = radius * sizeMultiplier;
            
            // Posición: empezar cerca del borde, acercarse al centro cuando quedan pocos
            const baseDistance = 0.75; // Cerca del borde
            const minDistance = 0.5; // Más cerca del centro
            const distanceMultiplier = baseDistance - ((baseDistance - minDistance) * (11 - numSegments) / 10);
            const distanceFromCenter = radius * distanceMultiplier;
            const imgX = distanceFromCenter - imgSize / 2;
            const imgY = -imgSize / 2;
            
            ctx.beginPath();
            ctx.arc(distanceFromCenter, 0, imgSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            
            ctx.drawImage(loadedImages[segmentIndex], imgX, imgY, imgSize, imgSize);
        }
        
        ctx.restore();
    });

    ctx.restore();

    // Dibujar círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.stroke();
}

// Girar la ruleta
function spinWheel() {
    if (isSpinning || activeSegments.length === 0) return;

    isSpinning = true;
    canvas.style.cursor = 'wait';

    const numSegments = activeSegments.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;
    
    // Rotación total: múltiples vueltas + ángulo aleatorio
    const spins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 2 * Math.PI;
    const totalRotation = spins * 2 * Math.PI + randomAngle;
    
    const duration = 4000; // 4 segundos
    const startTime = Date.now();
    const startRotation = rotation;

    function animate() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Función de suavizado (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        rotation = startRotation + totalRotation * easeOut;
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Calcular el segmento ganador
            // La flecha apunta hacia arriba
            let normalizedRotation = (rotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            
            // Como la ruleta gira en sentido horario pero queremos el índice en sentido antihorario
            // invertimos el cálculo
            let winningIndex = numSegments - 1 - Math.floor(normalizedRotation / anglePerSegment);
            if (winningIndex < 0) winningIndex = numSegments - 1;
            winningIndex = winningIndex % numSegments;
            
            const winningSegment = activeSegments[winningIndex];
            
            console.log('Rotation:', rotation);
            console.log('Normalized:', normalizedRotation);
            console.log('Angle per segment:', anglePerSegment);
            console.log('Winning index:', winningIndex);
            console.log('Winning segment:', winningSegment);
            console.log('Active segments:', activeSegments);
            
            setTimeout(() => {
                showModal(winningSegment);
                removeSegment(winningIndex);
                isSpinning = false;
                canvas.style.cursor = 'pointer';
            }, 500);
        }
    }

    animate();
}

// Mostrar modal con la imagen
function showModal(segmentIndex) {
    modalImage.src = images[segmentIndex];
    modal.classList.add('show');
}

// Cerrar modal al hacer clic fuera de la imagen
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Eliminar segmento de la ruleta
function removeSegment(index) {
    activeSegments.splice(index, 1);
    drawWheel();
    
    if (activeSegments.length === 0) {
        canvas.style.cursor = 'default';
        setTimeout(() => {
            alert('🎉 ¡כל הכבוד! השלמת את כל הגלגל! 🎉\n(¡Felicitaciones! ¡Completaste toda la ruleta!)');
        }, 300);
    }
}

// Mostrar modal de confirmación para reiniciar
function showConfirmModal() {
    confirmModal.classList.add('show');
}

// Reiniciar la ruleta
function resetWheel() {
    activeSegments = [...Array(images.length).keys()];
    rotation = 0;
    isSpinning = false;
    canvas.style.cursor = 'pointer';
    modal.classList.remove('show');
    confirmModal.classList.remove('show');
    drawWheel();
}

// Event listeners
canvas.addEventListener('click', spinWheel);
canvas.style.cursor = 'pointer';
resetBtn.addEventListener('click', showConfirmModal);
confirmYes.addEventListener('click', resetWheel);
confirmNo.addEventListener('click', () => {
    confirmModal.classList.remove('show');
});

// Cerrar modal de confirmación al hacer clic fuera
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.remove('show');
    }
});

// Inicializar
loadImages();
