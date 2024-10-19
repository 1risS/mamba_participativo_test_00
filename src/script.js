document.addEventListener('DOMContentLoaded', async () => {
    const grainSizeFader = document.getElementById('grainSizeFader');
    const wetFader = document.getElementById('wetFader');
    const startButton = document.getElementById('startButton');
    const silentAudio = document.getElementById('silentAudio');
    let grainPlayer, pingPongDelay;
    let buffer;

    // Cargar el buffer de audio explícitamente antes de iniciar el player
    const loadAudioBuffer = async () => {
        try {
            console.log('Cargando el buffer de audio...');
            buffer = await new Tone.Buffer('./cluster.wav');
            console.log('Buffer cargado correctamente.');
        } catch (error) {
            console.error('Error al cargar el buffer de audio:', error);
        }
    };

    // Inicializamos el contexto de audio al presionar el botón "Iniciar"
    const startAudio = async () => {
<<<<<<< HEAD
        // Reproducir el audio silencioso
        silentAudio.play().then(async () => {
            console.log('Audio silencioso reproducido');
=======
        console.log("Reproducir audio de silencio para activar el contexto de audio en iOS...");
        document.getElementById('silence-audio').play();

        // Cargar el buffer al cargar la página
        await loadAudioBuffer();
>>>>>>> b69247326a0924b76db0546b37568b5a16925f81

            // Cargar el buffer al cargar la página
            await loadAudioBuffer();

            try {
                console.log('Intentando iniciar Tone.js...');
                await Tone.start(); // Asegura que Tone.js esté listo tras el gesto
                console.log('AudioContext activado en iOS');

                if (buffer) {
                    // Crear el efecto PingPongDelay con valores predeterminados
                    pingPongDelay = new Tone.PingPongDelay({
                        delayTime: '8n',  // Ajusta esto si deseas otro tiempo
                        feedback: 0.6,    // Retroalimentación
                        wet: 0            // Valor inicial para el wet (controlado por el fader)
                    }).toDestination();

                    // Iniciar el GrainPlayer solo después de activar el contexto de audio
                    grainPlayer = new Tone.GrainPlayer({
                        url: buffer,
                        loop: true,
                        grainSize: 0.2,  // Tamaño inicial del grano
                        onload: () => {
                            console.log('GrainPlayer cargado exitosamente');
                            grainPlayer.start(); // Inicia el GrainPlayer solo cuando el archivo esté cargado
                        },
                        onerror: (error) => {
                            console.error('Error al cargar el archivo de audio:', error);
                        }
                    });

                    // Conectar el GrainPlayer al efecto PingPongDelay
                    grainPlayer.connect(pingPongDelay);

                    window.grainPlayer = grainPlayer;  // Para depurar en la consola

                    // Ocultar el botón y mostrar los faders
                    startButton.style.display = 'none';
                    grainSizeFader.style.display = 'block';
                    wetFader.style.display = 'block';
                } else {
                    console.error('El buffer de audio no está cargado correctamente.');
                }
            } catch (error) {
                console.error('Error iniciando el AudioContext:', error);
            }

            // Control del tamaño del grano a través del fader
            grainSizeFader.addEventListener('input', (e) => {
                const grainSize = parseFloat(e.target.value);  // Obtener el valor del fader
                if (grainPlayer) {
                    grainPlayer.grainSize = grainSize;  // Ajustar el tamaño del grano
                    console.log('Ancho del grano:', grainSize);
                    grainPlayer.playbackRate = grainSize * 10;  // Ajustar la velocidad de reproducción
                }
            });

            // Control del "wet" del PingPongDelay a través del fader vertical
            wetFader.addEventListener('input', (e) => {
                const wetValue = parseFloat(e.target.value);  // Obtener el valor del fader
                if (pingPongDelay) {
                    pingPongDelay.wet.value = wetValue;  // Ajustar el "wet" del delay
                    console.log('Valor de wet:', wetValue);
                }
            });
        }).catch(error => {
            console.error('Error al reproducir el audio silencioso:', error);
        });
    };

    // Solo usamos 'click' para asegurar la correcta inicialización en iOS
    startButton.addEventListener('click', startAudio);
});
