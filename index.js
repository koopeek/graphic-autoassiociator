
/*
    Implementation of Backpropagation algorithm. Used to make a simple graphic-autoasiociator.
    Made as one of the final tasks for artifical neural network classess at my University.
    Program made by Sławomir Kopaczewski (19.11.2019)
*/

//Map which sotres correct answers
//(used in learning alrorithm)
const pixelData = new Map();

//Network variables
const HIDDEN_LAYERS_AMOUNT      = 3;
const NEURONS_IN_LAYER_AMOUNT   = 32;
const LEARNING_CONST            = 0.1;
const LEARNING_STEPS            = 300000;

//Arrays for layers
let INPUT_DATA      = [];
const HIDDEN_LAYERS = [];
const OUTPUT_LAYER  = [];

class Neuron {
    constructor(weights, x, y, delta) {
        this.weights = [...weights];
        this.delta = 0;
        this.x = 0; //neuron input value
        this.y = 0; //neuron output value (after activation function)
    }

    calculateNeuronOutputValue() {
        this.y = (1 / (1 + Math.exp(this.x * (-1))));
    }

    calculateDeltaForNeuronInOutputLayer(correct_answer) {
        this.delta = (this.y - correct_answer) * (this.y * (1 - this.y));
    }
}

window.onload = function () {
    const canvas    = document.getElementById('canvas');
    const ctx       = canvas.getContext('2d');
    const dog_image = new Image();

    dog_image.onload = function() {
        ctx.drawImage(dog_image, 0, 0, 400, 400);
        //Get correct answers which will be useed in learning
        for (let x = 0; x <= canvas.clientWidth; x++) {
            for (let y = 0; y <= canvas.clientHeight; y++) {
                const data = ctx.getImageData(x, y, 1, 1).data;
                let pixel_info = {
                    R: data[0],
                    G: data[1],
                    B: data[2]
                };
                pixelData.set(`${x}|${y}`, pixel_info);
            }
        }
    };
    dog_image.src = './images/dog.jpg';

    initializeNeuralNetwork();

    const learnButton = document.getElementById('learn');
    const checkButton = document.getElementById('check');

    learnButton.addEventListener('click', () => {
        learnNeuralNetwork();
    });

    checkButton.addEventListener('click', () => {
        checkResultOfLearning();
    });
}

const getRandomWeights = function(quantity) {
    let weights = [];
    //We draw one more weight as weight for bias
    for (let i = 0; i <= quantity; i++) {
        weights[i] = (2 * Math.random()) - 1;
    }
    return weights;
}

const initializeNeuralNetwork = function() {
    //Initialize hidden layers
    for (let h = 0; h < HIDDEN_LAYERS_AMOUNT; h++) {
        let temp_layer = [];
        for (let j = 0; j < NEURONS_IN_LAYER_AMOUNT; j++) {
            if (h === 0) {
                temp_layer.push(new Neuron(getRandomWeights(10), 0.0, 0.0, 0.0));
            } else {
                temp_layer.push(new Neuron(getRandomWeights(NEURONS_IN_LAYER_AMOUNT), 0.0, 0.0, 0.0));
            }
        }
        HIDDEN_LAYERS.push(temp_layer);
    }

    //Initialize output layer which contains 3 neurons for R, G, B
    OUTPUT_LAYER.push(new Neuron(getRandomWeights(NEURONS_IN_LAYER_AMOUNT), 0.0, 0.0, 0.0));
    OUTPUT_LAYER.push(new Neuron(getRandomWeights(NEURONS_IN_LAYER_AMOUNT), 0.0, 0.0, 0.0));
    OUTPUT_LAYER.push(new Neuron(getRandomWeights(NEURONS_IN_LAYER_AMOUNT), 0.0, 0.0, 0.0));
}

const getMultiplicationResult = function(weights, values) {
    var result = 0.0;
    for (let i = 0; i < weights.length; i++) {
        result += (weights[i] * values[i]);
    }
    return (result);
}

const reduceRangeOfValue = function(value) {
    return (((value / 255) * 0.8) + 0.1);
}

const runForwardNetworkTransition = function(x, y) {

    const refactored_x = (x / 200) - 1;
    const refactored_y = (y / 200) - 1;

    INPUT_DATA = new Array(refactored_x, refactored_y);

    for (let i = 1; i <= 4; i++) {
        INPUT_DATA.push(Math.sin(i * (x /400) * 2 * Math.PI));
        INPUT_DATA.push(Math.sin(i * (y /400) * 2 * Math.PI));
    }

    //Bias
    INPUT_DATA.push(1);

    //Calculation of entry and output value for all neurons in all hidden layers
    for (let i = 0; i < HIDDEN_LAYERS.length; i++) {
        if (i === 0) {
            for (let j = 0; j < NEURONS_IN_LAYER_AMOUNT; j++) {
                HIDDEN_LAYERS[i][j].x = getMultiplicationResult(HIDDEN_LAYERS[i][j].weights, INPUT_DATA);
                HIDDEN_LAYERS[i][j].calculateNeuronOutputValue();
            }
        } else {
            let outputValuesFromPreviousLayerNeurons = [];
            for (let n = 0; n < HIDDEN_LAYERS[i - 1].length; n++) {
                outputValuesFromPreviousLayerNeurons.push(HIDDEN_LAYERS[i - 1][n].y);
            }
            outputValuesFromPreviousLayerNeurons.push(1);

            for (let p = 0; p < NEURONS_IN_LAYER_AMOUNT; p++) {
                HIDDEN_LAYERS[i][p].x = getMultiplicationResult(HIDDEN_LAYERS[i][p].weights, outputValuesFromPreviousLayerNeurons);
                HIDDEN_LAYERS[i][p].calculateNeuronOutputValue();
            }
        }
    }

    //Calculation of entry and output value for all neurons in output layer
    let outputValuesFromPreviousLayerNeurons = [];
    for (let i = 0; i < HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1].length; i++) {
        outputValuesFromPreviousLayerNeurons.push(HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1][i].y);
    }
    outputValuesFromPreviousLayerNeurons.push(1);

    for (let i = 0; i < OUTPUT_LAYER.length; i++) {
        OUTPUT_LAYER[i].x = getMultiplicationResult(OUTPUT_LAYER[i].weights, outputValuesFromPreviousLayerNeurons);
        OUTPUT_LAYER[i].calculateNeuronOutputValue();
    }
}

const learnNeuralNetwork = function() {
    for (let i = 0; i < LEARNING_STEPS; i++) {
        //Get random x,y from image
        const x = Math.floor(Math.random() * 401);
        const y = Math.floor(Math.random() * 401);

        runForwardNetworkTransition(x, y);

        const correct_RGB = pixelData.get(`${x}|${y}`);

        //Backward network transition and delta calculation
        OUTPUT_LAYER[0].calculateDeltaForNeuronInOutputLayer(reduceRangeOfValue(correct_RGB.R));
        OUTPUT_LAYER[1].calculateDeltaForNeuronInOutputLayer(reduceRangeOfValue(correct_RGB.G));
        OUTPUT_LAYER[2].calculateDeltaForNeuronInOutputLayer(reduceRangeOfValue(correct_RGB.B));

        for (let i = HIDDEN_LAYERS_AMOUNT - 1; i >= 0; i--) {
            for (let j = 0; j < NEURONS_IN_LAYER_AMOUNT; j++) {
                if (i === (HIDDEN_LAYERS_AMOUNT - 1)) {
                    let temp_value = 0.0;
                    for (let k = 0; k < 3; k++) {
                        temp_value += (OUTPUT_LAYER[k].delta * OUTPUT_LAYER[k].weights[j]);
                    }
                    HIDDEN_LAYERS[i][j].delta = temp_value *  HIDDEN_LAYERS[i][j].y * (1 - HIDDEN_LAYERS[i][j].y);
                } else {
                    let temp_value = 0.0;
                    for (let f = 0; f < NEURONS_IN_LAYER_AMOUNT.length; f++) {
                        temp_value += (HIDDEN_LAYERS[i + 1][f].delta * HIDDEN_LAYERS[i + 1][f].weights[j]);
                    }
                    HIDDEN_LAYERS[i][j].delta = temp_value *  HIDDEN_LAYERS[i][j].y * (1 - HIDDEN_LAYERS[i][j].y);
                }
            }
        }

        //Updade of weights of all neurons in hidden layers
        for (let i = 0; i < HIDDEN_LAYERS_AMOUNT; i++) {
            for (let j = 0; j < NEURONS_IN_LAYER_AMOUNT; j++) {
                for (let k = 0; k < HIDDEN_LAYERS[i][j].weights.length; k++) {
                    if (i === 0) {
                        HIDDEN_LAYERS[i][j].weights[k] = HIDDEN_LAYERS[i][j].weights[k] - (LEARNING_CONST * HIDDEN_LAYERS[i][j].delta * INPUT_DATA[k]);
                    } else {
                        if (HIDDEN_LAYERS[i - 1][k] !== undefined) {
                            HIDDEN_LAYERS[i][j].weights[k] = HIDDEN_LAYERS[i][j].weights[k] - (LEARNING_CONST * HIDDEN_LAYERS[i][j].delta * HIDDEN_LAYERS[i - 1][k].y);
                        } else {
                            HIDDEN_LAYERS[i][j].weights[k] = HIDDEN_LAYERS[i][j].weights[k] - (LEARNING_CONST * HIDDEN_LAYERS[i][j].delta * 1);
                        }
                    }
                }
            }
        }
        
        //Update of all weights of neurons in output layer
        for (let i = 0; i < OUTPUT_LAYER.length; i++) {
            for (let j = 0; j < OUTPUT_LAYER[i].weights.length; j++) {
                if (HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1][j] !== undefined) {
                    OUTPUT_LAYER[i].weights[j] = OUTPUT_LAYER[i].weights[j] - (LEARNING_CONST * OUTPUT_LAYER[i].delta * HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1][j].y);
                } else {
                    OUTPUT_LAYER[i].weights[j] = OUTPUT_LAYER[i].weights[j] - (LEARNING_CONST * OUTPUT_LAYER[i].delta * 1);
                }
            }
        }
    }
}

const checkResultOfLearning = function() {
    let ctx = document.getElementById('canvas-result').getContext('2d');

    for (let x = 0; x <= 400; x++) {
        for (let y = 0; y <= 400; y++) {

            runForwardNetworkTransition(x, y);

            const temp_R = (((255 * OUTPUT_LAYER[0].y) - 25.5) / 0.8);
            const temp_G = (((255 * OUTPUT_LAYER[1].y) - 25.5) / 0.8);
            const temp_B = (((255 * OUTPUT_LAYER[2].y) - 25.5) / 0.8);
            
            ctx.fillStyle = "rgb(" + temp_R + ", " + temp_G + ", " + temp_B + ")";
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

