document.addEventListener('DOMContentLoaded', function () {
    
    //define const and variables 
    const waveformSelect = document.getElementById('waveform');
    const modulationSelect = document.getElementById('modulation');
    const filterSelect = document.getElementById('filterType');
    const effectSelect = document.getElementById('effectType');
    const presetSelect = document.getElementById('presetType');

    let selectedPreset = document.getElementById('presetType').value;
    let selectedFilter =  document.getElementById('filterType').value;
    let selectedEffect = document.getElementById('effectType').value;
    let selectedModulationWaveform = document.getElementById('modulation').value;
    let filterSlider = document.getElementById('filterSlider');
    let effectSlider = document.getElementById('effectSlider');
    let gainSlider = document.getElementById('gainSlider');
    let LFOSlider = document.getElementById('LFOSlider');
    const frequencyRange = document.getElementById('FrequencyRange');
    let selectedFrequencyRange = document.getElementById('FrequencyRange').value;
    let volume = 50;
   
    

    // Set boolean variable isSoundEnabled
    let isSoundEnabled = true;

    //create context
    const context = new AudioContext();

    // //creating filters
    let lowPassValue = 20000;
    let highPassValue = 0;
    let lowPassFilter = new Tone.Filter(lowPassValue, "lowpass");
    let highPassFilter = new Tone.Filter(highPassValue, "highpass");

    lowPassFilter.frequency.value = lowPassValue;
     
    highPassFilter.frequency.value = highPassValue;



    //keymap
    const keyMap = {
        z: "C3",
        s: "C#3",
        x: "D3",
        d: "D#3",
        c: "E3",
        v: "F3",
        g: "F#3",
        b: "G3",
        h: "G#3",
        n: "A3",
        j: "A#3",
        m: "B3",

        q: "C4",
        2: "C#4",
        w: "D4",
        3: "D#4",
        e: "E4",
        r: "F4",
        5: "F#4",
        t: "G4",
        6: "G#4",
        y: "A4",
        7: "A#4",
        u: "B4",
        i: "C5",
    };

    // Handle key up events
    document.addEventListener("keyup", function (event) {
        if (!isSoundEnabled) return;
        // map the key to a note
        const note = keyMap[event.key.toLowerCase()];
        if (note) { // check if the unpressed key stop respond to a note 
        synth.triggerRelease();
        const pressedKey = document.querySelector(`[data-note="${note}"]`);
        if (pressedKey) {
            pressedKey.classList.remove("active-keyboard");  // Remove the "active-keyboard" class 
          }
        }
    });

    // Handle key down events
    document.addEventListener("keydown", function (event) {
        if (!isSoundEnabled) return; // Skip playing notes if sound is disabled
        // map the key to a note
        const note = keyMap[event.key.toLowerCase()];
        if (note) { // check if the pressed key respond to a note 
        synth.triggerAttack(note);

        const pressedKey = document.querySelector(`[data-note="${note}"]`);
        if (pressedKey) {
            pressedKey.classList.add("active-keyboard"); // Add the "active-keyboard" class to visually highlight the pressed key
          }
        }
    });

    //define ADSR
    let attackSlider = document.getElementById('attackSlider');
    let releaseSlider = document.getElementById('releaseSlider');
    let decaySlider = document.getElementById('decaySlider');
    let sustainSlider = document.getElementById('sustainSlider');

    //define Modulator (osc2) ADSR
    let MattackSlider = document.getElementById('MattackSlider');
    let MreleaseSlider = document.getElementById('MreleaseSlider');
    let MdecaySlider = document.getElementById('MdecaySlider');
    let MsustainSlider = document.getElementById('MsustainSlider');

    //Define Detune-Harmonicity
    let detuneSlider = document.getElementById('detuneSlider');
    let harmonicitySlider = document.getElementById('harmonicitySlider');
    let detuneValue = 0;
    let harmonicityValue = 1.1;

    // Define ADSR values
    let attackTime = 0.5;
    let realeaseTime = 0.5;
    let decayTime = 0;
    let sustainValue = 0;
    let selectedWaveform = waveformSelect.value;

    let MattackTime = 0.5;
    let MrealeaseTime = 0.5;
    let MdecayTime = 0;
    let MsustainValue = 0;
    

    // Synthesizer 
    const synth = new Tone.FMSynth({
        harmonicity: harmonicityValue,
        modulationIndex: 10,
        detune: detuneValue,
        oscillator: {
            type: selectedWaveform
        },
       envelope: {
            attack: attackTime,
            decay: decayTime,
            sustain: sustainValue,
            release: realeaseTime
        },
        modulation :{
            type: "sawtooth"
        },
        modulationEnvelope: {
            attack:MattackTime,
            decay: MrealeaseTime,
            sustain: MsustainValue,
            release: MdecayTime
        }
    });
    synth.modulation.mute = true;

    //Define Effects
    let delayAmount = 0;
    let delay = new Tone.FeedbackDelay({
            delayTime: 1,
            feedback:0.3,
            wet: delayAmount
        }
    );
    
    let decayAmount = 0;
    let distortionAmount = 0;
    let wahAmount = -40;
    let reverb = new Tone.Reverb(decayAmount);
    let distortion = new Tone.Distortion(distortionAmount);
    const wah = new Tone.AutoWah(7, 8, wahAmount);
    wah.Q.value = 6;

    let lowEnd = 20000;
    let highEnd = 0;
    let lfo = new Tone.LFO(0.08,lowEnd,highEnd);
    lfo.connect(synth.modulation.frequency);
    
    synth.oscillator.connect(lowPassFilter);
    synth.oscillator.connect(highPassFilter);
    synth.connect(wah);
    synth.connect(distortion);
    synth.connect(reverb);
    synth.connect(delay);


    //lfo.toDestination();
    highPassFilter.toDestination();
    lowPassFilter.toDestination();
    wah.toDestination();
    distortion.toDestination();
    reverb.toDestination();
    delay.toDestination();

    // Keys in the piano 
    const keys = document.querySelectorAll("#piano .white-key, #piano .black-key");

    // Click event listeners for each key 
    keys.forEach(key => {
            key.addEventListener("mousedown", () => {
            // Get the note value from the data 
            const note = key.dataset.note;
        
            // Trigger the synthesizer to play the note 
            if (isSoundEnabled) {
                synth.triggerAttack(note);
            }
        });
    
        key.addEventListener("mouseup", () => {
            // Release the note 
            synth.triggerRelease();
        });
    
        // Prevent the default behavior for right-click on the context menu
        key.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    });
    
    // Stop playing notes when the mouse is released 
    document.addEventListener("mouseup", () => {
        synth.triggerRelease();
    });
    
    //  get button element
    const soundToggleButton = document.getElementById("soundToggle");
    
    //  click event listener to the button
    soundToggleButton.addEventListener("click", toggleSound);
    
    // Function to toggle sound on and off
    function toggleSound() {
        isSoundEnabled = !isSoundEnabled;
    
        if (isSoundEnabled) {
            // If sound is enabled, resume the audio 
            Tone.start();
        } else {
            // If sound is disabled, suspend the audio 
            Tone.context.suspend();
            }
    };
    
    //change sliders and options

    //change Gain Slider
    gainSlider.addEventListener('change', function(){
        volume = document.getElementById('gainSlider').value;
        if (volume>0){
            Tone.Master.volume.value = volume/100;
        }
        else{
            Tone.Master.volume.value = volume;
        }
        
        console.log( "volume" +Tone.Master.volume.value );
    });

    //change ADSR sliders
    attackSlider.addEventListener('change', function(){
        attackTime = document.getElementById('attackSlider').value;
        synth.envelope.attack = attackTime/100;
    });

    releaseSlider.addEventListener('change', function(){
        realeaseTime = document.getElementById('releaseSlider').value;
        synth.envelope.release = realeaseTime/100;
    });

    decaySlider.addEventListener('change', function(){
        decayTime = document.getElementById('decaySlider').value;
        synth.envelope.decay = decayTime/100;
    });

    sustainSlider.addEventListener('change', function(){
        sustainValue = document.getElementById('sustainSlider').value;
        synth.envelope.sustain = sustainValue/100;
    });

    //change modulation (osc2) ADSR sliders
    MattackSlider.addEventListener('change', function(){
        MattackTime = document.getElementById('MattackSlider').value;
        synth.modulationEnvelope.attack = MattackTime/100;
    });

    MreleaseSlider.addEventListener('change', function(){
        MrealeaseTime = document.getElementById('MreleaseSlider').value;
        synth.modulationEnvelope.release = MrealeaseTime/100;
    });

    MdecaySlider.addEventListener('change', function(){
        MdecayTime = document.getElementById('MdecaySlider').value;
        synth.modulationEnvelope.decay = MdecayTime/100;
    });

    MsustainSlider.addEventListener('change', function(){
        MsustainValue = document.getElementById('MsustainSlider').value;
        synth.modulationEnvelope.sustain = MsustainValue/100;
    });

    //change detune-harmonicity
    detuneSlider.addEventListener('change', function(){
        detuneValue = document.getElementById('detuneSlider').value;
        synth.detune.value = detuneValue;
    });

    harmonicitySlider.addEventListener('change', function(){
        harmonicityValue = document.getElementById('harmonicitySlider').value;
        synth.harmonicity.value = harmonicityValue;
    });

    //change waveform
    waveformSelect.addEventListener('change', function () {
        selectedWaveform = waveformSelect.value;
        console.log('Επιλέγετε τύπο κύματος:', selectedWaveform);
        synth.oscillator.type = selectedWaveform;
    }); 

    //change Osc2 waveform
    modulationSelect.addEventListener('change', function () {
        selectedModulationWaveform = modulationSelect.value;
        if (selectedModulationWaveform !== "disabled"){
            synth.modulation.mute = false;
            synth.modulation.type = selectedModulationWaveform;
        }
        else{
            synth.modulation.mute = true;
        }
    }); 

    //change filters
    filterSelect.addEventListener('change', function () {
        selectedFilter = filterSelect.value;
        if (selectedFilter == 'lowpass'){
            filterSlider.value = lowPassValue;
        }
        else if (selectedFilter == 'highpass'){
            filterSlider.value = highPassValue;
        }
    });

    //change filter Sliders
    filterSlider.addEventListener('change', function(){
        if (selectedFilter == 'lowpass'){
            lowPassValue = document.getElementById('filterSlider').value;
            lowPassFilter.frequency.value = lowPassValue;
        }
        else if (selectedFilter == 'highpass'){
            highPassValue = document.getElementById('filterSlider').value;
            highPassFilter.frequency.value = highPassValue;
        }

    });


    //change effects
    effectSelect.addEventListener('change', function () {
        selectedEffect = effectSelect.value;
        if (selectedEffect == 'delay'){
            effectSlider.value = delayAmount;
        }
        else if (selectedEffect == 'reverb'){
            effectSlider.value = decayAmount;
        }
        else if (selectedEffect == 'distortion'){
            effectSlider.value = distortionAmount;
        }
        else if (selectedEffect == 'wah'){
            effectSlider.value = wahAmount;
        }
    });

    //change effect Sliders
    effectSlider.addEventListener('change', function(){
        if (selectedEffect == 'delay'){
            delayAmount = document.getElementById('effectSlider').value;
            delay.wet.value = delayAmount/100;
        }
        else if (selectedEffect == 'reverb'){
            decayAmount = document.getElementById('effectSlider').value;
            reverb.decay = decayAmount;
        }
        else if (selectedEffect == 'distortion'){
            distortionAmount = document.getElementById('effectSlider').value;
            distortion.distortion = distortionAmount/10;
        }
        else if (selectedEffect == 'wah'){
            wahAmount = document.getElementById('effectSlider').value;
            wah.sensitivity = wahAmount - 40;
        }

    });

    //change lfo
    frequencyRange.addEventListener('change', function () {
        selectedFrequencyRange = frequencyRange.value;
        if (selectedFrequencyRange == 'lowEnd'){    
            LFOSlider.value = lowEnd;
        }
        else if (selectedFrequencyRange == 'highEnd'){
            LFOSlider.value = highEnd;
        }
    });

    //change lfo Slider
    LFOSlider.addEventListener('change', function(){
        if (selectedFrequencyRange == 'lowEnd'){
            lowEnd = document.getElementById('LFOSlider').value;
            lfo.min = lowEnd;
        }
        else if (selectedFrequencyRange == 'highEnd'){
            highEnd = document.getElementById('LFOSlider').value;
            lfo.max = highEnd;
        }

    });

    presetSelect.addEventListener('change', function () {
        reset();
        selectedPreset = presetSelect.value;
        if (selectedPreset == '808'){
            selectedWaveform = "triangle";
            document.getElementById('waveform').value = "triangle";
            synth.oscillator.type = "triangle";

            synth.envelope.attack = 0;
            document.getElementById('attackSlider').value = 0;
            synth.envelope.release = 0;
            document.getElementById('releaseSlider').value = 0;
            synth.envelope.decay = 0.5;
            document.getElementById('decaySlider').value = 50;

            synth.detune.value = -100;
            document.getElementById('detuneSlider').value = -100;

            distortion.distortion = 13/10;
            distortionAmount = 13;
            document.getElementById('effectType').value = "distortion";
            document.getElementById('effectSlider').value = distortionAmount;
        }
        else if (selectedPreset == 'sub'){
            selectedWaveform = "sine";
            document.getElementById('waveform').value = "sine";
            synth.oscillator.type = "sine";

            synth.envelope.attack = 0.7;
            document.getElementById('attackSlider').value = 70;
            synth.envelope.release = 0.5;
            document.getElementById('releaseSlider').value = 50;
            synth.envelope.decay = 0.2;
            document.getElementById('decaySlider').value = 20;

            lowPassFilter.frequency.value = 0;
            highPassFilter.frequency.value = 17000;
            document.getElementById('filterType').value = "lowpass";
            document.getElementById('filterSlider').value = 0;
            lowPassValue = 0;
            highPassValue = 17000;

            synth.detune.value = -100;
            document.getElementById('detuneSlider').value = -100;
        }
        else if (selectedPreset == 'elPiano1'){
            selectedWaveform = "square";
            document.getElementById('waveform').value = "square";
            synth.oscillator.type = "square";

            document.getElementById('gainSlider').value = -30;
            Tone.Master.volume.value = -30;

            synth.envelope.attack = 0;
            document.getElementById('attackSlider').value = 0;
            synth.envelope.release = 0.2;
            document.getElementById('releaseSlider').value = 20;
            synth.envelope.decay = 0.7;
            document.getElementById('decaySlider').value = 70;

            highPassFilter.frequency.value = 17000;
            highPassValue = 17000;

            document.getElementById('effectType').value = "delay";
            document.getElementById('effectSlider').value = 5;
            delay.wet.value = 0.05;
            delayAmount = 5;
            reverb.decay = 25;
            decayAmount = 25;
        }
        else if (selectedPreset == 'elPiano2'){
            selectedWaveform = "triangle";
            document.getElementById('waveform').value = "triangle";
            synth.oscillator.type = "triangle";

            synth.modulation.mute = false;
            synth.modulation.type = "sine";
            document.getElementById('modulation').value = "sine";

            document.getElementById('gainSlider').value = -30;
            Tone.Master.volume.value = -30;

            synth.envelope.attack = 0;
            document.getElementById('attackSlider').value = 0;
            synth.envelope.release = 0.2;
            document.getElementById('releaseSlider').value = 20;
            synth.envelope.decay = 1;
            document.getElementById('decaySlider').value = 100;

            document.getElementById('MattackSlider').value = 0;
            synth.modulationEnvelope.attack = 0;
            document.getElementById('MreleaseSlider').value = 20;
            synth.modulationEnvelope.release = 0.2;
            document.getElementById('MdecaySlider').value = 100;
            synth.modulationEnvelope.decay = 1;

            highPassFilter.frequency.value = 17000;
            highPassValue = 17000;

            document.getElementById('effectType').value = "delay";
            document.getElementById('effectSlider').value = 5;
            delay.wet.value = 0.05;
            delayAmount = 5;
            reverb.decay = 25;
            decayAmount = 25;
        }
        else if (selectedPreset == 'synth'){
            selectedWaveform = "sawtooth";
            document.getElementById('waveform').value = "sawtooth";
            synth.oscillator.type = "sawtooth";

            synth.modulation.mute = false;
            synth.modulation.type = "sawtooth";
            document.getElementById('modulation').value = "sawtooth";

            document.getElementById('gainSlider').value = -30;
            Tone.Master.volume.value = -30;

            synth.envelope.attack = 0;
            document.getElementById('attackSlider').value = 0;
            synth.envelope.release = 0.2;
            document.getElementById('releaseSlider').value = 20;
            synth.envelope.decay = 0.5;
            document.getElementById('decaySlider').value = 50;
            synth.envelope.sustain = 1;
            document.getElementById('sustainSlider').value = 100;

            document.getElementById('MattackSlider').value = 30;
            synth.modulationEnvelope.attack = 0.3;
            document.getElementById('MreleaseSlider').value = 50;
            synth.modulationEnvelope.release = 0.5;
            document.getElementById('MdecaySlider').value = 50;
            synth.modulationEnvelope.decay = 0.5;
            document.getElementById('MsustainSlider').value = 100;
            synth.modulationEnvelope.sustain = 1;

            lowPassFilter.frequency.value = 6000;
            highPassFilter.frequency.value = 20000;
            document.getElementById('filterType').value = "lowpass";
            document.getElementById('filterSlider').value = 6000;
            lowPassValue = 6000;
            highPassValue = 20000;

            lfo.min = 0;
            lfo.max = 20000;
            document.getElementById('LFOSlider').value = 0;
            lowEnd = 0;
            highEnd = 20000;
        }
        else if (selectedPreset == 'sineWheepy'){
            selectedWaveform = "sine";
            document.getElementById('waveform').value = "sine";
            synth.oscillator.type = "sine";

            synth.modulation.mute = false;
            synth.modulation.type = "sine";
            document.getElementById('modulation').value = "sine";

            document.getElementById('gainSlider').value = -30;
            Tone.Master.volume.value = -30;

            synth.envelope.attack = 0.5;
            document.getElementById('attackSlider').value = 50;
            synth.envelope.release = 0.5;
            document.getElementById('releaseSlider').value = 50;
            synth.envelope.decay = 0.5;
            document.getElementById('decaySlider').value = 50;
            synth.envelope.sustain = 0.9;
            document.getElementById('sustainSlider').value = 90;

            document.getElementById('MattackSlider').value = 50;
            synth.modulationEnvelope.attack = 0.5;
            document.getElementById('MreleaseSlider').value = 50;
            synth.modulationEnvelope.release = 0.5;
            document.getElementById('MdecaySlider').value = 50;
            synth.modulationEnvelope.decay = 0.5;
            document.getElementById('MsustainSlider').value = 90;
            synth.modulationEnvelope.sustain = 0.9;

            lowPassFilter.frequency.value = 500;
            highPassFilter.frequency.value = 18000;
            document.getElementById('filterType').value = "lowpass";
            document.getElementById('filterSlider').value = 500;
            lowPassValue = 500;
            highPassValue = 18000;

            document.getElementById('harmonicitySlider').value = 2.1;
            synth.harmonicity.value = 2.1;
            
            document.getElementById('effectType').value = "reverb";
            document.getElementById('effectSlider').value = 50;
            reverb.decay = 50;
            decayAmount = 50;
        }
        else if (selectedPreset == 'whistle'){
            selectedWaveform = "sine";
            document.getElementById('waveform').value = "sine";
            synth.oscillator.type = "sine";

            synth.modulation.mute = false;
            synth.modulation.type = "sine";
            document.getElementById('modulation').value = "sine";

            document.getElementById('gainSlider').value = -30;
            Tone.Master.volume.value = -30;

            synth.envelope.attack = 0.3;
            document.getElementById('attackSlider').value = 30;
            synth.envelope.release = 0.3;
            document.getElementById('releaseSlider').value = 30;
            synth.envelope.sustain = 1;
            document.getElementById('sustainSlider').value = 100;

            document.getElementById('MattackSlider').value = 30;
            synth.modulationEnvelope.attack = 0.3;
            document.getElementById('MreleaseSlider').value = 30;
            synth.modulationEnvelope.release = 0.3;
            document.getElementById('MsustainSlider').value = 100;
            synth.modulationEnvelope.sustain = 1;

            lowPassFilter.frequency.value = 500;
            highPassFilter.frequency.value = 18000;
            document.getElementById('filterType').value = "lowpass";
            document.getElementById('filterSlider').value = 500;
            lowPassValue = 500;
            highPassValue = 18000;

            document.getElementById('harmonicitySlider').value = 2.1;
            synth.harmonicity.value = 2.1;
            
            document.getElementById('effectType').value = "reverb";
            document.getElementById('effectSlider').value = 50;
            reverb.decay = 50;
            decayAmount = 50;
        }
    }); 


    //  get button element
    const resetValuesButton = document.getElementById("resetValues");
    
    //  click event listener to the button
    resetValuesButton.addEventListener("click", function(){
        reset();

        //reset presets
        document.getElementById('presetType').value = "none";
    });

    // function to reset all the values from options and sliders
    function reset(){

        //reset Gain
        document.getElementById('gainSlider').value = 0;
        Tone.Master.volume.value = 0;

        //reset ADSR
        synth.envelope.attack = 0.5;
        document.getElementById('attackSlider').value = 50;
        synth.envelope.release = 0.5;
        document.getElementById('releaseSlider').value = 50;
        synth.envelope.decay = 0;
        document.getElementById('decaySlider').value = 0;
        synth.envelope.sustain = 0;
        document.getElementById('sustainSlider').value = 0;
        
        //reset OSC2 ADSR
        synth.modulationEnvelope.attack = 0.5;
        document.getElementById('MattackSlider').value = 50;
        synth.modulationEnvelope.release = 0.5;
        document.getElementById('MreleaseSlider').value = 50;
        synth.modulationEnvelope.decay = 0;
        document.getElementById('MdecaySlider').value = 0;
        synth.modulationEnvelope.sustain = 0;
        document.getElementById('MsustainSlider').value = 0;

        //reset detune-harmonicity
        synth.detune.value = 0;
        document.getElementById('detuneSlider').value = 0;
        synth.harmonicity.value = 1.1;
        document.getElementById('harmonicitySlider').value = 1.1;

        //reset waveforms 
        synth.oscillator.type = "sine";
        document.getElementById('waveform').value = "sine";
        synth.modulation.mute = true;
        document.getElementById('modulation').value = "disabled";

        //reset filters
        lowPassFilter.frequency.value = 20000;
        highPassFilter.frequency.value = 0;
        document.getElementById('filterType').value = "lowpass";
        document.getElementById('filterSlider').value = 20000;
        lowPassValue = 20000;
        highPassValue = 0;

        //reset effects
        document.getElementById('effectType').value = "delay";
        document.getElementById('effectSlider').value = 0;
        delay.wet.value = 0;
        reverb.decay = 0.001;
        distortion.distortion = 0;
        wah.sensitivity = 0;
        delayAmount = 0;
        decayAmount = 0;
        distortionAmount = 0;
        wahAmount = -40;

        //reset lfo
        lfo.min = 20000;
        lfo.max = 0;
        document.getElementById('FrequencyRange').value = "lowEnd";
        document.getElementById('LFOSlider').value = 20000;
        lowEnd = 20000;
        highEnd = 0;

    };


});