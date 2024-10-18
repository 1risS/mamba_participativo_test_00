document.addEventListener('DOMContentLoaded', async () => {
    const grainSizeFader = document.getElementById('grainSizeFader');
    const startButton = document.getElementById('startButton');
    let grainPlayer;
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
        console.log("Reproducir audio de silencio para activar el contexto de audio en iOS...");
        document.getElementById('silence-audio').play();

        // Cargar el buffer al cargar la página
        await loadAudioBuffer();

        try {
            console.log('Intentando iniciar Tone.js...');
            await Tone.start(); // Asegura que Tone.js esté listo tras el gesto
            console.log('AudioContext activado en iOS');

            if (buffer) {
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
                }).toDestination();

                window.grainPlayer = grainPlayer;  // Para depurar en la consola

                // Ocultar el botón y mostrar el fader
                startButton.style.display = 'none';
                grainSizeFader.style.display = 'block';
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
    };

    // Solo usamos 'click' para asegurar la correcta inicialización en iOS
    startButton.addEventListener('click', startAudio);
});
