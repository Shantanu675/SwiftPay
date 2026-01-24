import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "../stylesheets/styles.scss";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const API_URL = process.env.REACT_APP_API_URL;
  
  const handleLogin = async (e) => {
    e.preventDefault();
    const payload = { email, password };
  
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert("Login failed: " + (data.message || "Unknown error"));
        return;
      }
  
      localStorage.setItem("token", data.token);
      
      // ADD THESE LINES - Store user data if available
      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));
        login(data.user, data.token); // Update auth context
      } else {
        // If no user data in response, create a basic user object
        const userData = { email: email, name: email.split('@')[0] };
        localStorage.setItem("userData", JSON.stringify(userData));
        login(userData, data.token); // Update auth context
      }
      
      alert("Login successful!");
  
      // Redirect to /home
      navigate("/home");
  
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error: " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="submit-btn btn-login">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;