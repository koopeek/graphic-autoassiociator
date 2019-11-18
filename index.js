
const pixelData                 = new Map();
const HIDDEN_LAYERS_AMOUNT      = 3;
const NEURONS_IN_LAYER_AMOUNT   = 4;
const LEARNING_CONST            = 0.01;

const HIDDEN_LAYERS     = [];
const OUTPUT_LAYER      = [];

class Neuron {

    constructor(weights, x, y, delta) {
        this.weights = [...weights];
        this.x = 0;
        this.y = 0;
        this.delta = 0;
    }

    calculateNeuronOutputValue() {
        this.y = (1 / (1 + Math.exp(this.x * (-1))));
    }

    calculateNeuronOutputValueInOutputLayer() {
        this.y = (1 / (1 + Math.exp(this.x * (-1))));
        this.y = (((255 * this.y) - 25.5) / 0.8);
    }

    getDeltaForOutputLayer(correct_answer) {
        this.delta = (this.y - correct_answer) * (this.y * (1 - this.y));
    }
}

window.onload = function () {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let dog_image = new Image();
    dog_image.onload = function() {
        ctx.drawImage(dog_image, 0, 0, 400, 400);
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
    dog_image.src = './dog.jpg';

    initializeNet();

    const buttom = document.getElementById('learn');
    buttom.addEventListener('click', () => {
        setInterval(function() {
            make();
        }, 1000);
    });
}

const getRandosWeights = function(amount) {
    let weights = [];
    for (let i = 0; i <= amount; i++) {
        weights[i] = (2 * Math.random()) - 1;
    }
    return weights;
}

const initializeNet = function() {

    //Warstwy ukryte
    for (let h = 0; h < HIDDEN_LAYERS_AMOUNT; h++) {
        let new_layer = [];
        for (let j = 0; j < NEURONS_IN_LAYER_AMOUNT; j++) {

            if (h === 0) {
                new_layer.push(new Neuron(getRandosWeights(2), 0.0, 0.0, 0.0));
            } else {
                new_layer.push(new Neuron(getRandosWeights(NEURONS_IN_LAYER_AMOUNT), 0.0, 0.0, 0.0));
            }

        }
        HIDDEN_LAYERS.push(new_layer);
    }

    //Warstwa wyjściowa
    OUTPUT_LAYER.push(new Neuron(getRandosWeights(NEURONS_IN_LAYER_AMOUNT), 0.0, 0.0, 0.0));
    OUTPUT_LAYER.push(new Neuron(getRandosWeights(NEURONS_IN_LAYER_AMOUNT), 0.0, 0.0, 0.0));
    OUTPUT_LAYER.push(new Neuron(getRandosWeights(NEURONS_IN_LAYER_AMOUNT), 0.0, 0.0, 0.0));
}

const getMultiplicationResult = function(weights, values) {
    var result = 0.0;
    for (let i = 0; i < weights.length; i++) {
        result += weights[i] * values[i];
    }
    return (result);
}

const changeValueScope = function(value) {
    return (((value / 255) * 0.8) + 0.1);
}

const make = function() {

    let canvas = document.getElementById('canvas-result');
    let ctx = canvas.getContext('2d');

    for (let i = 0; i < 100000; i++) {

        //Losowanie punktu x,y
        const x = Math.floor(Math.random() * 401);
        const y = Math.floor(Math.random() * 401);

        //Pobranie przykladu i prawidlowej odpowiedzi z oryginalnego obrazka
        const correct_RGB = pixelData.get(`${x}|${y}`);

        //Przejscie sieci w przod
        const refactored_x    = (x / 200) - 1;
        const refactored_y    = (y / 200) - 1;
        const INPUT_DATA      = new Array(refactored_x, refactored_y, 1);

        //Warstwy ukryte
        for (let i = 0; i < HIDDEN_LAYERS.length; i++) {
            if (i === 0) {
                //Pierwsza warstwa ukryta
                for (let j = 0; j < NEURONS_IN_LAYER_AMOUNT; j++) {
                    HIDDEN_LAYERS[i][j].x = getMultiplicationResult(HIDDEN_LAYERS[i][j].weights, INPUT_DATA);
                    HIDDEN_LAYERS[i][j].calculateNeuronOutputValue();
                }
            } else {
                let previousLayer_in = [];
                for (let n = 0; n < HIDDEN_LAYERS[i - 1].length; n++) {
                    previousLayer_in.push(HIDDEN_LAYERS[i - 1][n].x);
                }
                previousLayer_in.push(1);

                for (let p = 0; p < NEURONS_IN_LAYER_AMOUNT; p++) {
                    HIDDEN_LAYERS[i][p].x = getMultiplicationResult(HIDDEN_LAYERS[i][p].weights, previousLayer_in);
                    HIDDEN_LAYERS[i][p].calculateNeuronOutputValue();
                }
            }
        }

        //Suma wejscia dla warstwy wyjsciowej
        let lastHiddenLayer_out = [];
        for (let i = 0; i < HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1].length; i++) {
            lastHiddenLayer_out.push( HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1][i].y);
        }
        lastHiddenLayer_out.push(1);

        for (let i = 0; i < OUTPUT_LAYER.length; i++) {
            OUTPUT_LAYER[i].x = getMultiplicationResult(OUTPUT_LAYER[i].weights, lastHiddenLayer_out);
            OUTPUT_LAYER[i].calculateNeuronOutputValueInOutputLayer();
        }

        //Przejscie sieci w tył
        OUTPUT_LAYER[0].getDeltaForOutputLayer(changeValueScope(correct_RGB.R));
        OUTPUT_LAYER[1].getDeltaForOutputLayer(changeValueScope(correct_RGB.R));
        OUTPUT_LAYER[2].getDeltaForOutputLayer(changeValueScope(correct_RGB.R));

        for (let i = HIDDEN_LAYERS_AMOUNT - 1; i >= 0; i--) {
            for (let j = 0; j < NEURONS_IN_LAYER_AMOUNT; j++) {

                if (i === (HIDDEN_LAYERS_AMOUNT - 1)) {
                    //Ostatnia ukryta wiec bierzemy z wyjsciowej
                    let tmp_value = 0.0;
                    for (let k = 0; k < 3; k++) {
                        tmp_value += OUTPUT_LAYER[k].delta * OUTPUT_LAYER[k].weights[j];
                    }
                    HIDDEN_LAYERS[i][j].delta = tmp_value *  HIDDEN_LAYERS[i][j].y * (1 - HIDDEN_LAYERS[i][j].y);

                } else {
                    
                    let tmp_value = 0.0;
                    for (let f = 0; f < NEURONS_IN_LAYER_AMOUNT.length; f++) {
                        tmp_value += HIDDEN_LAYERS[i + 1].delta * HIDDEN_LAYERS[i + 1].weights[j];
                    }
                    HIDDEN_LAYERS[i][j].delta = tmp_value *  HIDDEN_LAYERS[i][j].y * (1 - HIDDEN_LAYERS[i][j].y);
                }
              
            }
        }

        for (let i = 0; i < HIDDEN_LAYERS_AMOUNT; i++) {
            for (let j = 0; j < NEURONS_IN_LAYER_AMOUNT; j++) {
                for (let k = 0; k < HIDDEN_LAYERS[i][j].weights.length; k++) {
                    if (i === 0) {
                        HIDDEN_LAYERS[i][j].weights[k] = HIDDEN_LAYERS[i][j].weights[k] - (LEARNING_CONST * HIDDEN_LAYERS[i][j].delta * INPUT_DATA[k]);
                    } else {
                        HIDDEN_LAYERS[i][j].weights[k] = HIDDEN_LAYERS[i][j].weights[k] - (LEARNING_CONST * HIDDEN_LAYERS[i][j].delta * HIDDEN_LAYERS[i - 1][j].y);
                    }
                }
            }
        }
    
        for (let i = 0; i < OUTPUT_LAYER.length; i++) {
            for (let j = 0; j < OUTPUT_LAYER[i].weights.length; j++) {
                if (HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1][j] !== undefined) {
                    OUTPUT_LAYER[i].weights[j] = OUTPUT_LAYER[i].weights[j] - (LEARNING_CONST * OUTPUT_LAYER[i].delta * HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1][j].y);
                } else {
                    OUTPUT_LAYER[i].weights[j] = OUTPUT_LAYER[i].weights[j] - (LEARNING_CONST * OUTPUT_LAYER[i].delta * 1);
                }
            }
        }

        ctx.fillStyle = "rgb(" + OUTPUT_LAYER[0].y + ", " + OUTPUT_LAYER[1].y + ", " + OUTPUT_LAYER[2].y + ")";
        ctx.fillRect(x, y, 1, 1);
    }

    console.log(HIDDEN_LAYERS);
    console.log(OUTPUT_LAYER);
}

