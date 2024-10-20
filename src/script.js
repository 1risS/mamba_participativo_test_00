document.addEventListener('DOMContentLoaded', async () => {
    const startButton = document.getElementById('startButton');
    const silentAudio = document.getElementById('silentAudio');
    let grainPlayer, pingPongDelay, analyser;
    let buffer;
    let isPressed = false;

    // Definir la función loadAudioBuffer para cargar el buffer de audio
    const loadAudioBuffer = async () => {
        try {
            console.log('Cargando el buffer de audio...');
            buffer = await new Tone.Buffer('./cluster.wav');  // Ruta correcta del archivo
            console.log('Buffer cargado correctamente.');
        } catch (error) {
            console.error('Error al cargar el buffer de audio:', error);
        }
    };

    const p5Sketch = (p) => {
        let num = 1000;
        let vx = new Array(num);
        let vy = new Array(num);
        let x = new Array(num);
        let y = new Array(num);
        let ax = new Array(num);
        let ay = new Array(num);
        let magnetism = 10.0;
        let radius = 1;
        let gensoku = 0.95;

        p.setup = function () {
            p.createCanvas(p.windowWidth, p.windowHeight);
            p.noStroke();
            p.ellipseMode(p.RADIUS);

            for (let i = 0; i < num; i++) {
                x[i] = p.random(p.width);
                y[i] = p.random(p.height);
                vx[i] = 0;
                vy[i] = 0;
                ax[i] = 0;
                ay[i] = 0;
            }

            // Añadimos los eventos de interacción
            p.mousePressed = () => {
                isPressed = true;
                if (grainPlayer) {
                    grainPlayer.volume.rampTo(0, 1);  // Subir el volumen en 1 segundo
                }
            };

            p.mouseReleased = () => {
                isPressed = false;
                if (grainPlayer) {
                    grainPlayer.volume.rampTo(-Infinity, 2);  // Bajar el volumen en 2 segundos
                }
            };
        };

        p.draw = function () {
            drawGradientBackground(); // Dibujar el fondo con el degradado

            let waveform = analyser.getValue();

            for (let i = 0; i < num; i++) {
                let targetX = isPressed ? p.mouseX : 0;
                let targetY = isPressed ? p.mouseY : 0;

                let distance = p.dist(targetX, targetY, x[i], y[i]);
                if (distance > 3) {
                    ax[i] = magnetism * (targetX - x[i]) / (distance * distance);
                    ay[i] = magnetism * (targetY - y[i]) / (distance * distance);
                }

                let audioMod = p.map(waveform[i % waveform.length], -1, 1, -5, 5);
                vx[i] += ax[i] + audioMod;
                vy[i] += ay[i] + audioMod;

                vx[i] = vx[i] * gensoku;
                vy[i] = vy[i] * gensoku;
                x[i] += vx[i];
                y[i] += vy[i];

                // Cambiar el color según la posición Y y agregar glow
                let proximityToBlack = p.map(y[i], 0, p.height, 0, 1);
                let particleColor = p.lerpColor(p.color(255, 0, 0), p.color(255, 255, 255), proximityToBlack);
                p.fill(particleColor);

                // Efecto glow
                p.push();
                p.drawingContext.shadowBlur = 20;
                p.drawingContext.shadowColor = p.color(255, 0, 0);  // Color del glow
                p.ellipse(x[i], y[i], radius + proximityToBlack * 5, radius + proximityToBlack * 5);  // Partícula con glow
                p.pop();
            }

            let wetValue = mapValueLog(p.mouseX, 0, p.width, 0.01, 1);
            let grainSize = p.map(p.mouseY, 0, p.height, 0.01, 0.09);

            if (pingPongDelay) pingPongDelay.wet.value = wetValue;
            if (grainPlayer) grainPlayer.grainSize = grainSize;

            console.log('Wet:', wetValue, 'GrainSize:', grainSize);
        };

        p.windowResized = function () {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        function mapValueLog(value, inMin, inMax, outMin, outMax) {
            const normalizedInput = (value - inMin) / (inMax - inMin);
            const logMin = Math.log(outMin);
            const logMax = Math.log(outMax);
            const logRange = logMax - logMin;

            const logValue = logMin + normalizedInput * logRange;

            return Math.exp(logValue);
        }

        // Función para dibujar el fondo con un degradado
        function drawGradientBackground() {
            for (let i = 0; i <= p.height; i++) {
                let inter = p.map(i, 0, p.height, 0, 1);
                let colorLerp = p.lerpColor(p.color('#5f568c'), p.color(0), inter);
                p.stroke(colorLerp);
                p.line(0, i, p.width, i);
            }
        }
    };

    const startAudio = async () => {
        silentAudio.play().then(async () => {
            await loadAudioBuffer();  // Ahora se llama correctamente a loadAudioBuffer
            try {
                await Tone.start();
                if (buffer) {
                    pingPongDelay = new Tone.PingPongDelay({
                        delayTime: '8n',
                        feedback: 0.6,
                        wet: 0
                    });

                    analyser = new Tone.Analyser('waveform', 256);
                    grainPlayer = new Tone.GrainPlayer({
                        url: buffer,
                        loop: true,
                        grainSize: 0.2,
                        volume: -Infinity,
                        onload: () => grainPlayer.start(),
                        onerror: (error) => console.error(error)
                    });

                    grainPlayer.connect(pingPongDelay);
                    pingPongDelay.connect(analyser);
                    analyser.toDestination();

                    startButton.style.display = 'none';
                    new p5(p5Sketch);
                }
            } catch (error) {
                console.error(error);
            }
        });
    };

    startButton.addEventListener('click', startAudio);
});
