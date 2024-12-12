import React, { useState, useEffect } from 'react';
import { Trash2, Plus, CheckCircle, Circle, Edit2, Calendar, Tag, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CATEGORIES = [
  { id: 1, name: 'Práca', color: 'bg-blue-500', chartColor: '#3B82F6' },
  { id: 2, name: 'Osobné', color: 'bg-green-500', chartColor: '#22C55E' },
  { id: 3, name: 'Nákupy', color: 'bg-purple-500', chartColor: '#A855F7' },
  { id: 4, name: 'Projekt', color: 'bg-yellow-500', chartColor: '#EAB308' }
];

const Statistics = ({ todos }) => {
  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.completed).length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const categoryStats = CATEGORIES.map(cat => ({
    name: cat.name,
    total: todos.filter(todo => todo.category?.id === cat.id).length,
    completed: todos.filter(todo => todo.category?.id === cat.id && todo.completed).length,
    color: cat.chartColor
  }));

  const overdueCount = todos.filter(todo => 
    todo.deadline && !todo.completed && new Date(todo.deadline) < new Date()
  ).length;

  const pieData = categoryStats.filter(stat => stat.total > 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-xl font-bold mb-4">Štatistiky</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">Celkom úloh</h3>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">Dokončené</h3>
          <p className="text-2xl font-bold">{completionRate}%</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">Po termíne</h3>
          <p className="text-2xl font-bold">{overdueCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64">
          <h3 className="text-lg font-semibold mb-2">Rozdelenie podľa kategórií</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="h-64">
          <h3 className="text-lg font-semibold mb-2">Progres podľa kategórií</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryStats.filter(stat => stat.total > 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Celkom" fill="#94A3B8" />
              <Bar dataKey="completed" name="Dokončené" fill="#22C55E" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const TodoApp = () => {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  
  const [newTodo, setNewTodo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deadline, setDeadline] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingTodo, setEditingTodo] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) {
      setError('Prosím zadaj text úlohy');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    const category = selectedCategory ? CATEGORIES.find(c => c.id === parseInt(selectedCategory)) : null;
    
    const todo = {
      id: Date.now(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      category: category,
      deadline: deadline || null
    };
    
    setTodos([...todos, todo]);
    setNewTodo('');
    setDeadline('');
  };

  const updateTodo = (id, newText) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
    setEditingTodo(null);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || todo.category?.id === parseInt(filterCategory);
    return matchesSearch && matchesCategory;
  });

  const formatDeadline = (deadline) => {
    return new Date(deadline).toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'short'
    });
  };

  const isOverdue = (deadline) => {
    return deadline && new Date(deadline) < new Date();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Todo List</h1>
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          {showStats ? (
            <>Skryť štatistiky <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Zobraziť štatistiky <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>
      
      {showStats && <Statistics todos={todos} />}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Vyhľadať úlohy..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Všetky kategórie</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <form onSubmit={addTodo} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Pridaj novú úlohu..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Vyber kategóriu</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      <div className="space-y-2">
        {filteredTodos.map(todo => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              {todo.completed ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>
            
            {editingTodo === todo.id ? (
              <input
                type="text"
                value={todo.text}
                onChange={(e) => updateTodo(todo.id, e.target.value)}
                onBlur={() => setEditingTodo(null)}
                autoFocus
                className="flex-1 px-2 py-1 border rounded"
              />
            ) : (
              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                {todo.text}
              </span>
            )}
            
            {todo.category && (
              <span className={`px-2 py-1 rounded-full text-xs text-white ${todo.category.color}`}>
                {todo.category.name}
              </span>
            )}
            
            {todo.deadline && (
              <span className={`text-sm ${isOverdue(todo.deadline) ? 'text-red-500' : 'text-gray-500'}`}>
                {formatDeadline(todo.deadline)}
              </span>
            )}
            
            <button
              onClick={() => setEditingTodo(todo.id)}
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      
      {filteredTodos.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          {searchTerm || filterCategory !== 'all' 
            ? 'Žiadne úlohy nezodpovedajú filtru'
            : 'Zatiaľ nemáš žiadne úlohy. Začni pridaním novej úlohy!'}
        </p>
      )}
    </div>
  );
};

export default TodoApp;