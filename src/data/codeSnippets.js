// Code snippets for programming typing practice
export const codeSnippets = [
  "function calculateSum(a, b) { return a + b; }",
  
  "const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];",
  
  "if (condition === true) { console.log('Success!'); } else { console.log('Failed!'); }",
  
  "for (let i = 0; i < array.length; i++) { console.log(array[i]); }",
  
  "const fetchData = async () => { const response = await fetch('/api/data'); return response.json(); };",
  
  "class Rectangle { constructor(width, height) { this.width = width; this.height = height; } }",
  
  "const isValid = (email) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);",
  
  "try { const result = JSON.parse(jsonString); } catch (error) { console.error('Invalid JSON:', error); }",
  
  "const numbers = [1, 2, 3, 4, 5].map(n => n * 2).filter(n => n > 5);",
  
  "import React, { useState, useEffect } from 'react'; export default function App() { return <div>Hello World</div>; }",
  
  "SELECT users.name, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.total > 100;",
  
  "def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)",
  
  "public class Main { public static void main(String[] args) { System.out.println(\"Hello, World!\"); } }",
  
  "const express = require('express'); const app = express(); app.listen(3000, () => console.log('Server running'));",
  
  "git add . && git commit -m \"Initial commit\" && git push origin main",
  
  "docker run -d -p 8080:80 --name my-app nginx:latest",
  
  "curl -X POST -H \"Content-Type: application/json\" -d '{\"name\":\"John\"}' http://api.example.com/users",
  
  "npm install --save react react-dom && npm run build && npm start",
  
  "const config = { apiUrl: process.env.API_URL || 'http://localhost:3000', timeout: 5000 };",
  
  "interface User { id: number; name: string; email?: string; } const user: User = { id: 1, name: 'John' };"
];
