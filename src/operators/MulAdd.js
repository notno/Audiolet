/*!
 * @depends ../core/AudioletNode.js
 */

/*
 * Multiply and add values
 *
 * **Inputs**
 *
 * - Audio
 * - Multiply audio
 * - Add audio
 *
 * **Outputs**
 *
 * - MulAdded audio
 *
 * **Parameters**
 *
 * - mul The value to multiply by.  Linked to input 1.
 * - add The value to add.  Linked to input 2.
 */
var MulAdd = AudioletNode.extend({

    defaults: {
        mul: [1, 1],
        add: [2, 0]
    },
    
    /**
     * Constructor
     *
     * @extends AudioletNode
     * @param {Audiolet} audiolet The audiolet object.
     * @param {Number} [mul=1] The initial value to multiply by.
     * @param {Number} [add=0] The initial value to add.
     */
    constructor: function(audiolet, mul, add) {
        AudioletNode.call(this, audiolet, 3, 1, {
            mul: mul,
            add: add
        });
        this.linkNumberOfOutputChannels(0, 0);
    },

    /**
     * Process samples
     */
    generate: function() {
        var input = this.inputs[0];
        var output = this.outputs[0];

        var mul = this.get('mul');
        var add = this.get('add');

        var numberOfChannels = input.samples.length;
        for (var i = 0; i < numberOfChannels; i++) {
            output.samples[i] = input.samples[i] * mul + add;
        }
    },

    /**
     * toString
     *
     * @return {String} String representation.
     */
    toString: function() {
        return 'Multiplier/Adder';
    }

});