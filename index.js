
let pixelData = new Map();

const HIDDEN_LAYERS_AMOUNT     = 3;
const NEURONS_IN_LAYER_AMOUNT  = 4;
const LEARNING_CONST           = 0.01;


const INPUT_LAYER   = [];
const HIDDEN_LAYERS = [];
const OUTPUT_LAYER  = [];

class Neuron {

    constructor(weights, x, y, delta) {
        this.weights = [...weights];
        this.x = 0;
        this.y = 0;
        this.delta = 0;
    }

    getValueAfterActivationFunc() {
        this.y = (1 / (1 + Math.exp(this.x * (-1)))); 
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
        make();
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
    //Warstwa wejsciowa
    INPUT_LAYER.push(new Neuron(getRandosWeights(NEURONS_IN_LAYER_AMOUNT), 0.0, 0.0, 0.0));
    INPUT_LAYER.push(new Neuron(getRandosWeights(NEURONS_IN_LAYER_AMOUNT), 0.0, 0.0, 0.0));

    //Warstwy ukryte
    for (let h = 0; h < HIDDEN_LAYERS_AMOUNT; h++) {
        let new_layer = [];
        for (let j = 0; j < NEURONS_IN_LAYER_AMOUNT; j++) {

            if (h === 0) {
                new_layer.push(new Neuron(getRandosWeights(INPUT_LAYER.length), 0.0, 0.0, 0.0));
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


const getEntryValueForFirstHiddenLayer = function(weights) {
    var result = 0.0;
    for (let i = 0; i < weights.length; i++) {
        if (INPUT_LAYER[i] !== undefined) {
            result += weights[i] * INPUT_LAYER[i].x;
        } else {
            result += weights[i] * 1;
        }
    
    }
    return result;
}

const getEntryValueForHiddenNeuron = function(weights, out_values) {
    let result = 0.0;
    for (let i = 0; i < weights.length; i++) {
        result += weights[i] * out_values[i];
    }
    return result;
}

const make = function() {

    let canvas = document.getElementById('canvas-result');
    let ctx = canvas.getContext('2d');

    for (let i = 0; i < 1000000; i++) {

        //Losowanie punktu x,y
        const x = Math.floor(Math.random() * 401);
        const y = Math.floor(Math.random() * 401);

        //Pobranie przykladu i prawidlowej odpowiedzi z oryginalnego obrazka
        const dataFromWiadomo = pixelData.get(`${x}|${y}`);

        //Przejscie sieci w przod 

        //Dla warstwy wejsciowej:
        //Neuron x
        INPUT_LAYER[0].x = x;
        INPUT_LAYER[0].y = x;

        //Neuron y
        INPUT_LAYER[1].x = y;
        INPUT_LAYER[1].y = y;

        //Warstwy ukryte

        //Dla pierwszej
        let tmp_first_hidden_layer_neurons = HIDDEN_LAYERS[0];
        for (let j = 0; j < NEURONS_IN_LAYER_AMOUNT; j++) {
            tmp_first_hidden_layer_neurons[j].x = getEntryValueForFirstHiddenLayer(tmp_first_hidden_layer_neurons[j].weights);
            tmp_first_hidden_layer_neurons[j].getValueAfterActivationFunc();
        }

        //Dla pozostałych
        for (let k = 1; k < HIDDEN_LAYERS.length; k++) {

            let previousLayer_in = [];
            for (let b = 0; b < HIDDEN_LAYERS[k-1].length; b++) {
                previousLayer_in.push(HIDDEN_LAYERS[k-1][b].x);
            }
            previousLayer_in.push(1);

            let tmp_layer  = HIDDEN_LAYERS[k];

            for (let p = 0; p < NEURONS_IN_LAYER_AMOUNT; p++) {
                tmp_layer[p].x = getEntryValueForHiddenNeuron(tmp_layer[p].weights, previousLayer_in);
                tmp_layer[p].getValueAfterActivationFunc();
            }
        }

        //Suma wejscia dla warstwy wyjsciowej
        let lastHiddenLayer_out = [];
        for (let lh = 0; lh < HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1].length; lh++) {
            lastHiddenLayer_out.push( HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1][lh].y);
        }
        lastHiddenLayer_out.push(1);

        for (let o = 0; o < OUTPUT_LAYER.length; o++) {
            OUTPUT_LAYER[o].x = getEntryValueForHiddenNeuron(OUTPUT_LAYER[o].weights, lastHiddenLayer_out);
            OUTPUT_LAYER[o].getValueAfterActivationFunc();
        }

        //Przejscie sieci w tył

        OUTPUT_LAYER[0].getDeltaForOutputLayer(dataFromWiadomo.R);
        OUTPUT_LAYER[1].getDeltaForOutputLayer(dataFromWiadomo.G);
        OUTPUT_LAYER[2].getDeltaForOutputLayer(dataFromWiadomo.B);


        //TODO: Wagi braz z poprzedniej warstwy czy z obecnej kla ktorej luczymy delte
        for (let d = HIDDEN_LAYERS_AMOUNT - 1; d >= 0; d--) {
            for (let ne = 0; ne < NEURONS_IN_LAYER_AMOUNT; ne++) {

                
                if (d === (HIDDEN_LAYERS_AMOUNT - 1)) {
                    //Ostatnia ukryta wiec wierzemy z wyjsciowej

                    let tmp_value = 0.0;
                    for (let f = 0; f < 3; f++) {
                        tmp_value += OUTPUT_LAYER[f].delta * OUTPUT_LAYER[f].weights[ne];
                    }

                    HIDDEN_LAYERS[d][ne].delta = tmp_value *  HIDDEN_LAYERS[d][ne].y * (1 - HIDDEN_LAYERS[d][ne].y);
                } else {
                    
                    let tmp_value = 0.0;
                    for (let f = 0; f < NEURONS_IN_LAYER_AMOUNT.length; f++) {
                        tmp_value += HIDDEN_LAYERS[d + 1].delta * HIDDEN_LAYERS[d + 1].weights[ne];
                    }

                    HIDDEN_LAYERS[d][ne].delta = tmp_value *  HIDDEN_LAYERS[d][ne].y * (1 - HIDDEN_LAYERS[d][ne].y);
                }
              
            }
        }


        //Poprawienie wag ========

        //Dla warstwy wyjsciowej
        for (let op = 0; op < 3; op++) {
            for (let we = 0; we < OUTPUT_LAYER[op].weights.length; we++) {
                OUTPUT_LAYER[op].weights[we] = OUTPUT_LAYER[op].weights[we] - (LEARNING_CONST * OUTPUT_LAYER[op].delta * HIDDEN_LAYERS[HIDDEN_LAYERS_AMOUNT - 1][we].y);
            }
        }
       
        for (let hd = 0; hd < HIDDEN_LAYERS_AMOUNT; hd++) {
            if (hd === 0) {
                //TODO: Obliczanei wag w pierwszej ukrytej
                // for (let we = 0; we < HIDDEN_LAYERS[hd].weights.length; we++) {
                //     HIDDEN_LAYERS[hd].weights[we] = HIDDEN_LAYERS[hd].weights[we] - (LEARNING_CONST * HIDDEN_LAYERS[hd].delta * INPUT_LAYER[we].x);
                // }
            } else {
                for (let we = 0; we < HIDDEN_LAYERS[hd].weights.length; we++) {
                    HIDDEN_LAYERS[hd].weights[we] = HIDDEN_LAYERS[hd].weights[we] - (LEARNING_CONST * HIDDEN_LAYERS[hd].delta * HIDDEN_LAYERS[hd - 1][we].x);
                }
            }
        }


        ctx.fillStyle = "rgb(" + OUTPUT_LAYER[0].y + ", " + OUTPUT_LAYER[1].y + ", " + OUTPUT_LAYER[2].y + ")";
        ctx.fillRect(x, y, 1, 1);
    }

    console.log(INPUT_LAYER);
    console.log(HIDDEN_LAYERS);
    console.log(OUTPUT_LAYER);

}

