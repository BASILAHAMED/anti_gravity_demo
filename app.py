from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    expression = data.get('expression')
    
    if not expression:
        return jsonify({'result': ''})

    try:
        # Security check: only allow basic math characters
        allowed = set('0123456789+-*/(). ')
        if not all(c in allowed for c in expression):
            return jsonify({'error': 'Invalid input'}), 400
            
        # Evaluate the expression
        # Note: eval() is generally unsafe, but restricted to specific characters it's acceptable for a local demo
        result = eval(expression)
        
        # Handle division by zero or other math errors gracefully if eval doesn't catch them (it raises)
        return jsonify({'result': result})
    except ZeroDivisionError:
        return jsonify({'error': 'Division by zero'}), 400
    except Exception as e:
        return jsonify({'error': 'Error'}), 400

if __name__ == '__main__':
    app.run(debug=True)
