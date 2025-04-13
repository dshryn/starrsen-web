document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const multiplyBtn = document.getElementById('multiplyBtn');
    const graphBtn = document.getElementById('graphBtn');
    const matrixADisplay = document.getElementById('matrixA-display');
    const matrixBDisplay = document.getElementById('matrixB-display');
    const resultDisplay = document.getElementById('result-display');
    const graphDisplay = document.getElementById('graph-display');
    const graphImage = document.getElementById('graph-image');

    function displayMatrix(matrix, element) {
        let table = '<table>';
        matrix.forEach(row => {
            table += '<tr>';
            row.forEach(cell => {
                table += `<td>${cell}</td>`;
            });
            table += '</tr>';
        });
        table += '</table>';
        element.innerHTML = table;
        element.dataset.matrix = JSON.stringify(matrix); // Store matrix data
    }

    generateBtn.addEventListener('click', function() {
        fetch('/generate_matrices')
            .then(response => response.json())
            .then(data => {
                displayMatrix(data.matrixA, matrixADisplay);
                displayMatrix(data.matrixB, matrixBDisplay);
                resultDisplay.innerHTML = '';
                graphDisplay.style.display = 'none';
            });
    });

    multiplyBtn.addEventListener('click', function() {
        try {
            const matrixAData = JSON.parse(matrixADisplay.dataset.matrix);
            const matrixBData = JSON.parse(matrixBDisplay.dataset.matrix);

            fetch('/multiply_and_plot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ matrixA: matrixAData, matrixB: matrixBData }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.result && data.graph) {
                    displayMatrix(data.result, resultDisplay);
                    graphImage.src = `data:image/png;base64,${data.graph}`;
                    graphDisplay.style.display = 'block';
                } else {
                    resultDisplay.innerHTML = 'Error: ' + (data.error || 'Failed to generate graph.');
                    graphDisplay.style.display = 'none';
                }
            })
            .catch(error => {
                resultDisplay.innerHTML = 'Error: ' + error;
                graphDisplay.style.display = 'none';
            });
        } catch (error) {
            resultDisplay.innerHTML = 'Error: Invalid matrix data. Please generate matrices first.';
            graphDisplay.style.display = 'none';
        }
    });

    graphBtn.addEventListener('click', function() {
        try {
            const matrixAData = JSON.parse(matrixADisplay.dataset.matrix);
            const matrixBData = JSON.parse(matrixBDisplay.dataset.matrix);

            fetch('/multiply_and_plot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ matrixA: matrixAData, matrixB: matrixBData }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.result && data.graph) {
                    displayMatrix(data.result, resultDisplay);
                    graphImage.src = `data:image/png;base64,${data.graph}`;
                    graphDisplay.style.display = 'block';
                } else {
                    resultDisplay.innerHTML = 'Error: ' + (data.error || 'Failed to generate graph.');
                    graphDisplay.style.display = 'none';
                }
            })
            .catch(error => {
                resultDisplay.innerHTML = 'Error: ' + error;
                graphDisplay.style.display = 'none';
            });
        } catch (error) {
            resultDisplay.innerHTML = 'Error: Invalid matrix data. Please generate matrices first.';
            graphDisplay.style.display = 'none';
        }
    });
});