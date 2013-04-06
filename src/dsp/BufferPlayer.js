/*!
 * @depends ../core/AudioletNode.js
 */

/**
 * Play the contents of an audio buffer
 *
 * **Inputs**
 *
 * - Playback rate
 * - Restart trigger
 * - Start position
 * - Loop on/off
 *
 * **Outputs**
 *
 * - Audio
 *
 * **Parameters**
 *
 * - playbackRate The rate that the buffer should play at.  Value of 1 plays at
 * the regular rate.  Values > 1 are pitched up.  Values < 1 are pitched down.
 * Linked to input 0.
 * - restartTrigger Changes of value from 0 -> 1 restart the playback from the
 * start position.  Linked to input 1.
 * - startPosition The position at which playback should begin.  Values between
 * 0 (the beginning of the buffer) and 1 (the end of the buffer).  Linked to
 * input 2.
 * - loop Whether the buffer should loop when it reaches the end.  Linked to
 * input 3
 */
var BufferPlayer = AudioletNode.extend({

    parameters: {
        playbackRate: [0, 1],
        restartTrigger: [1, 0],
        startPosition: [2, 0],
        loop: [3, 0]
    },

    /**
     * Constructor
     *
     * @extends AudioletNode
     * @param {Audiolet} audiolet The audiolet object.
     * @param {AudioletBuffer} buffer The buffer to play.
     * @param {Number} [playbackRate=1] The initial playback rate.
     * @param {Number} [startPosition=0] The initial start position.
     * @param {Number} [loop=0] Initial value for whether to loop.
     * @param {Function} [onComplete] Called when the buffer has finished playing.
     */
    constructor: function(audiolet, buffer, playbackRate, startPosition,
                            loop, onComplete) {
        AudioletNode.call(this, audiolet, 3, 1, {
            playbackRate: playbackRate,
            startPosition: startPosition,
            loop: loop
        });
        this.buffer = buffer;
        this.setNumberOfOutputChannels(0, this.buffer.numberOfChannels);
        this.position = startPosition || 0;
        this.onComplete = onComplete;

        this.restartTriggerOn = false;
        this.playing = true;
    },

    /**
     * Process samples
     */
    generate: function() {
        var output = this.outputs[0];

        // Cache local variables
        var numberOfChannels = output.samples.length;

        if (this.buffer.length == 0 || !this.playing) {
            // No buffer data, or not playing, so output zeros and return
            for (var i=0; i<numberOfChannels; i++) {
                output.samples[i] = 0;
            }
            return;
        }

        // Crap load of parameters
        var playbackRate = this.get('playbackRate');
        var restartTrigger = this.get('restartTrigger');
        var startPosition = this.get('startPosition');
        var loop = this.get('loop');

        if (restartTrigger > 0 && !this.restartTriggerOn) {
            // Trigger moved from <=0 to >0, so we restart playback from
            // startPosition
            this.position = startPosition;
            this.restartTriggerOn = true;
            this.playing = true;
        }

        if (restartTrigger <= 0 && this.restartTriggerOn) {
            // Trigger moved back to <= 0
            this.restartTriggerOn = false;
        }

        var numberOfChannels = this.buffer.channels.length;

        for (var i = 0; i < numberOfChannels; i++) {
            var inputChannel = this.buffer.getChannelData(i);
            output.samples[i] = inputChannel[Math.floor(this.position)];
        }
        
        this.position += playbackRate;

        if (this.position >= this.buffer.length) {
            if (loop) {
                // Back to the start
                this.position %= this.buffer.length;
            }
            else {
                // Finish playing until a new restart trigger
                this.playing = false;
                if (this.onComplete) {
                   this.onComplete();
                }
            }
        }
    },

    /**
     * toString
     *
     * @return {String} String representation.
     */
    toString: function() {
        return ('Buffer player');
    }

});