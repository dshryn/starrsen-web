document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const multiplyBtn = document.getElementById('multiplyBtn');
    const matrixADisplay = document.getElementById('matrixA-display');
    const matrixBDisplay = document.getElementById('matrixB-display');
    const resultDisplay = document.getElementById('result-display');

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
                resultDisplay.innerHTML = ''; // Clear previous result
            });
    });

    multiplyBtn.addEventListener('click', function() {
        try {
            const matrixAData = JSON.parse(matrixADisplay.dataset.matrix);
            const matrixBData = JSON.parse(matrixBDisplay.dataset.matrix);

            fetch('/multiply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ matrixA: matrixAData, matrixB: matrixBData }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.result) {
                    displayMatrix(data.result, resultDisplay);
                } else {
                    resultDisplay.innerHTML = 'Error: ' + data.error;
                }
            })
            .catch(error => {
                resultDisplay.innerHTML = 'Error: ' + error;
            });
        } catch (error) {
            resultDisplay.innerHTML = 'Error: Invalid matrix data. Please generate matrices first.';
        }
    });
});