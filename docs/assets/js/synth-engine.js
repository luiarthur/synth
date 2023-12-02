function makeNotes() {
    // Definitions for first octave.
    const noteFreq = {
        1: {
            "C":  32.703195662574829,
            "C#": 34.647828872109012,
            "D":  36.708095989675945,
            "D#": 38.890872965260113,
            "E":  41.203444614108741,
            "F":  43.653528929125485,
            "F#": 46.249302838954299,
            "G":  48.999429497718661,
            "G#": 51.913087197493142,
            "A":  55.000000000000000,
            "A#": 58.270470189761239,
            "B":  61.735412657015513,
        }
    }

    // Remaining octaves.
    for (let octave=2; octave<9; octave++) {
        noteFreq[octave] = {}
        Object.keys(noteFreq[1]).forEach(note => {
            noteFreq[octave][note] = noteFreq[octave-1][note] * 2
        })
    }

    return noteFreq
}

export const notes = makeNotes()

function playNote(ctx, waveform, noteFreq, cutoff, startTime, duration, gainLevel) {
    const osc = ctx.createOscillator()
    osc.type = waveform  // sine, square, sawtooth, triangle
    osc.frequency.value = noteFreq
    
    const bfq = ctx.createBiquadFilter()
    // bfq.type = "lowshelf"
    // bfq.frequency.setValueAtTime(cutoff, startTime)
    // bfq.gain.setValueAtTime(2 * cutoff/noteFreq, startTime)
    bfq.type = "lowpass"
    bfq.frequency.setValueAtTime(cutoff, startTime)
    // bfq.Q.setValueAtTime(100, startTime)
    bfq.connect(ctx.destination)

    if (gainLevel === undefined) { gainLevel = 1 }
    const gn = ctx.createGain()
    gn.gain.setValueAtTime(gainLevel, startTime)
    gn.connect(bfq)
 
    osc.connect(gn)
    osc.start(ctx.currentTime + startTime)
    osc.stop(ctx.currentTime + startTime + duration)
}

function playChord(ctx, waveform, chord, cutoff, startTime, duration, gainLevel) {
    if (gainLevel === undefined) { gainLevel = 1 }
    chord.forEach(nf => {
        playNote(ctx, waveform, nf, cutoff, startTime, duration, gainLevel/chord.length)
    })
}

function main() {
    const ctx = new AudioContext()

    const chords = [
        [
            notes[4]["C"], notes[4]["E"], notes[4]["A"],
            notes[5]["D"], notes[5]["G"]
        ],
        [
            notes[3]["B"], notes[4]["D#"], notes[4]["A"],
            notes[5]["D"], notes[5]["G"]
        ],
        [
            notes[3]["E"], notes[4]["G"], notes[4]["B"],
            notes[5]["D"], notes[4]["F#"]
        ],
        [
            notes[3]["D"], notes[4]["C"], notes[4]["E"],
            notes[4]["F"], notes[4]["A"]
        ],
    ]
    const startTime = 0.1
    const duration = 2
    const cutoff = notes[4]["C"]
    const numRepeats = 4

    // Play this simple progression 4 times.
    for (let j=0; j<chords.length*numRepeats; j++) {
        let i = j % chords.length 
        let chord = chords[i]

        playChord(ctx, "sawtooth", chord, cutoff, startTime + j*duration, duration*0.98, 0.35) 
        playChord(ctx, "triangle", chord, cutoff, startTime + j*duration, duration*0.98, 0.3) 
        playChord(ctx, "square", chord, cutoff, startTime + j*duration, duration*0.98, 0.2) 
        playChord(ctx, "sine", chord, cutoff, startTime + j*duration, duration*0.98, 0.1) 
    }
}

document.querySelector("#play").addEventListener("click", () => {
    main()
})