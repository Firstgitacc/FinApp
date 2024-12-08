import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const Login = () => {
  const [loginid, setLoginid] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [errors, setErrors] = useState([]); // Added to handle errors

  const navigate = useNavigate(); // Initialize useNavigate hook
  const deviceId = uuidv4(); // Generate a unique device ID for each session
  const loginCredentials = { loginid, loginPassword, deviceId }; // Add deviceId to credentials

  // Button should be disabled if either loginid or loginPassword is empty
  const isSigninButtonDisabled = !loginid || !loginPassword;

  const loginHandler = async (e) => {
    e.preventDefault(); // Prevent form default behavior

    const apiUrl = "http://10.18.114:8000/login"; // Correct the API URL

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginCredentials),
      });

      if (response.ok) {
        // On success, navigate to the header page
        navigate('/Header');
      } else {
        // On failure, handle the error response
        const errorText = await response.text(); // Get the error message from response
        setErrors([errorText]);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors([error.message]);
    }
  };

  return (
    <>
      <form onSubmit={loginHandler}>
        <div>
          <label htmlFor="loginid">Login ID:</label>
          <input 
            type="text" 
            name="loginid" 
            id="loginid" 
            value={loginid} 
            onChange={(e) => setLoginid(e.target.value)} 
          />
        </div>
        <div>
          <label htmlFor="loginPassword">Password:</label>
          <input 
            type="password" 
            name="loginPassword" 
            id="loginPassword" 
            value={loginPassword} 
            onChange={(e) => setLoginPassword(e.target.value)} 
          />
        </div>
        {errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, index) => (
              <p key={index} style={{ color: 'red' }}>
                {error}
              </p>
            ))}
          </div>
        )}
        <button type="submit" disabled={isSigninButtonDisabled}>Sign In</button>
      </form>
    </>
  );
};

export default Login;
