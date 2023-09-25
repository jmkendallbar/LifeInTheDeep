/**
 * optimize the animation - shim requestAnimFrame for animating playback
 */
export function initializeSpectrogram(data) {
    // Create a new Spectrogram instance using the provided data
    new Spectrogram(data, "#vis", {
        width: 1600,
        height: 200,
        sampleSize: 512,
        colorScheme: ['#440154', '#472877', '#3e4a89', '#31688d', '#26838e', '#1f9e89', '#36b778', '#6dcd59', '#b4dd2c', '#fde725']
    });

    // You can now work with the 'sample' Spectrogram instance
}

window.requestAnimFrame = window.requestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
};


function Spectrogram(seal, selector, options = {}) {
    this.options = options;

    var SMOOTHING = 0.0;
    var FFT_SIZE = 2048;

    // this.sampleRate = 256;
    this.sampleRate = options.sampleSize || 512;
    this.decRange = [-80, 80.0];

    this.width = options.width || 900;
    this.height = options.height || 440;
    this.margin = options.margin || {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };

    this.colorScheme = options.colorScheme || ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'];
    this.zoomScale = 1;

    this.selector = selector;
    this.seal = seal;

    // Create a ScriptProcessorNode with a bufferSize of this.sampleRate and a single input and output channel

    this.freqs = new Uint8Array(FFT_SIZE / 2);
    this.data = [];
    this.JSONdata = [];

    this.isPlaying = false;
    this.isLoaded = false;
    this.startTime = 0;
    this.count = 0;
    this.curSec = 0;
    this.maxCount = 0;

    loadJsons(this, this.seal
        , this.setupVisual.bind(this));
}


function loadJsons(obj, jsonData, callback) {
    // Initialize a count to keep track of mapped data points
    let mappedCount = 0;

    // Map the JSON data to the required format
    obj.JSONdata = jsonData.map(dataPoint => {
        // Perform the mapping operation
        const mappedData = {
            key: parseInt(dataPoint["Seconds"]),
            values: parseInt(dataPoint["Low_Frequency"])
        };

        // Check if the mapping was successful
        if (mappedData.key !== undefined && mappedData.values !== undefined) {
            mappedCount++; // Increment the count for successfully mapped data
        }

        return mappedData;
    });

    // Check if all data points have been successfully mapped
    if (mappedCount === jsonData.length) {
        // Call the callback function when all data is mapped
        callback();
    }
}


Spectrogram.prototype.process = function () {
    if (this.isPlaying && !this.isLoaded) {
        // Assuming your JSON data is sorted by "Seconds"
        if (this.count < this.JSONdata.length) {
            for (const obj of this.JSONdata) {

                // const dataPoint = this.data[this.count];
                this.curSec = obj.key;
                const frequencyData = this.generateSineWave(obj.values);
                console.log("maxxxx", Math.max(...frequencyData));
                // You may need to adapt the following line based on your needs
                // For example, you can calculate the FFT from the frequency data
                // and update this.freqs accordingly
                // this.analyser.getByteFrequencyData(this.freqs);

                var d = {
                    'key': this.curSec,
                    'values': new Uint8Array(frequencyData) // Use the frequency data from the JSON
                };
                console.log(d);
                this.data.push(d);
                // console.log(this.count, "hhhh");
                this.count += 1;
            }
        }

        if (this.count >= this.data.length) {
            this.draw();
            this.stop();
            this.isLoaded = true;
            // console.log(this.data.length);
            // console.log(this.data[0].values.length);
        }
    }
};

Spectrogram.prototype.generateSineWave = function (frequency) {
    console.log();
    // Calculate the number of samples needed (1024 in this case)
    const numSamples = 1024;

    // Create a Uint8Array to store the waveform data
    const audioData = new Uint8Array(numSamples);
    console.log("this.sampleRate", this.sampleRate);
    // Calculate the angular frequency (in radians per sample)
    const angularFrequency = (2 * Math.PI * frequency) / this.sampleRate;

    // Generate the sine wave data
    for (let i = 0; i < numSamples; i++) {
        const sampleValue = Math.sin(angularFrequency * i);
        const uint8Value = Math.floor((sampleValue + 1) * 128); // Convert from [-1, 1] to [0, 255]
        audioData[i] = uint8Value;
    }

    return audioData;
}


Spectrogram.prototype.setupVisual = function () {
    // console.log(this.context.sampleRate);
    let that = this;
    // can configure these from the options
    this.timeRange = [parseInt(d3.min(this.JSONdata, d => d.key)), parseInt(d3.max(this.JSONdata, d => d.key))];
    console.log(this.timeRange);
    // this.freqRange = [parseInt(d3.min(this.JSONdata, d => d.values)), parseInt(d3.max(this.JSONdata, d => d.values))];
    this.freqRange = [0, 1000]
    // // zoom the x-axis and the scale of the canvas
    this.zoom = d3.zoom()
        .scaleExtent([1, parseInt(this.timeRange[1])])
        .translateExtent([
            [0, 0],
            [this.width, this.height]
        ])
        .extent([
            [0, 0],
            [this.width, this.height]
        ]).on('zoom', function () {
            that.zoomScale = d3.event.transform.k;
            that.xScale = d3.event.transform.rescaleX(that.orgXScale);
            that.gX.call(that.xAxis.scale(that.xScale));
            that.draw();
        });

    this.canvas = d3.select(this.selector)
        .append('canvas')
        .attr('class', 'vis_canvas')
        .attr('width', this.width)
        .attr('height', this.height)
        .style('padding', d3.map(this.margin).values().join('px ') + 'px');

    this.svg = d3.select(this.selector)
        .append('svg')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
        // .call(this.zoom)
        .append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // loading spinner
    // this.spinner = this.svg.append('g')
    //     .attr('transform', 'translate(' + (this.width / 2) + ',' + (this.height / 2) + ')')
    //     .html('<path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946   s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634   c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/> <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0   C22.32,8.481,24.301,9.057,26.013,10.047z"> <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.5s" repeatCount="indefinite"/></path>');

    this.progressLine = this.svg.append('line')
        .attr('id', 'progress-line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', this.height);

    this.playButton = d3.select(this.selector)
        .append('button')
        .style('margin-top', this.height + this.margin.top + this.margin.bottom + 20 + 'px')
        .text('Play')
        .on('click', function () {
            that.play();
        });

    // this.pauseButton = d3.select(this.selector)
    //     .append('button')
    //     .style('margin-top', this.height + this.margin.top + this.margin.bottom + 20 + 'px')
    //     .text('Pause')
    //     .on('click', function () {
    //         that.pauseResume();
    //     });

    // this.stopButton = d3.select(this.selector)
    //     .append('button')
    //     .style('margin-top', this.height + this.margin.top + this.margin.bottom + 20 + 'px')
    //     .text('Stop')
    //     .on('click', function () {
    //         that.stop();
    //     });

    // let freqs = [];
    // for (let i = 64; i < this.FFT_SIZE; i += 64) {
    //     freqs.push(this.getBinFrequency(i).toFixed(4));
    // }

    // this.freqSelect = d3.select(this.selector)
    //     .append('select')
    //     .style('margin-top', this.height + this.margin.top + this.margin.bottom + 20 + 'px')
    //     .style('margin-left', '20px')
    //     .on('change', function () {
    //         var newFreq = this.options[this.selectedIndex].value;
    //         // console.log(newFreq);
    //         that.yScale.domain([0, newFreq]);
    //         that.draw();
    //     });

    // this.freqSelect.selectAll('option')
    //     .data(freqs)
    //     .enter()
    //     .append('option')
    //     .attr('value', function (d) {
    //         return d;
    //     })
    //     .attr('selected', function (d) {
    //         return (d == 22500) ? 'selected' : null;
    //     })
    //     .text(function (d) {
    //         return Math.round(d / 1000) + 'k';
    //     });

    this.maxCount = this.data.length;

    // original x scale
    this.orgXScale = d3.scaleLinear()
        .domain(this.timeRange)
        .range([0, this.width]);

    // needed for the zoom function
    this.xScale = this.orgXScale;

    this.yScale = d3.scaleLinear()
        .domain(this.freqRange)
        .range([this.height, 0]);

    this.zScale = d3.scaleQuantize()
        .domain(this.decRange)
        .range(this.colorScheme);

    var commasFormatter = d3.format(',.2f');
    this.xAxis = d3.axisBottom(this.xScale)
        .tickSize(-this.height - 15)
        .tickPadding(10)
        .tickFormat(function (d) {
            return commasFormatter(d) + 's';
        });

    this.yAxis = d3.axisLeft(this.yScale)
        .tickSize(-this.width - 10, 0, 0)
        .tickPadding(10)
        .tickFormat(function (d) {
            return (d / 1000).toFixed(1) + 'k';
        });

    this.gX = this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (this.height) + ')')
        .call(this.xAxis);

    this.svg.append('g')
        .attr('class', 'y axis')
        // .attr('transform', 'translate(0,0)')
        .call(this.yAxis);
    console.log("setUP is done");
    this.play();
};

Spectrogram.prototype.play = function () {
    // this.playButton.attr('disabled', true);
    if (this.isLoaded) {
        // this.volume.gain.value = 1;
        window.requestAnimFrame(this.showProgress.bind(this));
    }
    console.log(this.isLoaded);

    // this.startTime = this.context.currentTime;
    this.count = 0;
    this.curSec = 0;
    this.curDuration = 0;

    this.process()

    // Calculate the time range for JSON data playback
    const startTime = this.JSONdata[0].key; // Start time from the JSON data
    const endTime = this.JSONdata[this.JSONdata.length - 1].key; // End time from the JSON data

    // Adjust the progress line animation
    if (this.isLoaded) {
        this.progressLine
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y2', this.height)
            .transition() // apply a transition
            .ease(d3.easeLinear)
            .duration((endTime - startTime) * 1000) // Convert to milliseconds
            .attr('x1', this.width)
            .attr('x2', this.width)
            .attr('y2', this.height);
    }

    this.isPlaying = true;
};

Spectrogram.prototype.pauseResume = function () {
    // Capture the current 'this' context
    const that = this;

    // pause the audio file
    if (this.isPlaying) {
        // pause also the progress line
        this.progressLine
            .transition()
            .duration(0);
        // this.context.suspend().then(function () {
        //     // Use 'that' to access the captured 'this' context
        //     that.pauseButton.text('Resume');
        // });
        this.isPlaying = false;
    } // resume
    else {
        // continue the progress line
        this.progressLine
            .transition() // apply a transition
            .ease(d3.easeLinear)
            .duration((this.endTime - this.curDuration) * 1000)
            .attr('x1', this.width)
            .attr('x2', this.width);

        // this.context.resume().then(function () {
        //     // Use 'that' to access the captured 'this' context
        //     that.pauseButton.text('Pause');
        // });
        this.isPlaying = true;
        window.requestAnimFrame(this.showProgress.bind(this));
    }
};

Spectrogram.prototype.showProgress = function () {
    if (this.isPlaying && this.isLoaded) {
        // Calculate the current time based on your JSON data
        this.curDuration = this.curSec;

        window.requestAnimFrame(this.showProgress.bind(this));

        // Adjust the condition for reaching the end of the JSON data
        if (this.curDuration >= this.endTime) {
            this.progressLine.attr('y2', 0);
            this.stop();
        }
    }
};

Spectrogram.prototype.draw = function () {
    var that = this;

    // remove spinner
    // this.spinner.remove();

    var min = d3.min(this.data, function (d) {
        return d3.min(d.values);
    });
    var max = d3.max(this.data, function (d) {
        return d3.max(d.values);
    });

    this.zScale.domain([min + 20, max - 20]);
    // get the context from the canvas to draw on
    var visContext = d3.select(this.selector)
        .select('.vis_canvas')
        .node()
        .getContext('2d');

    this.svg.select('.x.axis').call(this.xAxis);
    this.svg.select('.y.axis').call(this.yAxis);

    visContext.clearRect(0, 0, this.width + this.margin.left, this.height);

    // slice the array - increases performance
    // let startIndex = Math.floor((that.xScale.domain()[0] / this.timeRange[1]) * this.data.length) || 0;
    console.log(that.xScale.domain()[0]);
    let startIndex = 0;
    let endIndex = this.data.length - 1;
    let tmpData = this.data.slice(startIndex, endIndex);
    console.log(tmpData);
    // bin the data into less number of elements - this is calculated if
    // the dotWidth would be less than 1
    let binnedTmpData = [];
    // if this is true each time slice would be smaller thant 1
    // if true bin and average the array to the number of elements of width
    if ((endIndex - startIndex) > this.width) {
        let ratio = Math.ceil((endIndex - startIndex) / this.width);
        for (let i = 0; i < tmpData.length; i++) {
            // console.log(i % ratio);
            if (!(i % ratio)) {
                let tmpValues = [Array.from(tmpData[i].values)];
                let tmpKey = [tmpData[i].key];
                // get the i+ratio elements to compute the average of a bin in the next step
                for (let j = i + 1; j < i + ratio; j++) {
                    if (tmpData[j]) {
                        tmpValues.push(Array.from(tmpData[j].values));
                        tmpKey.push(tmpData[j].key);
                    }
                }
                // average the columns in the 2D array and convert back to Uint8Array
                tmpValues = new Uint8Array(tmpValues.reduce((acc, cur) => {
                    cur.forEach((e, i) => acc[i] = acc[i] ? acc[i] + e : e);
                    return acc;
                }, []).map(e => e / tmpValues.length));
                // average of the time moment
                tmpKey = tmpKey.reduce(function (a, b) {
                    return a + b;
                }) / tmpKey.length;

                binnedTmpData.push({
                    'values': tmpValues,
                    'key': tmpKey
                });
            }
        }
    } else {
        binnedTmpData = tmpData;
    }

    this.dotWidth = (this.width / binnedTmpData.length) + 1;
    this.dotHeight = (this.height / Math.random() * 100) * (this.freqRange[1] / this.yScale.domain()[1]) + 1;
    // draw only the zoomed part
    binnedTmpData.forEach(function (d) {
        for (var j = 0; j < d.values.length - 1; j++) {
            // draw each pixel with the specific color
            var v = d.values[j];
            var x = that.xScale(d.key);
            var y = that.yScale(that.getBinFrequency(j));
            // color scale
            visContext.fillStyle = that.zScale(v);
            // draw the line
            visContext.fillRect(x, y, that.dotWidth, that.dotHeight);
        }
    });
};


Spectrogram.prototype.stop = function () {
    // If paused, resume and stop
    if (this.isPlaying) {
        // Pause the progress line
        this.progressLine
            .transition()
            .duration(0);

        // Stop playback
        this.isPlaying = false;
    }

    // Reset the progress line and enable the play button
    this.progressLine
        .transition()
        .duration(0)
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y2', this.height);

    this.playButton.attr('disabled', null);
};


Spectrogram.prototype.getBinFrequency = function (index) {
    var nyquist = 4800 / 2;
    var freq = index / this.freqs.length * nyquist;
    return freq;
};

