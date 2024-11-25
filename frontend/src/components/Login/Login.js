import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import food from '../../assets/foodd.gif'; 
import './login.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        if (email === "abc@gmail.com" && password === "12345") {
            navigate("/dashboard");
            setError("");
        } else {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="login">
            <div className="login-container">
                <div className="login-image">
                    <img src={food} alt="Food" />
                </div>
                <div className="login-form">
                    <h2>Login</h2>
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={handleLogin}>
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Password"
                            />
                        </div>
                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
