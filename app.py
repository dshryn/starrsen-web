from flask import Flask, render_template, request, jsonify
import numpy as np
import concurrent.futures
import random
import time
import tracemalloc
import io
import base64
import matplotlib.pyplot as plt

app = Flask(__name__)

HYBRID_THRESHOLD = 128

def next_power_of_two(n):
    return 1 << (n - 1).bit_length()

def pad_matrix(A, shape):
    padded = np.zeros(shape, dtype=int)
    for i in range(len(A)):
        for j in range(len(A[i])):
            padded[i][j] = A[i][j]
    return padded

def strassen(A, B):
    n = A.shape[0]
    if n <= HYBRID_THRESHOLD:
        return np.dot(A, B)

    mid = n // 2
    A11, A12 = A[:mid, :mid], A[:mid, mid:]
    A21, A22 = A[mid:, :mid], A[mid:, mid:]
    B11, B12 = B[:mid, :mid], B[:mid, mid:]
    B21, B22 = B[mid:, :mid], B[mid:, mid:]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [
            executor.submit(strassen, A11 + A22, B11 + B22),
            executor.submit(strassen, A21 + A22, B11),
            executor.submit(strassen, A11, B12 - B22),
            executor.submit(strassen, A22, B21 - B11),
            executor.submit(strassen, A11 + A12, B22),
            executor.submit(strassen, A21 - A11, B11 + B12),
            executor.submit(strassen, A12 - A22, B21 + B22),
        ]
        M1, M2, M3, M4, M5, M6, M7 = [f.result() for f in futures]

    C11 = M1 + M4 - M5 + M7
    C12 = M3 + M5
    C21 = M2 + M4
    C22 = M1 - M2 + M3 + M6

    top = np.hstack((C11, C12))
    bottom = np.hstack((C21, C22))
    return np.vstack((top, bottom))

def multiply(A, B):
    assert len(A[0]) == len(B)
    m, k = len(A), len(A[0])
    k2, n = len(B), len(B[0])

    new_m = next_power_of_two(m)
    new_k = next_power_of_two(k)
    new_n = next_power_of_two(n)

    A_pad = pad_matrix(A, (new_m, new_k))
    B_pad = pad_matrix(B, (new_k, new_n))

    C_pad = strassen(A_pad, B_pad)

    return C_pad[:m, :n].tolist()

def plot_memory_time(time_points, memory_points):
    steps = [
        "Before A", "After A",
        "After B", "After Processing"
    ]

    plt.figure(figsize=(10, 6))
    plt.plot(steps, memory_points, marker='o', color='red')
    for i, (t, m) in enumerate(zip(time_points, memory_points)):
        plt.text(i, m + 1, f"{m:.1f}MB\n{t:.4f}s", ha='center')

    plt.xlabel("Step")
    plt.ylabel("Memory Usage (MB)")
    plt.title("Memory Usage Over Time (Strassen's Algorithm)")
    plt.grid(True)
    plt.tight_layout()

    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    img_b64 = base64.b64encode(img.getvalue()).decode()
    plt.close()

    return img_b64

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_matrices')
def generate_matrices():
    size = 128
    matrix_a = [[random.randint(1, 10) for _ in range(size)] for _ in range(size)]
    matrix_b = [[random.randint(1, 10) for _ in range(size)] for _ in range(size)]
    return jsonify({'matrixA': matrix_a, 'matrixB': matrix_b})

@app.route('/multiply_and_plot', methods=['POST'])
def multiply_and_plot():
    try:
        data = request.get_json()
        matrix_a = data['matrixA']
        matrix_b = data['matrixB']

        tracemalloc.start()
        time_points = []
        memory_points = []

        start_time = time.perf_counter()

        # Step 1: Before A
        time_points.append(time.perf_counter() - start_time)
        memory_points.append(tracemalloc.get_traced_memory()[1] / 1024 / 1024)

        A = np.array(matrix_a)

        # Step 2: After A
        time_points.append(time.perf_counter() - start_time)
        memory_points.append(tracemalloc.get_traced_memory()[1] / 1024 / 1024)

        B = np.array(matrix_b)

        # Step 3: After B
        time_points.append(time.perf_counter() - start_time)
        memory_points.append(tracemalloc.get_traced_memory()[1] / 1024 / 1024)

        result = multiply(A, B)

        # Step 4: After Multiply
        time_points.append(time.perf_counter() - start_time)
        memory_points.append(tracemalloc.get_traced_memory()[1] / 1024 / 1024)

        tracemalloc.stop()

        graph_image = plot_memory_time(time_points, memory_points)

        return jsonify({'result': result, 'graph': graph_image})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)